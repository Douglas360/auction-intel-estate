import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UserDashboardHeader from '@/components/UserDashboardHeader';
import UserFavorites from '@/components/UserFavorites';
import UserAlerts from '@/components/UserAlerts';
import UserProfile from '@/components/UserProfile';
import UserSubscription from '@/components/UserSubscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchFilters from '@/components/SearchFilters';
import PropertyCard from '@/components/PropertyCard';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import ProfitSimulator from '@/components/ProfitSimulator';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useProperties } from '@/hooks/useProperties';
import { Tables } from '@/integrations/supabase/types';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("busca");
  const [user, setUser] = useState(null);
  const { subscriptionStatus } = useSubscription();
  const { properties, isLoading, error } = useProperties();
  const [filters, setFilters] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('discount');
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        // Buscar favoritos do usuário
        const { data: favs } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', session.user.id);
        setFavorites(favs ? favs.map(f => f.property_id) : []);
      }
    };
    fetchUser();
  }, []);

  // Filtros e ordenação (igual ao /properties)
  const filteredAndSortedProperties = React.useMemo(() => {
    let result = properties;
    if (filters) {
      result = result.filter(property => {
        if (filters.discount && property.discount < filters.discount) return false;
        if (filters.propertyType && filters.propertyType !== '' && property.type !== filters.propertyType) return false;
        if (filters.auctionType && filters.auctionType !== '' && property.auctionType !== filters.auctionType) return false;
        if (filters.riskLevel && filters.riskLevel !== '' && property.riskLevel !== filters.riskLevel) return false;
        if (filters.location && filters.location !== '') {
          const locationLower = filters.location.toLowerCase();
          const cityMatch = property.city.toLowerCase().includes(locationLower);
          const addressMatch = property.address.toLowerCase().includes(locationLower);
          const typeMatch = property.type.toLowerCase().includes(locationLower);
          const stateMatch = property.state.toLowerCase().includes(locationLower);
          if (!cityMatch && !addressMatch && !typeMatch && !stateMatch) return false;
        }
        if (filters.state && filters.state !== '' && property.state !== filters.state) return false;
        if (filters.minPrice && property.auctionPrice < filters.minPrice) return false;
        if (filters.maxPrice && property.auctionPrice > filters.maxPrice) return false;
        return true;
      });
    }
    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case 'discount':
            return b.discount - a.discount;
          case 'date':
            return new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime();
          case 'price':
            return a.auctionPrice - b.auctionPrice;
          default:
            return 0;
        }
      });
    }
    return result;
  }, [properties, filters, sortBy]);

  const paginatedProperties = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProperties, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
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

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando usuário...</div>;
  }

  const realUser = {
    id: user.id,
    name: user.user_metadata?.name || user.email,
    email: user.email,
    plan: subscriptionStatus?.plan?.title || 'Gratuito',
    favoriteCount: 0,
    alertCount: 0,
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
                <SearchFilters onSearch={handleSearch} />
              </div>
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {filteredAndSortedProperties.length} imóveis encontrados
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
                  </div>
                </div>
                {isLoading ? (
                  <div className="text-center py-10">Carregando imóveis...</div>
                ) : error ? (
                  <div className="text-center py-10 text-red-500">{error}</div>
                ) : paginatedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        {...property}
                        isFavorite={favorites.includes(property.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
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
                        onClick={() => setCurrentPage(i + 1)}
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
              favorites={properties.slice(0, 2)}
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
