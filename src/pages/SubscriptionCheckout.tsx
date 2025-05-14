
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthSection from '@/components/subscription/AuthSection';
import PlanSummary from '@/components/subscription/PlanSummary';

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [isYearly, setIsYearly] = useState(false);
  const { plans, subscribeToPlan, isLoading, isCheckoutLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [authStep, setAuthStep] = useState<'check' | 'login' | 'register' | 'confirmed'>('check');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast({
          title: "Plano não encontrado",
          description: "O plano selecionado não foi encontrado.",
          variant: "destructive",
        });
        navigate('/pricing');
      }
    }
    
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthStep('confirmed');
      } else {
        setAuthStep('login');
      }
    };
    
    checkAuth();
  }, [plans, planId, navigate]);

  const handleSubscribe = () => {
    if (selectedPlan) {
      subscribeToPlan(selectedPlan.id, isYearly ? 'year' : 'month');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-3xl mx-auto px-4 pt-20 pb-16">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-3xl mx-auto px-4 pt-20 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Plano não encontrado</h2>
              <p className="text-gray-500 mb-4">O plano selecionado não foi encontrado.</p>
              <button 
                onClick={() => navigate('/pricing')} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Ver planos disponíveis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Assinar {selectedPlan.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AuthSection 
              authStep={authStep}
              setAuthStep={setAuthStep}
              isAuthLoading={isAuthLoading}
              setIsAuthLoading={setIsAuthLoading}
            />
          </div>
          
          <div>
            <PlanSummary 
              selectedPlan={selectedPlan}
              isYearly={isYearly}
              setIsYearly={setIsYearly}
              handleSubscribe={handleSubscribe}
              isCheckoutLoading={isCheckoutLoading}
              authStep={authStep}
            />
            
            <div className="mt-4 text-sm text-center text-gray-500">
              Ao assinar, você concorda com nossos termos de serviço e política de privacidade.
              <br />Você pode cancelar sua assinatura a qualquer momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
