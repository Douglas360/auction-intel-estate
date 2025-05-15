
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from 'lucide-react';
import { type SubscriptionPlan as SubscriptionPlanType } from '@/hooks/useSubscription';

export type SubscriptionPlan = SubscriptionPlanType;

type SubscriptionPlanCardProps = {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  billingInterval?: 'month' | 'year';
  onSubscribe: (planId: string) => void;
};

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  isLoading = false,
  billingInterval = 'month',
  onSubscribe,
}) => {
  // Format price with Brazilian currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Define formatCurrency to use the same formatter
  const formatCurrency = formatPrice;

  // Parse benefits from JSON string or array
  const parseBenefits = (): string[] => {
    if (!plan.benefits) return [];
    if (typeof plan.benefits === 'string') {
      try {
        return JSON.parse(plan.benefits);
      } catch (e) {
        return [plan.benefits];
      }
    }
    return plan.benefits as string[];
  };

  // Calculate current price based on billing interval
  const currentPrice = billingInterval === 'month' ? plan.price_monthly : plan.price_annual;
  const benefits = parseBenefits();

  return (
    <Card className={`flex flex-col ${isCurrentPlan ? 'border-green-500 ring-1 ring-green-500' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute top-4 right-4 bg-green-500">
          Seu Plano
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{plan.title}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <p className="text-3xl font-bold">
            {currentPrice > 0 ? formatPrice(currentPrice) : 'Grátis'}
            {currentPrice > 0 && <span className="text-sm font-normal text-muted-foreground ml-1">/{billingInterval === 'month' ? 'mês' : 'ano'}</span>}
          </p>
          {currentPrice > 0 && plan.price_annual > 0 && billingInterval === 'year' && (
            <p className="text-sm text-muted-foreground">
              Economia de {formatCurrency((plan.price_monthly * 12) - plan.price_annual)} por ano
            </p>
          )}
        </div>
        
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSubscribe(plan.id)}
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isLoading || (isCurrentPlan && plan.title !== 'Free')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isCurrentPlan ? "Plano Atual" : "Assinar"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlanCard;
