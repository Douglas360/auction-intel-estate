
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
    console.log("Iniciando função create-checkout");
    // Obtendo dados da requisição
    const payload: CheckoutPayload = await req.json();
    const { plan_id, interval, user_id } = payload;
    console.log("Payload recebido:", { plan_id, interval, user_id });

    // Validando dados da requisição
    if (!plan_id || !interval || !user_id) {
      console.error("Dados inválidos na requisição");
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error("Stripe Secret Key não configurada");
      throw new Error("Stripe Secret Key não configurada");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
    console.log("Cliente Stripe configurado");

    // Configurando o cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Cliente Supabase configurado");

    // Buscando informações do plano no banco de dados
    console.log("Buscando plano com ID:", plan_id);
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
      console.error("Plano não encontrado para ID:", plan_id);
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
    console.log("Plano encontrado:", plan);

    // Determinando o preço com base no intervalo selecionado
    const priceId = interval === 'year' 
      ? plan.stripe_price_id_annual 
      : plan.stripe_price_id_monthly;
    
    // Configuração para testes se o preço não estiver configurado
    let lineItems;
    
    if (!priceId) {
      console.log("Preço não configurado, usando configuração de teste");
      // Usar descrição de produto e preço direto
      lineItems = [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${plan.title} (${interval === 'year' ? 'Anual' : 'Mensal'})`,
            description: plan.description || undefined,
          },
          unit_amount: interval === 'year' ? Math.round(plan.price_annual * 100) : Math.round(plan.price_monthly * 100),
          recurring: {
            interval: interval === 'year' ? 'year' : 'month',
          },
        },
        quantity: 1,
      }];
    } else {
      console.log("Usando price_id configurado:", priceId);
      lineItems = [{
        price: priceId,
        quantity: 1,
      }];
    }

    // Em vez de usar auth.admin.getUserById, busque o usuário do banco de dados
    console.log("Buscando informações do usuário:", user_id);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single();
      
    let userEmail;
    
    if (userError) {
      // Tente buscar diretamente da tabela auth.users
      const { data: authUser, error: authUserError } = await supabase
        .from('auth_users')
        .select('email')
        .eq('id', user_id)
        .single();
        
      if (authUserError) {
        console.error('Erro ao buscar informações do usuário:', authUserError);
        // Vamos usar o token Authorization para obter o usuário atual
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Autorização requerida' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          );
        }
        
        const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
        const { data: userData } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        
        if (!userData?.user?.email) {
          return new Response(
            JSON.stringify({ error: 'Não foi possível obter informações do usuário' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        userEmail = userData.user.email;
      } else {
        userEmail = authUser.email;
      }
    } else {
      userEmail = user.email;
    }
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Email do usuário não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log("Email do usuário encontrado:", userEmail);

    // Buscando cliente no Stripe ou criando um novo
    console.log("Verificando se o usuário já possui um cliente no Stripe");
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    // Se o usuário não tem um ID de cliente no Stripe, cria um novo
    if (!customerId) {
      console.log("Cliente Stripe não encontrado, criando novo...");
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: user_id
        }
      });
      customerId = customer.id;
      console.log("Novo cliente Stripe criado:", customerId);

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
      console.log("Registro de assinatura criado/atualizado");
    } else {
      console.log("Cliente Stripe existente encontrado:", customerId);
    }

    // Criando sessão de checkout do Stripe
    console.log("Criando sessão de checkout");
    const origin = req.headers.get('origin') || 'https://95c7cf56-6d4e-4891-b95a-c5e657e9fbef.lovableproject.com';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-canceled`,
      subscription_data: {
        metadata: {
          user_id,
          plan_id
        }
      }
    });
    console.log("Sessão de checkout criada:", session.id, "URL:", session.url);

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
        error: 'Ocorreu um erro ao processar sua solicitação',
        details: err instanceof Error ? err.message : String(err)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
