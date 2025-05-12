
import React, { useState } from 'react';
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

// Mock data for the user dashboard
const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@example.com',
  plan: 'Gratuito',
  favoriteCount: 5,
  alertCount: 3,
  lastAnalysis: '2025-05-07',
  matchingAuctions: 12
};

// Mock data for property listings
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
    imageUrl: '/placeholder.svg'
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
    imageUrl: '/placeholder.svg'
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
    imageUrl: '/placeholder.svg'
  }
];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("busca");
  const [properties, setProperties] = useState(mockProperties);

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // In a real app, this would filter the properties based on the filters
    // For now, we'll just keep the mock properties
    setProperties(mockProperties);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        {/* Dashboard Header with Welcome and Summary */}
        <UserDashboardHeader user={mockUser} />
        
        {/* User Subscription */}
        <div className="mt-6">
          <UserSubscription />
        </div>
        
        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="busca">Busca de Imóveis</TabsTrigger>
            <TabsTrigger value="simulador">Simulador</TabsTrigger>
            <TabsTrigger value="analise">Parecer Jurídico</TabsTrigger>
            <TabsTrigger value="favoritos">Meus Favoritos</TabsTrigger>
            <TabsTrigger value="alertas">Meus Alertas</TabsTrigger>
          </TabsList>
          
          {/* Busca de Imóveis Tab */}
          <TabsContent value="busca" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters onSearch={handleSearch} />
              </div>
              
              {/* Property listings */}
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {properties.length} imóveis encontrados
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Simulador Tab */}
          <TabsContent value="simulador" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <ProfitSimulator />
            </div>
          </TabsContent>
          
          {/* Análise Jurídica Tab */}
          <TabsContent value="analise" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <RiskAnalyzer />
            </div>
          </TabsContent>
          
          {/* Favoritos Tab */}
          <TabsContent value="favoritos" className="mt-0">
            <UserFavorites 
              favorites={mockProperties.slice(0, 2)}
            />
          </TabsContent>
          
          {/* Alertas Tab */}
          <TabsContent value="alertas" className="mt-0">
            <UserAlerts />
          </TabsContent>
        </Tabs>
        
        {/* Profile section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Meu Perfil</h2>
          <UserProfile user={mockUser} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
