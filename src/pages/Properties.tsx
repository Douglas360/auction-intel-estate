import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import SearchFilters from '@/components/SearchFilters';

const Properties = () => {
  const { properties, isLoading, error } = useProperties();
  const [filters, setFilters] = useState<any>(null);

  // Função para aplicar os filtros
  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Função de filtragem local
  const filteredProperties = useMemo(() => {
    if (!filters) return properties;
    return properties.filter(property => {
      // Desconto mínimo
      if (filters.discount && property.discount < filters.discount) return false;
      // Tipo de imóvel
      if (filters.propertyType && filters.propertyType !== '' && property.type !== filters.propertyType) return false;
      // Tipo de leilão
      if (filters.auctionType && filters.auctionType !== '' && property.auctionType !== filters.auctionType) return false;
      // Nível de risco
      if (filters.riskLevel && filters.riskLevel !== '' && property.riskLevel !== filters.riskLevel) return false;
      // Localização (cidade ou bairro)
      if (filters.location && filters.location !== '') {
        const locationLower = filters.location.toLowerCase();
        const cityMatch = property.city.toLowerCase().includes(locationLower);
        const addressMatch = property.address.toLowerCase().includes(locationLower);
        if (!cityMatch && !addressMatch) return false;
      }
      // Estado (UF)
      if (filters.state && filters.state !== '' && property.state !== filters.state) return false;
      // Faixa de preço
      if (filters.minPrice && property.auctionPrice < filters.minPrice) return false;
      if (filters.maxPrice && property.auctionPrice > filters.maxPrice) return false;
      return true;
    });
  }, [properties, filters]);

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
          {/* Filtros avançados na lateral */}
          <div className="lg:col-span-1">
            <SearchFilters onSearch={handleSearch} />
          </div>
          {/* Listagem dos imóveis */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredProperties.length} imóveis encontrados
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Ordenar por:</span>
                <select className="text-sm border rounded p-1">
                  <option value="discount">Maior desconto</option>
                  <option value="date">Data do leilão</option>
                  <option value="price">Menor preço</option>
                </select>
              </div>
            </div>
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                  />
                ))}
              </div>
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
    </div>
  );
};

export default Properties; 