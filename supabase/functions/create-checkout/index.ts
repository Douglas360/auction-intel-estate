
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import { Stripe } from 'https://esm.sh/stripe@12.0.0?dts';
import { corsHeaders } from '../_shared/cors.ts';

interface CheckoutPayload {
  plan_id: string;
  interval: 'month' | 'year';
  user_id: string;
}

Deno.serve(async (req) => {
  // Lidando com solicitações OPTIONS para habilitar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Obtendo dados da requisição
    const payload: CheckoutPayload = await req.json();
    const { plan_id, interval, user_id } = payload;

    // Validando dados da requisição
    if (!plan_id || !interval || !user_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos. É necessário fornecer plan_id, interval e user_id'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Configurando o cliente Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Configurando o cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscando informações do plano no banco de dados
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    // Verificando se houve erro ao buscar o plano
    if (planError) {
      console.error('Erro ao buscar plano:', planError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar informações do plano'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Verificando se o plano existe
    if (!plan) {
      return new Response(
        JSON.stringify({ 
          error: 'Plano não encontrado'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Determinando o preço com base no intervalo selecionado
    const priceId = interval === 'year' 
      ? plan.stripe_price_id_annual 
      : plan.stripe_price_id_monthly;

    if (!priceId) {
      return new Response(
        JSON.stringify({ 
          error: 'Preço não configurado para este plano'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscando informações do usuário
    const { data: userInfo, error: userError } = await supabase.auth.admin.getUserById(user_id);

    // Verificando se houve erro ao buscar o usuário
    if (userError || !userInfo.user) {
      console.error('Erro ao buscar informações do usuário:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar informações do usuário'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Buscando cliente no Stripe ou criando um novo
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    // Se o usuário não tem um ID de cliente no Stripe, cria um novo
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userInfo.user.email,
        metadata: {
          user_id: user_id
        }
      });
      customerId = customer.id;

      // Cria ou atualiza o registro de assinatura do usuário
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id,
          stripe_customer_id: customerId,
          status: 'incomplete',
          subscription_plan_id: plan_id,
          billing_interval: interval
        });
    }

    // Criando sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/payment-success`,
      cancel_url: `${req.headers.get('origin')}/payment-canceled`,
      subscription_data: {
        metadata: {
          user_id,
          plan_id
        }
      }
    });

    // Retorna a URL de checkout
    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (err) {
    console.error('Erro inesperado:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Ocorreu um erro ao processar sua solicitação'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
