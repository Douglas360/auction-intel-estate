
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY não encontrada!");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
  
  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      console.log("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Get the raw request body
    const body = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    console.log(`Received event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get plan and user info from metadata
        const planId = session.metadata?.plan_id;
        const userId = session.metadata?.user_id;
        const billingInterval = session.metadata?.billing_interval || "month";
        
        if (!planId || !userId) {
          console.log("Missing plan_id or user_id in metadata");
          break;
        }
        
        // Get subscription ID from the session
        let subscriptionId = session.subscription;
        
        // If subscription ID not in session, try to retrieve from list
        if (!subscriptionId && session.customer) {
          const subscriptions = await stripe.subscriptions.list({
            customer: session.customer,
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            subscriptionId = subscriptions.data[0].id;
          }
        }
        
        if (!subscriptionId) {
          console.log("No subscription ID found");
          break;
        }
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Check if promotion code was applied
        let discountDetails = null;
        if (subscription.discount) {
          const { coupon, promotion_code } = subscription.discount;
          discountDetails = {
            coupon_id: coupon.id,
            promotion_code_id: promotion_code,
            discount_type: coupon.percent_off ? 'percentage' : 'amount',
            discount_value: coupon.percent_off || coupon.amount_off / 100,
          };
        }
        
        // Update user_subscriptions table
        await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            subscription_plan_id: planId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            billing_interval: billingInterval,
            updated_at: new Date().toISOString(),
            // If discount was applied, store the details in metadata as JSON
            discount_details: discountDetails ? JSON.stringify(discountDetails) : null,
          }, {
            onConflict: 'user_id',
          });
        
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Find user with this subscription
        const { data: userSub, error } = await supabase
          .from("user_subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
          
        if (error || !userSub) {
          console.log(`No user found for subscription ${subscription.id}`);
          break;
        }
        
        // Check if promotion code/coupon was applied
        let discountDetails = null;
        if (subscription.discount) {
          const { coupon, promotion_code } = subscription.discount;
          discountDetails = {
            coupon_id: coupon.id,
            promotion_code_id: promotion_code,
            discount_type: coupon.percent_off ? 'percentage' : 'amount',
            discount_value: coupon.percent_off || coupon.amount_off / 100,
          };
        }
        
        // Update user_subscriptions table
        await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
            discount_details: discountDetails ? JSON.stringify(discountDetails) : null,
          })
          .eq("id", userSub.id);
        
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Find user with this subscription
        const { data: userSub, error } = await supabase
          .from("user_subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
          
        if (error || !userSub) {
          console.log(`No user found for subscription ${subscription.id}`);
          break;
        }
        
        // Update user_subscriptions table
        await supabase
          .from("user_subscriptions")
          .update({
            status: "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userSub.id);
        
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
