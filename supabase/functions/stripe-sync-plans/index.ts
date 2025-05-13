import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

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
    // Setup environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { persistSession: false },
    });
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check authentication - we'll now use a simpler approach without requiring admin_users check
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData?.user) {
        userId = userData.user.id;
        console.log("Authenticated user:", userId);
      }
    }

    // Get the operation type and plan data from the request
    const { operation, plan } = await req.json();

    // Handle different operations
    switch (operation) {
      case "create": {
        return await handleCreatePlan(plan, stripe, supabase, corsHeaders);
      }
      case "update": {
        return await handleUpdatePlan(plan, stripe, supabase, corsHeaders);
      }
      case "delete": {
        return await handleDeletePlan(plan.id, stripe, supabase, corsHeaders);
      }
      case "sync": {
        return await handleSyncPlans(stripe, supabase, corsHeaders);
      }
      default: {
        return new Response(JSON.stringify({ error: "Invalid operation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCreatePlan(plan, stripe, supabase, corsHeaders) {
  // Create the product in Stripe
  const product = await stripe.products.create({
    name: plan.title,
    description: plan.description || "",
    metadata: {
      plan_id: plan.id,
    },
  });

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(plan.price_monthly * 100), // Stripe needs amounts in cents
    currency: "brl",
    recurring: { interval: "month" },
    metadata: {
      plan_id: plan.id,
    },
  });

  // Create annual price
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(plan.price_annual * 100), // Stripe needs amounts in cents
    currency: "brl",
    recurring: { interval: "year" },
    metadata: {
      plan_id: plan.id,
    },
  });

  // Update the plan in the database with Stripe IDs
  const { error } = await supabase
    .from("subscription_plans")
    .update({
      stripe_product_id: product.id,
      stripe_price_id_monthly: monthlyPrice.id,
      stripe_price_id_annual: yearlyPrice.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plan.id);

  if (error) {
    throw new Error(`Error updating plan with Stripe IDs: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        stripe_product_id: product.id,
        stripe_price_id_monthly: monthlyPrice.id,
        stripe_price_id_annual: yearlyPrice.id,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleUpdatePlan(plan, stripe, supabase, corsHeaders) {
  if (!plan.stripe_product_id) {
    // If there's no Stripe product ID, create a new plan instead
    return await handleCreatePlan(plan, stripe, supabase, corsHeaders);
  }

  // Update the product in Stripe
  await stripe.products.update(plan.stripe_product_id, {
    name: plan.title,
    description: plan.description || "",
    active: plan.status === "active",
  });

  // Handle price updates
  let updatedFields = {};

  // We need to check if we need to create new prices
  // For price changes in Stripe, we create new price objects
  if (plan.price_monthly_changed) {
    const newMonthlyPrice = await stripe.prices.create({
      product: plan.stripe_product_id,
      unit_amount: Math.round(plan.price_monthly * 100),
      currency: "brl",
      recurring: { interval: "month" },
      metadata: { plan_id: plan.id },
    });
    updatedFields.stripe_price_id_monthly = newMonthlyPrice.id;
  }

  if (plan.price_annual_changed) {
    const newYearlyPrice = await stripe.prices.create({
      product: plan.stripe_product_id,
      unit_amount: Math.round(plan.price_annual * 100),
      currency: "brl",
      recurring: { interval: "year" },
      metadata: { plan_id: plan.id },
    });
    updatedFields.stripe_price_id_annual = newYearlyPrice.id;
  }

  // If we have updated fields, save them to the database
  if (Object.keys(updatedFields).length > 0) {
    updatedFields.updated_at = new Date().toISOString();
    const { error } = await supabase
      .from("subscription_plans")
      .update(updatedFields)
      .eq("id", plan.id);

    if (error) {
      throw new Error(`Error updating plan with Stripe IDs: ${error.message}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedFields,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleDeletePlan(planId, stripe, supabase, corsHeaders) {
  // Get the plan from the database
  const { data: plan, error: fetchError } = await supabase
    .from("subscription_plans")
    .select("stripe_product_id")
    .eq("id", planId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching plan: ${fetchError.message}`);
  }

  // Deactivate the product in Stripe (soft delete)
  if (plan.stripe_product_id) {
    await stripe.products.update(plan.stripe_product_id, {
      active: false,
    });
  }

  // Mark as inactive in our database
  const { error } = await supabase
    .from("subscription_plans")
    .update({
      status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);

  if (error) {
    throw new Error(`Error deactivating plan: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleSyncPlans(stripe, supabase, corsHeaders) {
  // Get all products from Stripe
  const products = await stripe.products.list({
    limit: 100,
    active: true,
  });

  // Get all prices from Stripe
  const prices = await stripe.prices.list({
    limit: 100,
    active: true,
  });

  // Get all plans from our database
  const { data: dbPlans, error } = await supabase
    .from("subscription_plans")
    .select("*");

  if (error) {
    throw new Error(`Error fetching plans: ${error.message}`);
  }

  // Map Stripe products to our database format
  const stripeProductsMap = {};
  products.data.forEach(product => {
    stripeProductsMap[product.id] = {
      title: product.name,
      description: product.description,
      stripe_product_id: product.id,
      status: product.active ? 'active' : 'inactive',
      prices: {
        month: null,
        year: null
      }
    };
  });

  // Map prices to products
  prices.data.forEach(price => {
    if (stripeProductsMap[price.product]) {
      const interval = price.recurring?.interval;
      if (interval === 'month') {
        stripeProductsMap[price.product].prices.month = {
          id: price.id,
          amount: price.unit_amount / 100, // Convert from cents to dollars
        };
      } else if (interval === 'year') {
        stripeProductsMap[price.product].prices.year = {
          id: price.id,
          amount: price.unit_amount / 100, // Convert from cents to dollars
        };
      }
    }
  });

  // Update our database with Stripe data
  const updates = [];
  const inserts = [];

  // For each product in Stripe
  Object.values(stripeProductsMap).forEach((product: any) => {
    const existingPlan = dbPlans.find(plan => plan.stripe_product_id === product.stripe_product_id);

    if (existingPlan) {
      // Update existing plan
      const planUpdate = {
        id: existingPlan.id,
        title: product.title,
        description: product.description,
        status: product.status,
        updated_at: new Date().toISOString(),
      };
      
      if (product.prices.month && product.prices.month.id !== existingPlan.stripe_price_id_monthly) {
        planUpdate.stripe_price_id_monthly = product.prices.month.id;
        planUpdate.price_monthly = product.prices.month.amount;
      }
      
      if (product.prices.year && product.prices.year.id !== existingPlan.stripe_price_id_annual) {
        planUpdate.stripe_price_id_annual = product.prices.year.id;
        planUpdate.price_annual = product.prices.year.amount;
      }
      
      updates.push(planUpdate);
    } else {
      // Create new plan if it has both monthly and yearly prices
      if (product.prices.month && product.prices.year) {
        inserts.push({
          title: product.title,
          description: product.description,
          price_monthly: product.prices.month.amount,
          price_annual: product.prices.year.amount,
          status: product.status,
          stripe_product_id: product.stripe_product_id,
          stripe_price_id_monthly: product.prices.month.id,
          stripe_price_id_annual: product.prices.year.id,
          benefits: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  });

  // Apply updates
  for (const update of updates) {
    const { error } = await supabase
      .from("subscription_plans")
      .update(update)
      .eq("id", update.id);
    
    if (error) {
      console.error("Error updating plan:", error);
    }
  }

  // Apply inserts
  if (inserts.length > 0) {
    const { error } = await supabase
      .from("subscription_plans")
      .insert(inserts);
    
    if (error) {
      console.error("Error inserting plans:", error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      updates: updates.length,
      inserts: inserts.length,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
