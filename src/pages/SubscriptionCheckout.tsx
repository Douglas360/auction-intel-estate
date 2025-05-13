
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [isYearly, setIsYearly] = useState(false);
  const { 
    plans, 
    subscribeToPlan, 
    isLoading, 
    isCheckoutLoading 
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
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
  }, [plans, planId, navigate]);

  const handleSubscribe = () => {
    if (selectedPlan) {
      subscribeToPlan(selectedPlan.id, isYearly ? 'year' : 'month');
    }
  };

  // Format currency in BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
          <Card>
            <CardHeader>
              <CardTitle>Plano não encontrado</CardTitle>
              <CardDescription>
                Não encontramos o plano selecionado. Por favor, escolha um plano na página de preços.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/pricing')}>Ver planos disponíveis</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-3xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Assinatura</h1>

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
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isYearly ? 'por ano' : 'por mês'}
                  </div>
                </div>
              </div>

              {isYearly && (
                <div className="bg-green-50 border border-green-100 rounded p-3 text-sm text-green-700 mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
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
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
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
            </div>

            <Button 
              onClick={handleSubscribe} 
              className="w-full" 
              size="lg"
              disabled={isCheckoutLoading}
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

            <div className="text-sm text-center text-gray-500">
              Ao assinar, você concorda com nossos termos de serviço e política de privacidade.
              <br />Você pode cancelar sua assinatura a qualquer momento.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
