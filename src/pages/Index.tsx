import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard";
import PricingToggle from "@/components/subscription/PricingToggle";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

const Index = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(true);
  const navigate = useNavigate();
  const { 
    plans: activePlans, 
    subscriptionStatus,
    isLoading,
    subscribeToPlan 
  } = useSubscription();
  const { featuredProperties, isLoading: isLoadingProperties, topProfitProperties, lowestPriceProperties, highestPriceProperties } = useProperties();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.plan?.id === planId;
  };

  const handleSubscribe = (planId: string) => {
    navigate(`/subscribe/${planId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?q=${encodeURIComponent(searchQuery)}`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', session.user.id);
        setFavorites(favs ? favs.map(f => f.property_id) : []);
      }
    };
    fetchUser();
  }, []);

  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (favorites.includes(propertyId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });
      setFavorites([...favorites, propertyId]);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-20">
        {/* Hero section with video background */}
        <div className="relative bg-gray-900 text-white">
          {/* Image Background */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2"
              alt="Background"
              className="absolute w-full h-full object-cover"
              style={{ zIndex: 1 }}
            />
            <div className="absolute inset-0 bg-black opacity-60" style={{ zIndex: 2 }}></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-24 flex flex-col items-center text-center" style={{ zIndex: 3 }}>
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
              <Button 
                onClick={() => setShowPlans(!showPlans)} 
                variant={showPlans ? "default" : "outline"} 
                className={showPlans ? "bg-auction-primary hover:bg-auction-secondary" : "bg-white text-auction-primary hover:bg-gray-100"}
              >
                {showPlans ? "Ocultar Planos" : "Exibir Planos"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subscription plan section - conditionally rendered */}
        {showPlans && (
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
                <div className="flex flex-wrap justify-center gap-8 mt-8">
                  {activePlans.map((plan) => (
                    <div className="w-full md:w-[350px]">
                      <SubscriptionPlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrentPlan={isCurrentPlan(plan.id)}
                        isLoading={false}
                        billingInterval={isYearly ? 'year' : 'month'}
                        onSubscribe={handleSubscribe}
                      />
                    </div>
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
        )}
        
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
              {isLoadingProperties ? (
                <div className="col-span-3 text-center py-10">Carregando imóveis...</div>
              ) : featuredProperties.length > 0 ? (
                featuredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    clickable={true}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">Nenhum imóvel encontrado.</div>
              )}
            </div>
            <div className="text-center mt-8">
              <Button variant="default" onClick={() => navigate('/properties')} className="text-lg">
                Ver Todos os Imóveis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Maiores Rentabilidades */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-4">Maiores Rentabilidades</h2>
              <p className="text-gray-600">
                Imóveis com maior potencial de lucro percentual sobre o valor de compra.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProperties ? (
                <div className="col-span-3 text-center py-10">Carregando imóveis...</div>
              ) : topProfitProperties.length > 0 ? (
                topProfitProperties.map(property => (
                  <div key={property.id} className="relative">
                    <PropertyCard
                      {...property}
                      clickable={true}
                      isFavorite={favorites.includes(property.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      {property.profitability?.toFixed(1)}% rentabilidade
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">Nenhum imóvel encontrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Menores Preços */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-4">Menores Preços</h2>
              <p className="text-gray-600">
                Imóveis com os menores preços de leilão disponíveis.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProperties ? (
                <div className="col-span-3 text-center py-10">Carregando imóveis...</div>
              ) : lowestPriceProperties.length > 0 ? (
                lowestPriceProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    clickable={true}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">Nenhum imóvel encontrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Maiores Preços */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-4">Maiores Preços</h2>
              <p className="text-gray-600">
                Imóveis de alto padrão e grandes oportunidades.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProperties ? (
                <div className="col-span-3 text-center py-10">Carregando imóveis...</div>
              ) : highestPriceProperties.length > 0 ? (
                highestPriceProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    clickable={true}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">Nenhum imóvel encontrado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-light mb-2">EFETUE LOGIN OU CADASTRE-SE</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-2">
            <AlertTriangle className="w-20 h-20 text-orange-400 mb-4" />
            <p className="text-center text-base mb-6 text-gray-700">
              Cadastre-se ou faça login para salvar buscas, selecionar ou descartar imóveis e acessá-los de forma fácil na página em minha conta.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => { setShowAuthModal(false); window.location.href = '/login'; }}>
                Login
              </Button>
              <Button onClick={() => { setShowAuthModal(false); window.location.href = '/register'; }}>
                Cadastre-se
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;
