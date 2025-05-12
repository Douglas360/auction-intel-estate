
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserSubscription = () => {
  const { 
    subscriptionStatus, 
    plans,
    isLoading, 
    isPortalLoading, 
    openCustomerPortal,
    subscribeToPlan 
  } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Carregando informações da sua assinatura...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getFreePlan = () => {
    return plans.find(plan => plan.title === 'Free');
  };

  if (!subscriptionStatus?.active) {
    const freePlan = getFreePlan();
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>Você está no plano gratuito</CardDescription>
            </div>
            <Badge variant="outline" className="bg-gray-100">
              Gratuito
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Faça upgrade para um plano premium e aproveite todos os recursos disponíveis.
            </p>
            <Button onClick={() => subscribeToPlan(freePlan?.id || '')}>
              Ver Planos Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>Gerenciar minha assinatura</CardDescription>
          </div>
          <Badge variant="default" className="bg-green-600">
            {subscriptionStatus.plan?.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">
              {subscriptionStatus.cancel_at_period_end 
                ? `Acesso até ${formatDate(subscriptionStatus.current_period_end)}` 
                : `Próxima cobrança em ${formatDate(subscriptionStatus.current_period_end)}`}
            </span>
          </div>
          
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">
              {subscriptionStatus.billing_interval === 'month' ? 'Cobrança mensal' : 'Cobrança anual'}
            </span>
          </div>
        </div>
        
        {subscriptionStatus.cancel_at_period_end && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
            Sua assinatura será cancelada ao final do período atual. Você manterá acesso a todos os recursos até {formatDate(subscriptionStatus.current_period_end)}.
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={openCustomerPortal} 
            variant="outline"
            disabled={isPortalLoading}
            className="w-full sm:w-auto"
          >
            {isPortalLoading ? 'Processando...' : 'Gerenciar Assinatura'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscription;
