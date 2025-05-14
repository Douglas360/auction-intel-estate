
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscription';

interface PlanSummaryProps {
  selectedPlan: SubscriptionPlan;
  isYearly: boolean;
  setIsYearly: (yearly: boolean) => void;
  handleSubscribe: () => void;
  isCheckoutLoading: boolean;
  authStep: string;
}

const PlanSummary = ({ 
  selectedPlan, 
  isYearly, 
  setIsYearly, 
  handleSubscribe, 
  isCheckoutLoading,
  authStep
}: PlanSummaryProps) => {
  // Format currency in BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{selectedPlan.title}</CardTitle>
            <CardDescription>{selectedPlan.description}</CardDescription>
          </div>
          <Badge className="bg-green-600">Selecionado</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Período de cobrança:</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={!isYearly ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsYearly(false)}
                >
                  Mensal
                </Button>
                <Button 
                  variant={isYearly ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsYearly(true)}
                >
                  Anual
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-center mb-2">
            {formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}
          </div>
          <div className="text-sm text-gray-500 text-center">
            {isYearly ? 'por ano' : 'por mês'}
          </div>

          {isYearly && (
            <div className="bg-green-50 border border-green-100 rounded p-3 text-sm text-green-700 mt-4 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Economize com o pagamento anual!</span>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-3">O que está incluído:</h3>
          <ul className="space-y-2">
            {selectedPlan.benefits && selectedPlan.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}</span>
          </div>
          <div className="text-sm text-gray-500 text-right">
            {isYearly ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSubscribe} 
          className="w-full" 
          size="lg"
          disabled={authStep !== 'confirmed' || isCheckoutLoading}
        >
          {isCheckoutLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Assinar agora'
          )}
        </Button>
        
        {authStep !== 'confirmed' && (
          <div className="text-sm text-amber-600 w-full flex items-center justify-center mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Faça login ou crie uma conta para continuar</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanSummary;
