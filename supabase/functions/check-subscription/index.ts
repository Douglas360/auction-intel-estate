
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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não encontrada!");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Return a successful response with inactive status when user is not authenticated
      return new Response(JSON.stringify({ 
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      // Return a successful response with inactive status when authentication fails
      return new Response(JSON.stringify({ 
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false,
        error: "Usuário não autenticado"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Changed from error code to success code with error message inside
      });
    }
    
    // Get subscription from database
    const { data: userSubscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        subscription_plan_id,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        billing_interval,
        subscription_plans (*)
      `)
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (subError) {
      console.error("Database error:", subError);
      return new Response(JSON.stringify({ 
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false,
        error: "Erro ao buscar assinatura no banco de dados"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If no subscription found or no customer ID, return inactive
    if (!userSubscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ 
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If there's a subscription ID, check its status in Stripe
    if (userSubscription.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id);
        
        // Update subscription in database
        await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            billing_interval: subscription.items.data[0]?.plan.interval || userSubscription.billing_interval,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userSubscription.id);
          
        // Return updated subscription data
        return new Response(JSON.stringify({
          active: subscription.status === "active",
          plan: userSubscription.subscription_plans,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          billing_interval: subscription.items.data[0]?.plan.interval || userSubscription.billing_interval
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error retrieving Stripe subscription:", error);
        // If subscription not found in Stripe, mark as inactive
        await supabase
          .from("user_subscriptions")
          .update({
            status: "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userSubscription.id);
          
        return new Response(JSON.stringify({ 
          active: false,
          plan: null, 
          current_period_end: null,
          cancel_at_period_end: false,
          error: "Assinatura não encontrada no Stripe"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // If we get here, there's no active subscription
    return new Response(JSON.stringify({ 
      active: false,
      plan: null, 
      current_period_end: null,
      cancel_at_period_end: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      active: false,
      plan: null,
      current_period_end: null,
      cancel_at_period_end: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Changed from error code to success code with error message inside
    });
  }
});
