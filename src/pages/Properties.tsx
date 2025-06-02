
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import SearchFilters, { defaultFilters } from '@/components/SearchFilters';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import PropertyListItem from '@/components/PropertyListItem';
import { usePropertiesPage } from '@/hooks/usePropertiesPage';

const Properties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  
  // Get pagination and sorting from URL params
  const initialPage = parseInt(params.get('page') || '1', 10);
  const initialSort = params.get('sort') || 'discount';
  
  const [filters, setFilters] = useState<any>(
    initialQuery ? { ...defaultFilters, location: initialQuery } : { ...defaultFilters }
  );
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const itemsPerPage = 12;
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use the new hook for fetching properties
  const { properties, totalProperties, filteredTotal, isLoading, error } = usePropertiesPage(
    filters, 
    currentPage, 
    itemsPerPage
  );

  // Sort properties based on sortBy
  const sortedProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    return [...properties].sort((a, b) => {
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
  }, [properties, sortBy]);
  
  // Update URL when filters, page or sort change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    if (currentPage > 1) {
      queryParams.set('page', currentPage.toString());
    } else {
      queryParams.delete('page');
    }
    
    if (sortBy) {
      queryParams.set('sort', sortBy);
    }
    
    const newUrl = `${location.pathname}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [currentPage, sortBy, location.pathname, navigate]);

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

  const totalPages = Math.ceil(totalProperties / itemsPerPage);
  
  // Handle search
  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
          <div className="text-center py-20">
            <p>Carregando imóveis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <h1 className="text-3xl font-bold mb-8 mt-4">Imóveis em Leilão</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Advanced filters sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} setFilters={setFilters} onSearch={handleSearch} />
          </div>
          {/* Property listings */}
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
            
            {sortedProperties.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProperties.map((property) => (
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
                        discount={property.discount}
                        auctionDate={property.auction_date}
                        auctionType={property.auction_type}
                        riskLevel={property.discount < 30 ? 'low' : property.discount < 50 ? 'medium' : 'high'}
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
                    {sortedProperties.map((property) => (
                      <PropertyListItem
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        address={property.address}
                        city={property.city}
                        state={property.state}
                        auctionPrice={property.auction_price}
                        marketPrice={property.market_price}
                        discount={property.discount}
                        auctionDate={property.auction_date}
                        auctionType={property.auction_type}
                        isFavorite={favorites.includes(property.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) handlePageChange(currentPage - 1);
                            }}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return (
                              page === 1 || 
                              page === totalPages || 
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, idx, array) => {
                            const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
                            return (
                              <div key={page} style={{ display: 'contents' }}>
                                {showEllipsisBefore && (
                                  <PaginationItem>
                                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(page);
                                    }}
                                    isActive={page === currentPage}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </div>
                            );
                          })
                        }
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) handlePageChange(currentPage + 1);
                            }}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Nenhum imóvel encontrado com os filtros selecionados.</p>
                <Button variant="outline" onClick={() => setFilters({ ...defaultFilters })}>
                  Limpar filtros
                </Button>
              </div>
            )}
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
    </div>
  );
};

export default Properties;
