
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
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Error getting user");
    }
    
    // Check if the user is already subscribed
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (existingSubscription) {
      // User is already subscribed, send them to the customer portal to manage their subscription
      const { data: portalData } = await stripe.billingPortal.sessions.create({
        customer: existingSubscription.stripe_customer_id,
        return_url: `${req.headers.get("origin")}`,
      });
      
      return new Response(
        JSON.stringify({ url: portalData.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the request body
    const { plan_id, interval = 'month', coupon_code } = await req.json();
    
    if (!plan_id) {
      throw new Error("No plan_id provided");
    }
    
    // Get the subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();
    
    if (planError || !plan) {
      throw new Error(`Error getting plan: ${planError?.message || 'Plan not found'}`);
    }
    
    // Check if the user already exists as a Stripe customer
    let customer;
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      // Create a new customer
      customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          user_id: userData.user.id
        }
      });
    }
    
    // Determine which price to use
    const priceId = interval === 'month' 
      ? plan.stripe_price_id_monthly 
      : plan.stripe_price_id_annual;
    
    if (!priceId) {
      throw new Error(`No price found for ${interval} interval`);
    }
    
    // Create checkout parameters
    const checkoutParams: any = {
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      metadata: {
        user_id: userData.user.id,
        plan_id: plan_id,
        billing_interval: interval
      },
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
    };
    
    // If a specific coupon code was provided, apply it
    if (coupon_code) {
      // Find the promotion code by code
      const promotionCodes = await stripe.promotionCodes.list({
        code: coupon_code,
        active: true,
        limit: 1
      });
      
      if (promotionCodes.data.length > 0) {
        checkoutParams.discounts = [
          {
            promotion_code: promotionCodes.data[0].id
          }
        ];
      }
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);
    
    // Return the checkout URL
    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
