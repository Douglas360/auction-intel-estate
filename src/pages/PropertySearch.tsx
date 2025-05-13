
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchFilters from '@/components/SearchFilters';
import PropertyCard from '@/components/PropertyCard';

// Mock data for the MVP demonstration
const mockProperties = [
  {
    id: '1',
    title: 'Apartamento 3 dormitórios no Morumbi',
    type: 'Apartamento',
    address: 'Rua Engenheiro João de Ulhôa Cintra, 214, Apto 132',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 450000,
    marketPrice: 650000,
    discount: 30,
    auctionDate: '2025-06-15',
    auctionType: 'Judicial',
    riskLevel: 'low' as 'low',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
  },
  {
    id: '2',
    title: 'Casa em condomínio em Alphaville',
    type: 'Casa',
    address: 'Alameda Grajau, 325, Residencial 5',
    city: 'Barueri',
    state: 'SP',
    auctionPrice: 1200000,
    marketPrice: 1850000,
    discount: 35,
    auctionDate: '2025-06-22',
    auctionType: 'Extrajudicial',
    riskLevel: 'medium' as 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'
  },
  {
    id: '3',
    title: 'Terreno comercial na Marginal Tietê',
    type: 'Terreno',
    address: 'Avenida Marginal Tietê, 2500',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 900000,
    marketPrice: 1300000,
    discount: 31,
    auctionDate: '2025-07-05',
    auctionType: 'Banco',
    riskLevel: 'low' as 'low',
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716'
  },
  {
    id: '4',
    title: 'Galpão industrial em Guarulhos',
    type: 'Comercial',
    address: 'Rodovia Presidente Dutra, km 225',
    city: 'Guarulhos',
    state: 'SP',
    auctionPrice: 1600000,
    marketPrice: 2500000,
    discount: 36,
    auctionDate: '2025-06-28',
    auctionType: 'Judicial',
    riskLevel: 'high' as 'high',
    imageUrl: 'https://images.unsplash.com/photo-1664425992088-444edfc5f143'
  },
  {
    id: '5',
    title: 'Cobertura duplex na Vila Nova Conceição',
    type: 'Apartamento',
    address: 'Rua Afonso Braz, 115, Cobertura 01',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 2400000,
    marketPrice: 3800000,
    discount: 37,
    auctionDate: '2025-07-12',
    auctionType: 'Banco',
    riskLevel: 'medium' as 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  },
  {
    id: '6',
    title: 'Fazenda produtiva em Ribeirão Preto',
    type: 'Rural',
    address: 'Rodovia SP-330, km 325',
    city: 'Ribeirão Preto',
    state: 'SP',
    auctionPrice: 4500000,
    marketPrice: 6200000,
    discount: 27,
    auctionDate: '2025-08-05',
    auctionType: 'Judicial',
    riskLevel: 'high' as 'high',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
  }
];

const PropertySearch = () => {
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);

  const handleSearch = (filters: any) => {
    // In a real app, this would make an API request with the filters
    // For the MVP, we'll just simulate filtering the mock data
    console.log('Applied filters:', filters);
    
    // Apply simple filtering based on discount percentage
    const filtered = mockProperties.filter(property => {
      // Filter by discount
      if (filters.discount && property.discount < filters.discount) {
        return false;
      }
      
      // Filter by property type
      if (filters.propertyType && filters.propertyType !== '' && property.type !== filters.propertyType) {
        return false;
      }
      
      // Filter by auction type
      if (filters.auctionType && filters.auctionType !== '' && property.auctionType !== filters.auctionType) {
        return false;
      }
      
      // Filter by risk level
      if (filters.riskLevel && filters.riskLevel !== '' && property.riskLevel !== filters.riskLevel) {
        return false;
      }
      
      // Filter by location (simple text match for the MVP)
      if (filters.location && filters.location !== '') {
        const locationLower = filters.location.toLowerCase();
        const cityMatch = property.city.toLowerCase().includes(locationLower);
        const addressMatch = property.address.toLowerCase().includes(locationLower);
        if (!cityMatch && !addressMatch) {
          return false;
        }
      }
      
      // Filter by price range
      if (property.auctionPrice < filters.minPrice || property.auctionPrice > filters.maxPrice) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <h1 className="text-3xl font-bold mb-8 mt-4">Busca de Imóveis em Leilão</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onSearch={handleSearch} />
          </div>
          
          {/* Main content area */}
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
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum imóvel encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
