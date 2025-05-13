
// supabase/functions/check-subscription/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import { corsHeaders } from '../_shared/cors.ts';

interface WebhookPayload {
  user_id?: string;
}

Deno.serve(async (req) => {
  // Lidando com solicitações OPTIONS para habilitar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtendo dados da requisição
    const payload: WebhookPayload = await req.json();
    const userId = payload.user_id;

    // Validando dados da requisição
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          error: 'User ID é necessário',
          active: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Configurando o cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificando o status da assinatura do usuário
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        status,
        current_period_end,
        cancel_at_period_end,
        billing_interval,
        subscription_plan_id,
        subscription_plans:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    // Caso ocorra erro ao buscar a assinatura
    if (subscriptionError) {
      console.error('Erro ao verificar assinatura:', subscriptionError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao verificar status da assinatura',
          active: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Verificando se a assinatura está ativa
    const now = new Date();
    const isActive = subscription?.status === 'active' 
      && subscription?.current_period_end 
      && new Date(subscription.current_period_end) > now;

    // Retornando o status da assinatura
    return new Response(
      JSON.stringify({
        active: isActive,
        plan: subscription?.subscription_plans || null,
        billing_interval: subscription?.billing_interval || null,
        current_period_end: subscription?.current_period_end || null,
        cancel_at_period_end: subscription?.cancel_at_period_end || false
      }),
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
        active: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
