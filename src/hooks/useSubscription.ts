
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Json } from '@/integrations/supabase/types';

export type SubscriptionPlan = {
  id: string;
  title: string;
  description?: string | null;
  price_monthly: number;
  price_annual: number;
  benefits?: string[] | null;
  status: string;
  stripe_product_id?: string | null;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_annual?: string | null;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to process benefits data from different formats
  const processBenefits = (benefits: Json | null): string[] | null => {
    if (!benefits) return null;
    
    if (Array.isArray(benefits)) {
      return benefits.map(b => String(b));
    }
    
    if (typeof benefits === 'string') {
      try {
        // Try to parse it as JSON if it's a stringified array
        const parsed = JSON.parse(benefits);
        return Array.isArray(parsed) ? parsed.map(b => String(b)) : [benefits];
      } catch {
        // If parsing fails, treat it as a single string
        return [benefits];
      }
    }
    
    // If it's an object or other type, convert to string and return as array
    return [String(benefits)];
  };

  // Check authentication status
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isUserAuthenticated = !!session?.user;
      setIsAuthenticated(isUserAuthenticated);
      return isUserAuthenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Fetch all available plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('status', 'active')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Convert data to SubscriptionPlan type, ensuring benefits are properly handled
      const typedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        benefits: processBenefits(plan.benefits)
      }));
      
      setPlans(typedPlans);
      return typedPlans;
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos de assinatura',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Check current subscription status
  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      const isUserAuthenticated = await checkAuth();
      if (!isUserAuthenticated) {
        console.log('Usuário não autenticado, pulando verificação de assinatura');
        setSubscriptionStatus({
          active: false,
          plan: null,
          current_period_end: null,
          cancel_at_period_end: false
        });
        setIsLoading(false);
        return null;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      setSubscriptionStatus(data);
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Don't show toast if user is not authenticated to avoid unnecessary error messages
      if (isAuthenticated) {
        toast({
          title: 'Erro',
          description: 'Não foi possível verificar seu status de assinatura',
          variant: 'destructive',
        });
      }
      // Set a default status when there's an error
      setSubscriptionStatus({
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false
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
      const isUserAuthenticated = await checkAuth();
      if (!isUserAuthenticated) {
        toast({
          title: 'Atenção',
          description: 'Você precisa estar logado para assinar um plano',
          variant: 'default',
        });
        navigate('/login');
        setIsCheckoutLoading(false);
        return;
      }

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
      const isUserAuthenticated = await checkAuth();
      if (!isUserAuthenticated) {
        toast({
          title: 'Atenção',
          description: 'Você precisa estar logado para gerenciar sua assinatura',
          variant: 'default',
        });
        navigate('/login');
        setIsPortalLoading(false);
        return;
      }

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
    const initializeSubscription = async () => {
      await fetchPlans();
      const isUserAuthenticated = await checkAuth();
      if (isUserAuthenticated) {
        await checkSubscription();
      } else {
        setIsLoading(false);
      }
    };

    initializeSubscription();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_IN') {
        await fetchPlans();
        await checkSubscription();
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
    isAuthenticated,
    checkSubscription,
    subscribeToPlan,
    openCustomerPortal,
    fetchPlans
  };
}
