
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
    
    // Get request data
    const { planId, interval = "month", returnUrl } = await req.json();
    
    // Validate request
    if (!planId) {
      throw new Error("ID do plano é obrigatório");
    }
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Usuário não autenticado");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }
    
    // Get subscription plan from database
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();
      
    if (planError || !plan) {
      throw new Error("Plano não encontrado");
    }
    
    // Check if user already has a customer ID
    const { data: subscriptionData } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    let customerId = subscriptionData?.stripe_customer_id;
    
    // If no customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }
    
    // Determine which price to use based on interval
    const priceId = interval === "year" ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly;
    
    // If plan has no Stripe price ID, create products and prices in Stripe
    if (!priceId) {
      console.log("No Stripe price ID found, creating products and prices");
      
      // Create product if it doesn't exist
      if (!plan.stripe_product_id) {
        const product = await stripe.products.create({
          name: plan.title,
          description: plan.description || "",
          metadata: {
            plan_id: plan.id,
          },
        });
        
        // Update product ID in database
        await supabase
          .from("subscription_plans")
          .update({ stripe_product_id: product.id })
          .eq("id", plan.id);
          
        plan.stripe_product_id = product.id;
      }
      
      // Create prices for monthly and annual
      const priceMonthly = await stripe.prices.create({
        product: plan.stripe_product_id,
        unit_amount: Math.round(Number(plan.price_monthly) * 100),
        currency: "brl",
        recurring: { interval: "month" },
        metadata: {
          plan_id: plan.id,
        },
      });
      
      const priceAnnual = await stripe.prices.create({
        product: plan.stripe_product_id,
        unit_amount: Math.round(Number(plan.price_annual) * 100),
        currency: "brl",
        recurring: { interval: "year" },
        metadata: {
          plan_id: plan.id,
        },
      });
      
      // Update price IDs in database
      await supabase
        .from("subscription_plans")
        .update({
          stripe_price_id_monthly: priceMonthly.id,
          stripe_price_id_annual: priceAnnual.id,
        })
        .eq("id", plan.id);
        
      // Use the newly created price ID
      const updatedPriceId = interval === "year" ? priceAnnual.id : priceMonthly.id;
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: updatedPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${returnUrl || req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || req.headers.get("origin")}/payment-canceled`,
        metadata: {
          plan_id: plan.id,
          user_id: user.id,
          billing_interval: interval,
        },
      });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If price ID already exists, use it directly
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl || req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || req.headers.get("origin")}/payment-canceled`,
      metadata: {
        plan_id: plan.id,
        user_id: user.id,
        billing_interval: interval,
      },
    });
    
    // Save/update customer ID to user_subscriptions table
    await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
