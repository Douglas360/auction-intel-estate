
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export type SubscriptionPlan = {
  id: string;
  title: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  benefits?: string[] | string;
  status: string;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
};

export type SubscriptionStatus = {
  active: boolean;
  plan: SubscriptionPlan | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  billing_interval?: 'month' | 'year';
};

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all available plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('status', 'active')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos de assinatura',
        variant: 'destructive',
      });
    }
  };

  // Check current subscription status
  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      setSubscriptionStatus(data);
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar seu status de assinatura',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string, billingInterval: 'month' | 'year' = 'month') => {
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          interval: billingInterval,
          returnUrl: window.location.origin + '/dashboard',
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o processo de assinatura',
        variant: 'destructive',
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Open customer portal to manage subscription
  const openCustomerPortal = async () => {
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          returnUrl: window.location.origin + '/dashboard',
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal de gerenciamento',
        variant: 'destructive',
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchPlans();
    checkSubscription();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        checkSubscription();
        fetchPlans();
      } else if (event === 'SIGNED_OUT') {
        setSubscriptionStatus(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    subscriptionStatus,
    plans,
    isLoading,
    isCheckoutLoading,
    isPortalLoading,
    checkSubscription,
    subscribeToPlan,
    openCustomerPortal,
  };
}
