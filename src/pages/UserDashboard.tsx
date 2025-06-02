
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UserDashboardHeader from '@/components/UserDashboardHeader';
import UserFavorites from '@/components/UserFavorites';
import UserAlerts from '@/components/UserAlerts';
import UserProfile from '@/components/UserProfile';
import UserSubscription from '@/components/UserSubscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchFilters, { defaultFilters } from '@/components/SearchFilters';
import PropertyCard from '@/components/PropertyCard';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import ProfitSimulator from '@/components/ProfitSimulator';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useProperties } from '@/hooks/useProperties';
import { Tables } from '@/integrations/supabase/types';
import PropertyListItem from '@/components/PropertyListItem';
import { Button } from "@/components/ui/button";
import useSWR from 'swr';

type Property = Tables<'properties'>;

interface PropertyData {
  data: Property[] | null;
  count: number | null;
}

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("busca");
  const [user, setUser] = useState<any>(null);
  const { subscriptionStatus } = useSubscription();
  const { properties, isLoading, error } = useProperties();
  const [filters, setFilters] = useState<any>(defaultFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('discount');
  const itemsPerPage = 12;
  const [pageProperties, setPageProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [filteredTotal, setFilteredTotal] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Função para buscar imóveis paginados direto do Supabase
  const fetchPropertiesPage = async (filters: any, page = 1, pageSize = 12): Promise<PropertyData> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase.from('properties').select('*', { count: 'exact' });
    
    // Apply filters step by step to avoid complex type inference
    if (filters.state && filters.state !== '') {
      query = query.eq('state', filters.state);
    }
    
    if (filters.location && filters.location !== '') {
      const locationFilter = `city.ilike.%${filters.location}%,address.ilike.%${filters.location}%,type.ilike.%${filters.location}%,state.ilike.%${filters.location}%`;
      query = query.or(locationFilter);
    }
    
    if (filters.propertyType && filters.propertyType !== '') {
      query = query.eq('type', filters.propertyType);
    }
    
    if (filters.auctionType && filters.auctionType !== '') {
      query = query.eq('auction_type', filters.auctionType);
    }
    
    if (filters.discount && filters.discount > 0) {
      query = query.gte('discount', filters.discount);
    }
    
    if (filters.minPrice && filters.minPrice > 0) {
      query = query.gte('auction_price', filters.minPrice);
    }
    
    if (filters.maxPrice && filters.maxPrice > 0) {
      query = query.lte('auction_price', filters.maxPrice);
    }
    
    if (filters.bedrooms && filters.bedrooms !== '') {
      query = query.gte('bedrooms', Number(filters.bedrooms));
    }
    
    if (filters.garage && filters.garage !== '') {
      query = query.gte('garage', Number(filters.garage));
    }
    
    if (filters.allow_financing) {
      query = query.eq('allow_financing', true);
    }
    
    if (filters.allow_consorcio) {
      query = query.eq('allow_consorcio', true);
    }
    
    if (filters.allow_fgts) {
      query = query.eq('allow_fgts', true);
    }
    
    if (filters.allow_parcelamento) {
      query = query.eq('allow_parcelamento', true);
    }
    
    query = query.order('created_at', { ascending: false }).range(from, to);
    
    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  };

  // SWR para buscar imóveis
  const { data: swrData, error: swrError, isValidating } = useSWR(
    [filters, currentPage, itemsPerPage],
    ([filters, page, pageSize]) => fetchPropertiesPage(filters, page, pageSize),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        // Buscar favoritos do usuário (apenas os ids)
        const { data: favs } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', session.user.id);
        setFavorites(favs ? favs.map(f => f.property_id) : []);
        // Buscar os imóveis favoritos completos
        if (favs && favs.length > 0) {
          const propertyIds = favs.map(f => f.property_id);
          const { data: propertiesData } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          const mappedFavorites = (propertiesData || []).map((p) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            address: p.address,
            city: p.city,
            state: p.state,
            auctionPrice: p.auction_price,
            marketPrice: p.market_price,
            discount: p.discount,
            auctionDate: p.auction_date,
            auctionType: p.auction_type,
            riskLevel: (p as any).risk_level || 'medium',
            imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '',
          }));
          setFavoriteProperties(mappedFavorites);
        } else {
          setFavoriteProperties([]);
        }
        // Buscar quantidade de alertas ativos
        const { data: alerts } = await supabase
          .from('alerts')
          .select('id, status')
          .eq('user_id', session.user.id);
        setAlertCount(alerts ? alerts.filter(a => a.status === 'ativo').length : 0);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (swrData) {
      let sorted = swrData.data || [];
      if (filters && filters.riskLevel && filters.riskLevel !== '') {
        const riskMap: Record<string, string> = { baixo: 'low', médio: 'medium', alto: 'high' };
        const selectedRisk = riskMap[filters.riskLevel] || filters.riskLevel;
        sorted = sorted.filter(property => {
          let riskLevel = 'medium';
          if (property.discount < 30) riskLevel = 'low';
          else if (property.discount >= 30 && property.discount < 50) riskLevel = 'medium';
          else if (property.discount >= 50) riskLevel = 'high';
          return riskLevel === selectedRisk;
        });
      }
      if (sortBy) {
        sorted = [...sorted].sort((a, b) => {
          switch (sortBy) {
            case 'discount':
              return b.discount - a.discount;
            case 'date':
              return new Date(a.auction_date).getTime() - new Date(b.auction_date).getTime();
            case 'price':
              return a.auction_price - b.auction_price;
            default:
              return 0;
          }
        });
      }
      setPageProperties(sorted);
      setTotalProperties(swrData.count || 0);
      setFilteredTotal(sorted.length);
    } else if (swrError) {
      console.error('Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.');
    } else if (isValidating) {
      console.log('Carregando imóveis...');
    }
  }, [swrData, swrError, isValidating, filters, sortBy]);

  const totalPages = Math.ceil(totalProperties / itemsPerPage);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) return;
    if (favorites.includes(propertyId)) {
      // Remover dos favoritos
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      // Adicionar aos favoritos
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });
      setFavorites([...favorites, propertyId]);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user) return;
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);
    setFavorites(favorites.filter(id => id !== propertyId));
    setFavoriteProperties(favoriteProperties.filter(p => p.id !== propertyId));
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando usuário...</div>;
  }

  const realUser = {
    id: user.id,
    name: user.user_metadata?.name || user.email,
    email: user.email,
    plan: subscriptionStatus?.plan?.title || 'Gratuito',
    favoriteCount: favoriteProperties.length,
    alertCount: alertCount,
    lastAnalysis: '',
    matchingAuctions: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <UserDashboardHeader user={realUser} />
        <div className="mt-6">
          <UserSubscription />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="busca">Busca de Imóveis</TabsTrigger>
            <TabsTrigger value="simulador">Simulador</TabsTrigger>
            <TabsTrigger value="analise">Parecer Jurídico</TabsTrigger>
            <TabsTrigger value="favoritos">Meus Favoritos</TabsTrigger>
            <TabsTrigger value="alertas">Meus Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="busca" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <SearchFilters filters={filters} setFilters={setFilters} onSearch={handleSearch} />
              </div>
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {filteredTotal !== totalProperties
                      ? `Mostrando ${filteredTotal} de ${totalProperties} imóveis encontrados`
                      : `${totalProperties} imóveis encontrados`}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Ordenar por:</span>
                    <select 
                      className="text-sm border rounded p-1"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="discount">Maior desconto</option>
                      <option value="date">Data do leilão</option>
                      <option value="price">Menor preço</option>
                    </select>
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Visualização em grid">
                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor"/><rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor"/><rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor"/><rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor"/></svg>
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="Visualização em lista">
                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="9" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="14" width="14" height="3" rx="1" fill="currentColor"/></svg>
                    </Button>
                  </div>
                </div>
                {isLoading ? (
                  <div className="text-center py-10">Carregando imóveis...</div>
                ) : error ? (
                  <div className="text-center py-10 text-red-500">{error}</div>
                ) : pageProperties.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pageProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          id={property.id}
                          title={property.title}
                          address={property.address}
                          city={property.city}
                          state={property.state}
                          imageUrl={property.imageUrl || (property.images && property.images.length > 0 ? property.images[0] : undefined)}
                          auctionPrice={property.auctionPrice ?? property.auction_price}
                          marketPrice={property.marketPrice ?? property.market_price}
                          discount={property.discount}
                          auctionDate={property.auctionDate ?? property.auction_date}
                          auctionType={property.auctionType ?? property.auction_type}
                          riskLevel={property.riskLevel ?? (property.discount < 30 ? 'low' : property.discount < 50 ? 'medium' : 'high')}
                          clickable={true}
                          isFavorite={favorites.includes(property.id)}
                          onToggleFavorite={handleToggleFavorite}
                          allow_consorcio={property.allow_consorcio}
                          allow_fgts={property.allow_fgts}
                          allow_financing={property.allow_financing}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      {pageProperties.map((property) => (
                        <PropertyListItem
                          key={property.id}
                          id={property.id}
                          title={property.title}
                          address={property.address}
                          city={property.city}
                          state={property.state}
                          auctionPrice={property.auctionPrice}
                          marketPrice={property.marketPrice}
                          discount={property.discount}
                          auctionDate={property.auctionDate}
                          auctionType={property.auctionType}
                          isFavorite={favorites.includes(property.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-10">Nenhum imóvel encontrado.</div>
                )}
                {/* Paginação simples */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-auction-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="simulador" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <ProfitSimulator />
            </div>
          </TabsContent>
          <TabsContent value="analise" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <RiskAnalyzer />
            </div>
          </TabsContent>
          <TabsContent value="favoritos" className="mt-0">
            <UserFavorites 
              favorites={favoriteProperties}
              onRemoveFavorite={handleRemoveFavorite}
            />
          </TabsContent>
          <TabsContent value="alertas" className="mt-0">
            <UserAlerts />
          </TabsContent>
        </Tabs>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Meu Perfil</h2>
          <UserProfile user={realUser} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
