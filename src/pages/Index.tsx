
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard";
import PricingToggle from "@/components/subscription/PricingToggle";
import PropertyCard from "@/components/PropertyCard";
import { toast } from "@/components/ui/use-toast";

// Mock data for featured properties
const featuredProperties = [
  {
    id: '1',
    title: 'Apartamento 3 dormitórios na Vila Mariana',
    type: 'Apartamento',
    address: 'Rua Domingos de Morais, 2455, Apto 82',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 455000,
    marketPrice: 650000,
    discount: 30,
    auctionDate: '2025-06-15',
    auctionType: 'Judicial',
    riskLevel: 'low' as 'low',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
  },
  {
    id: '2',
    title: 'Casa em condomínio fechado',
    type: 'Casa',
    address: 'Alameda dos Nhambiquaras, 1050, Casa 14',
    city: 'Cotia',
    state: 'SP',
    auctionPrice: 510000,
    marketPrice: 850000,
    discount: 40,
    auctionDate: '2025-07-10',
    auctionType: 'Extrajudicial',
    riskLevel: 'medium' as 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'
  },
  {
    id: '3',
    title: 'Sala comercial no Centro',
    type: 'Comercial',
    address: 'Avenida Paulista, 1578, Sala 302',
    city: 'Rio de Janeiro',
    state: 'RJ',
    auctionPrice: 247000,
    marketPrice: 380000,
    discount: 35,
    auctionDate: '2025-06-28',
    auctionType: 'Banco',
    riskLevel: 'high' as 'high',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2'
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isYearly, setIsYearly] = useState(false);
  const { plans, subscribeToPlan, subscriptionStatus, isLoading } = useSubscription();
  const [activePlans, setActivePlans] = useState<SubscriptionPlan[]>([]);

  // Filter to show only paid plans on homepage
  useEffect(() => {
    if (plans.length > 0) {
      setActivePlans(plans.filter(plan => plan.price_monthly > 0));
    }
  }, [plans]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubscribe = (planId: string) => {
    subscribeToPlan(planId, isYearly ? 'year' : 'month');
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.active && subscriptionStatus.plan?.id === planId;
  };

  return (
    <>
      <Navbar />
      <div className="pt-20">
        {/* Hero section */}
        <div className="relative bg-gray-900 text-white">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-20 bg-cover bg-center" />
          <div className="relative container mx-auto px-4 py-24 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 max-w-4xl">
              Encontre as melhores oportunidades de imóveis em leilões
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl opacity-90">
              Imóveis com até 50% de desconto do valor de mercado. Sua chance de fazer o melhor investimento.
            </p>
            
            <form onSubmit={handleSearch} className="flex w-full max-w-lg mb-10">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por cidade, bairro ou tipo de imóvel..."
                  className="pl-10 h-12 text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2 h-12">
                Buscar
              </Button>
            </form>
            
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/properties')} variant="outline" className="bg-white text-gray-900 hover:bg-gray-100">
                Ver Todos Imóveis
              </Button>
              <Button onClick={() => navigate('/simulator')} variant="secondary">
                Simulador de Lucro
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subscription plan section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-4">Escolha o Plano Ideal Para Você</h2>
              <p className="text-gray-600">
                Tenha acesso ao maior banco de dados de imóveis em leilão do Brasil e ferramentas exclusivas para ampliar seus resultados.
              </p>
            </div>
            
            <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
            
            {activePlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {activePlans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan(plan.id)}
                    isLoading={isLoading}
                    billingInterval={isYearly ? 'year' : 'month'}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p>Carregando planos...</p>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/pricing')} variant="outline" className="text-lg">
                Ver Detalhes dos Planos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* How it works section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
              <p className="text-gray-600">
                Três passos simples para encontrar e adquirir imóveis com descontos incríveis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 border-t-4 border-auction-primary">
                <div className="rounded-full bg-auction-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-auction-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Busque Imóveis</h3>
                <p className="text-gray-600">
                  Use nossos filtros avançados para encontrar imóveis em leilão que atendam aos seus critérios de investimento.
                </p>
              </Card>
              
              <Card className="p-6 border-t-4 border-auction-primary">
                <div className="rounded-full bg-auction-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-auction-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analise Riscos</h3>
                <p className="text-gray-600">
                  Use nossa ferramenta de análise jurídica para avaliar os riscos e potenciais problemas do leilão.
                </p>
              </Card>
              
              <Card className="p-6 border-t-4 border-auction-primary">
                <div className="rounded-full bg-auction-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-auction-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Participe do Leilão</h3>
                <p className="text-gray-600">
                  Com tudo analisado, participe do leilão com segurança e adquira o imóvel com desconto.
                </p>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Featured properties section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-4">Imóveis em Destaque</h2>
              <p className="text-gray-600">
                Confira algumas das melhores oportunidades disponíveis agora.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard 
                  key={property.id}
                  {...property}
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="default" onClick={() => navigate('/properties')} className="text-lg">
                Ver Todos os Imóveis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
