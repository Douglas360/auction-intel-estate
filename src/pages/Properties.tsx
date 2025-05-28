import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import SearchFilters from '@/components/SearchFilters';
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

const Properties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  
  // Get pagination and sorting from URL params
  const initialPage = parseInt(params.get('page') || '1', 10);
  const initialSort = params.get('sort') || 'discount';
  
  const [filters, setFilters] = useState<any>(
    initialQuery ? { location: initialQuery } : null
  );
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const itemsPerPage = 12; // Number of properties per page
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pageProperties, setPageProperties] = useState<any[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [filteredTotal, setFilteredTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update URL when filters, page or sort change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    // Update pagination param
    if (currentPage > 1) {
      queryParams.set('page', currentPage.toString());
    } else {
      queryParams.delete('page');
    }
    
    // Update sort param
    if (sortBy) {
      queryParams.set('sort', sortBy);
    }
    
    // Update URL without reloading page
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

  // Função para buscar imóveis paginados direto do Supabase
  const fetchPropertiesPage = async (page = 1, pageSize = 12) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data, count };
  };

  // Buscar imóveis da página atual sempre que filtros, página ou ordenação mudarem
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const result = await fetchPropertiesPage(currentPage, itemsPerPage);
        const data = result && Array.isArray(result.data) ? result.data : [];
        const count = result && typeof result.count === 'number' ? result.count : 0;
        if (isMounted) {
          let filtered = data;
          // Filtros adicionais no frontend (se necessário)
          if (filters) {
            filtered = filtered.filter(property => {
              if (filters.discount && property.discount < filters.discount) return false;
              if (filters.propertyType && filters.propertyType !== '' && property.type !== filters.propertyType) return false;
              if (filters.auctionType && filters.auctionType !== '' && property.auction_type !== filters.auctionType) return false;
              if (filters.riskLevel && filters.riskLevel !== '') {
                let riskLevel = 'medium';
                if (property.discount < 30) riskLevel = 'low';
                else if (property.discount >= 30 && property.discount < 50) riskLevel = 'medium';
                else if (property.discount >= 50) riskLevel = 'high';
                if (riskLevel !== filters.riskLevel) return false;
              }
              if (filters.location && filters.location !== '') {
                const locationLower = filters.location.toLowerCase();
                const cityMatch = property.city?.toLowerCase?.().includes(locationLower);
                const addressMatch = property.address?.toLowerCase?.().includes(locationLower);
                const typeMatch = property.type?.toLowerCase?.().includes(locationLower);
                const stateMatch = property.state?.toLowerCase?.().includes(locationLower);
                if (!cityMatch && !addressMatch && !typeMatch && !stateMatch) return false;
              }
              if (filters.state && filters.state !== '' && property.state !== filters.state) return false;
              if (filters.minPrice && property.auction_price < filters.minPrice) return false;
              if (filters.maxPrice && property.auction_price > filters.maxPrice) return false;
              return true;
            });
          }
          // Ordenação no frontend
          let sorted = filtered;
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
          setTotalProperties(count);
          setFilteredTotal(sorted.length);
        }
      } catch (err: any) {
        setError('Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [currentPage, filters, sortBy, itemsPerPage]);

  const totalPages = Math.ceil(totalProperties / itemsPerPage);
  
  // Handle search
  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when page changes
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
            <SearchFilters onSearch={handleSearch} />
          </div>
          {/* Property listings */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filters && Object.values(filters).some(v => v !== '' && v !== null && v !== undefined && v !== 0)
                  ? filteredTotal
                  : totalProperties} imóveis encontrados
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
            
            {pageProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pageProperties.map((property) => (
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
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        {/* Previous button */}
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
                        
                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first and last page always
                            // For current page, show +/- 1 page
                            // Otherwise show ellipsis
                            return (
                              page === 1 || 
                              page === totalPages || 
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, idx, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
                            
                            return (
                              <React.Fragment key={page}>
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
                              </React.Fragment>
                            );
                          })
                        }
                        
                        {/* Next button */}
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
                <Button variant="outline" onClick={() => setFilters(null)}>
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
