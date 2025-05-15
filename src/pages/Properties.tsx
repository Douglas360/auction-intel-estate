import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
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
  const { properties, isLoading, error } = useProperties();
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

  // Apply filters and sorting to properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = properties;
    
    // Apply filters
    if (filters) {
      result = result.filter(property => {
        // Discount minimum
        if (filters.discount && property.discount < filters.discount) return false;
        // Property type
        if (filters.propertyType && filters.propertyType !== '' && property.type !== filters.propertyType) return false;
        // Auction type
        if (filters.auctionType && filters.auctionType !== '' && property.auctionType !== filters.auctionType) return false;
        // Risk level
        if (filters.riskLevel && filters.riskLevel !== '' && property.riskLevel !== filters.riskLevel) return false;
        // Location (city, neighborhood, property type or state)
        if (filters.location && filters.location !== '') {
          const locationLower = filters.location.toLowerCase();
          const cityMatch = property.city.toLowerCase().includes(locationLower);
          const addressMatch = property.address.toLowerCase().includes(locationLower);
          const typeMatch = property.type.toLowerCase().includes(locationLower);
          const stateMatch = property.state.toLowerCase().includes(locationLower);
          if (!cityMatch && !addressMatch && !typeMatch && !stateMatch) return false;
        }
        // State (UF)
        if (filters.state && filters.state !== '' && property.state !== filters.state) return false;
        // Price range
        if (filters.minPrice && property.auctionPrice < filters.minPrice) return false;
        if (filters.maxPrice && property.auctionPrice > filters.maxPrice) return false;
        return true;
      });
    }
    
    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case 'discount':
            return b.discount - a.discount; // Higher discount first
          case 'date':
            return new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime(); // Sooner date first
          case 'price':
            return a.auctionPrice - b.auctionPrice; // Lower price first
          default:
            return 0;
        }
      });
    }
    
    return result;
  }, [properties, filters, sortBy]);
  
  // Get current page properties
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProperties, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage);
  
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
            
            {paginatedProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
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
