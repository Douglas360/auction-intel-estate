import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionPlanCard from '@/components/subscription/SubscriptionPlanCard';
import PricingToggle from '@/components/subscription/PricingToggle';
import { Separator } from '@/components/ui/separator';

const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const { 
    plans, 
    subscriptionStatus, 
    isLoading
  } = useSubscription();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = (planId: string) => {
    navigate(`/subscribe/${planId}`);
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.active && subscriptionStatus.plan?.id === planId;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Escolha o Plano Ideal para Você</h1>
          <p className="text-lg text-gray-600">
            Tenha acesso a leilões exclusivos com os melhores descontos do mercado e ferramentas para maximizar seus investimentos.
          </p>
        </div>

        <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />

        <div className="flex flex-wrap justify-center gap-8 mt-8">
          {plans.map((plan) => (
            <div className="w-full md:w-[350px]">
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan(plan.id)}
                isLoading={isLoading}
                billingInterval={isYearly ? 'year' : 'month'}
                onSubscribe={handleSubscribe}
              />
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto" id="faq">
          <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Como funciona o período de teste?</h3>
              <p className="text-gray-600">
                Oferecemos 7 dias de teste gratuito em todos os planos pagos. Você pode cancelar a qualquer momento antes do término do período de teste e não será cobrado.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Posso mudar de plano depois?</h3>
              <p className="text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Se fizer upgrade, receberá acesso imediato aos novos recursos. Se fizer downgrade, as mudanças serão aplicadas no próximo ciclo de cobrança.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Como posso cancelar minha assinatura?</h3>
              <p className="text-gray-600">
                Você pode cancelar sua assinatura a qualquer momento através do seu painel de controle. Após o cancelamento, você terá acesso aos recursos premium até o final do período atual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
