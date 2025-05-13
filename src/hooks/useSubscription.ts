
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  benefits: string[] | null;
  status: string;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
}

interface SubscriptionStatus {
  active: boolean;
  plan: SubscriptionPlan | null;
  billing_interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
  const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);

  // Verificar se o usuário está autenticado
  const checkAuthentication = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  };

  // Buscar os planos disponíveis
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      
      if (data) {
        setPlans(data as SubscriptionPlan[]);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos disponíveis.",
        variant: "destructive",
      });
    }
  };

  // Verificar o status da assinatura do usuário
  const checkSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      // Verifica se o usuário está autenticado
      const user = await checkAuthentication();
      
      if (!user) {
        // Se não estiver autenticado, não faz a verificação
        setSubscriptionStatus({
          active: false,
          plan: null,
          billing_interval: null,
          current_period_end: null,
          cancel_at_period_end: false,
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { user_id: user.id },
      });

      if (error) {
        console.error('Erro ao verificar status da assinatura:', error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar seu status de assinatura.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar seu status de assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Assinar um plano
  const subscribeToPlan = async (planId: string, interval: 'month' | 'year' = 'month') => {
    setIsCheckoutLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      const user = await checkAuthentication();
      
      if (!user) {
        toast({
          title: "Atenção",
          description: "Você precisa estar logado para assinar um plano.",
          variant: "default",
        });
        // Redirecionar para login (em uma implementação real)
        return;
      }

      // Criar checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan_id: planId,
          interval: interval,
          user_id: user.id,
        },
      });

      if (error) throw error;

      // Redirecionar para a página de checkout do Stripe
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('URL de checkout não encontrada');
      }
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Abrir o portal do cliente
  const openCustomerPortal = async () => {
    setIsPortalLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      const user = await checkAuthentication();
      
      if (!user) {
        toast({
          title: "Atenção",
          description: "Você precisa estar logado para gerenciar sua assinatura.",
          variant: "default",
        });
        return;
      }

      // Obter URL do portal do cliente
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      // Redirecionar para o portal do cliente
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL do portal não encontrada');
      }
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao acessar o portal de gerenciamento.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  // Carregar planos e status da assinatura quando o componente for montado
  useEffect(() => {
    fetchPlans();
    checkSubscriptionStatus();
  }, []);

  return {
    plans,
    subscriptionStatus,
    isLoading,
    isCheckoutLoading,
    isPortalLoading,
    subscribeToPlan,
    fetchPlans,
    checkSubscriptionStatus,
    openCustomerPortal,
  };
};

export default useSubscription;
