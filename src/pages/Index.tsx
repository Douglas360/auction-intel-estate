
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, TrendingUp, Shield, Clock, Users, Eye, Calculator, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlansSection, setShowPlansSection] = useState(true);

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch plans visibility setting
  useEffect(() => {
    const fetchPlansVisibility = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('show_plans_section')
        .single();
      
      if (data) {
        setShowPlansSection(data.show_plans_section ?? true);
      }
    };
    
    fetchPlansVisibility();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to properties page with search query
    window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-auction-primary to-auction-secondary text-white pt-20">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Encontre Imóveis em Leilão com Até{' '}
                <span className="text-yellow-300">70% de Desconto</span>
              </h1>
              <p className="text-xl mb-8 opacity-90">
                A maior plataforma de leilões imobiliários do Brasil. Oportunidades únicas para investidores e compradores.
              </p>
              <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Busque por cidade, tipo de imóvel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3 text-lg bg-white text-gray-900"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                  Buscar
                </Button>
              </form>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Atualizado Diariamente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>+50 mil usuários</span>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <img 
                src="/placeholder.svg" 
                alt="Casa em leilão" 
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-auction-primary mb-2">15,847</div>
              <div className="text-gray-600">Imóveis Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-auction-primary mb-2">R$ 2.1B</div>
              <div className="text-gray-600">Em Negócios Fechados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-auction-primary mb-2">45%</div>
              <div className="text-gray-600">Desconto Médio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-auction-primary mb-2">98%</div>
              <div className="text-gray-600">Clientes Satisfeitos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Oportunidades em Destaque</h2>
            <p className="text-xl text-gray-600">Os melhores negócios selecionados pela nossa equipe</p>
          </div>
          
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  address={property.address}
                  city={property.city}
                  state={property.state}
                  imageUrl={property.images && property.images.length > 0 ? property.images[0] : undefined}
                  auctionPrice={property.auction_price}
                  marketPrice={property.market_price}
                  discount={property.discount || 0}
                  auctionDate={property.auction_date || ''}
                  auctionType={property.auction_type}
                  riskLevel={property.discount && property.discount < 30 ? 'low' : property.discount && property.discount < 50 ? 'medium' : 'high'}
                  clickable={true}
                  allow_consorcio={property.allow_consorcio}
                  allow_fgts={property.allow_fgts}
                  allow_financing={property.allow_financing}
                />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/properties">Ver Todos os Imóveis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Processo simples e transparente para encontrar seu imóvel ideal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Busque</h3>
              <p className="text-gray-600">Encontre imóveis por localização, tipo ou faixa de preço</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Analise</h3>
              <p className="text-gray-600">Veja fotos, documentos e análise detalhada de cada propriedade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Simule</h3>
              <p className="text-gray-600">Use nossa calculadora para estimar custos e rentabilidade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Arremate</h3>
              <p className="text-gray-600">Participe do leilão e arremate sua propriedade dos sonhos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Conditionally rendered */}
      {showPlansSection && (
        <section className="py-16 bg-gradient-to-r from-auction-primary to-auction-secondary">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos e Preços</h2>
              <p className="text-xl text-white opacity-90">Escolha o plano ideal para suas necessidades</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Básico</CardTitle>
                  <div className="text-4xl font-bold text-auction-primary">Grátis</div>
                  <p className="text-gray-600">Para exploradores</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Acesso a lista básica de imóveis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Filtros básicos de busca</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Simulador básico</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/pricing">Começar Grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="relative border-auction-primary border-2 shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-auction-primary text-white px-4 py-1">Mais Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <div className="text-4xl font-bold text-auction-primary">R$ 97<span className="text-lg">/mês</span></div>
                  <p className="text-gray-600">Para investidores sérios</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Acesso ilimitado a todos os imóveis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Análise de mercado detalhada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Alertas personalizados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Relatórios de rentabilidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-auction-primary hover:bg-auction-secondary" asChild>
                    <Link to="/pricing">Assinar Premium</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* VIP Plan */}
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">VIP</CardTitle>
                  <div className="text-4xl font-bold text-auction-primary">R$ 197<span className="text-lg">/mês</span></div>
                  <p className="text-gray-600">Para profissionais</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Tudo do plano Premium</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>API para integrações</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Consultoria especializada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Relatórios personalizados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Acesso antecipado a novos leilões</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/pricing">Assinar VIP</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por Que Escolher a HAU?</h2>
            <p className="text-xl text-gray-600">Vantagens exclusivas para nossos usuários</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maior Rentabilidade</h3>
              <p className="text-gray-600">Imóveis com descontos de até 70% do valor de mercado, maximizando seu retorno sobre investimento.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Jurídica</h3>
              <p className="text-gray-600">Todos os leilões são acompanhados por nossa equipe jurídica especializada.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atualizações em Tempo Real</h3>
              <p className="text-gray-600">Base de dados atualizada diariamente com novas oportunidades de investimento.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
