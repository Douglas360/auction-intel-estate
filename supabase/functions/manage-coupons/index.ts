
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if the requesting user is an admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Apenas administradores podem gerenciar cupons' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Parse the request body
    const { action, coupon } = await req.json();

    switch (action) {
      case 'list':
        // List all coupons
        const coupons = await stripe.coupons.list({ limit: 100 });
        
        // Get promotion codes associated with each coupon
        const couponData = [];
        for (const coupon of coupons.data) {
          const promotionCodes = await stripe.promotionCodes.list({
            coupon: coupon.id,
            limit: 100
          });
          
          couponData.push({
            ...coupon,
            promotion_codes: promotionCodes.data
          });
        }
        
        return new Response(
          JSON.stringify(couponData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
        
      case 'create':
        // Create a new coupon in Stripe
        const { name, percent_off, amount_off, currency, duration, duration_in_months, max_redemptions } = coupon;
        
        // Validate required fields
        if (!name || (!percent_off && !amount_off)) {
          return new Response(
            JSON.stringify({ success: false, message: 'Dados incompletos para criar cupom' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Create coupon parameters
        const couponParams: any = {
          name,
          duration: duration || 'once',
        };
        
        // Add either percent_off or amount_off
        if (percent_off) {
          couponParams.percent_off = percent_off;
        } else {
          couponParams.amount_off = amount_off * 100; // Convert to cents
          couponParams.currency = currency || 'brl';
        }
        
        // Add optional parameters if provided
        if (duration === 'repeating' && duration_in_months) {
          couponParams.duration_in_months = duration_in_months;
        }
        
        if (max_redemptions) {
          couponParams.max_redemptions = max_redemptions;
        }
        
        // Create the coupon in Stripe
        const newCoupon = await stripe.coupons.create(couponParams);
        
        // Create a promotion code for the coupon
        const code = coupon.code || generateRandomCode(8);
        const promotionCode = await stripe.promotionCodes.create({
          coupon: newCoupon.id,
          code,
          expires_at: coupon.expires_at ? Math.floor(new Date(coupon.expires_at).getTime() / 1000) : undefined,
          max_redemptions: coupon.max_redemptions,
        });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            coupon: newCoupon,
            promotion_code: promotionCode 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
        
      case 'delete':
        // Delete a coupon from Stripe
        const { id } = coupon;
        
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, message: 'ID do cupom não fornecido' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        const deletedCoupon = await stripe.coupons.del(id);
        
        return new Response(
          JSON.stringify({ success: true, deleted: deletedCoupon }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
        
      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Ação desconhecida' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

// Helper function to generate a random code
function generateRandomCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
