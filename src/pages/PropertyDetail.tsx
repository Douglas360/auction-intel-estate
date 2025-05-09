
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import ProfitSimulator from '@/components/ProfitSimulator';
import { Calendar, MapPin, Home, DollarSign, Clock, Gavel, AlertTriangle } from 'lucide-react';

// For the MVP, we're using mock data
const propertyData = {
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
  riskLevel: 'low',
  imageUrl: '/placeholder.svg',
  description: `Excelente apartamento com 3 dormitórios, sendo 1 suíte, com 92m² de área útil, 2 vagas de garagem, localizado no bairro Morumbi. O condomínio possui área de lazer completa com piscina, salão de festas, academia e playground.

O imóvel está desocupado e precisa de pequena reforma. Existem débitos de condomínio que serão quitados pelo arrematante.

Leilão judicial da 3ª Vara Cível de São Paulo, processo nº 1002345-67.2023.8.26.0100.`,
  details: {
    area: '92m²',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    floor: 13,
    yearBuilt: 2010,
    condominium: 850,
    iptu: 2400
  },
  auctionDetails: {
    auctionHouse: 'Leiloeiro Oficial João Silva',
    auctionSite: 'www.leiloeirojsilva.com.br',
    auctionProcess: '1002345-67.2023.8.26.0100',
    auctionCourt: '3ª Vara Cível de São Paulo',
    firstDate: '2025-06-15',
    secondDate: '2025-06-29',
    minimumBid1: 450000,
    minimumBid2: 315000,
  }
};

const PropertyDetail = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
              <img 
                src={propertyData.imageUrl || '/placeholder.svg'} 
                alt={propertyData.title} 
                className="w-full h-80 object-cover"
              />
            </div>
            
            {/* Property header */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{propertyData.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{propertyData.address}, {propertyData.city} - {propertyData.state}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-gray-700" />
                      <span>{propertyData.type}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      <span>{formatCurrency(propertyData.auctionPrice)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-700" />
                      <span>{formatDate(propertyData.auctionDate)}</span>
                    </div>
                  </div>
                </div>
                <Badge className="discount-badge text-base">
                  {propertyData.discount}% abaixo do mercado
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <Button className="bg-auction-primary hover:bg-auction-secondary">
                  Quero arrematar
                </Button>
                <Button variant="outline" className="border-auction-primary text-auction-primary hover:bg-auction-primary hover:text-white">
                  Adicionar aos favoritos
                </Button>
                <Button variant="outline">
                  Compartilhar
                </Button>
              </div>
            </div>
            
            {/* Property tabs */}
            <Tabs defaultValue="details" className="bg-white rounded-lg shadow-sm">
              <TabsList className="w-full border-b">
                <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                <TabsTrigger value="auction" className="flex-1">Informações do Leilão</TabsTrigger>
                <TabsTrigger value="location" className="flex-1">Localização</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Descrição</h3>
                  <p className="text-gray-600 whitespace-pre-line">{propertyData.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Características</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Área</span>
                      <p className="font-semibold">{propertyData.details.area}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Dormitórios</span>
                      <p className="font-semibold">{propertyData.details.bedrooms}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Banheiros</span>
                      <p className="font-semibold">{propertyData.details.bathrooms}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Vagas</span>
                      <p className="font-semibold">{propertyData.details.parkingSpots}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Andar</span>
                      <p className="font-semibold">{propertyData.details.floor}º</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Ano de construção</span>
                      <p className="font-semibold">{propertyData.details.yearBuilt}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">Condomínio</span>
                      <p className="font-semibold">{formatCurrency(propertyData.details.condominium)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-500 text-sm">IPTU</span>
                      <p className="font-semibold">{formatCurrency(propertyData.details.iptu)}/ano</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Comparativo de Preços</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span>Valor do Leilão:</span>
                      <span className="font-bold">{formatCurrency(propertyData.auctionPrice)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Valor de Mercado:</span>
                      <span className="font-bold">{formatCurrency(propertyData.marketPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Economia:</span>
                      <span className="font-bold">{formatCurrency(propertyData.marketPrice - propertyData.auctionPrice)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="auction" className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Detalhes do Leilão</h3>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                      <div>
                        <h4 className="font-semibold">Aviso importante</h4>
                        <p className="text-sm text-gray-600">
                          As informações aqui apresentadas são baseadas no edital do leilão. Sempre consulte o edital completo e busque assessoria jurídica antes de participar de qualquer leilão.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Leiloeiro</span>
                      <p className="font-semibold">{propertyData.auctionDetails.auctionHouse}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Site do Leiloeiro</span>
                      <p className="font-semibold">{propertyData.auctionDetails.auctionSite}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Processo</span>
                      <p className="font-semibold">{propertyData.auctionDetails.auctionProcess}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Vara/Tribunal</span>
                      <p className="font-semibold">{propertyData.auctionDetails.auctionCourt}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Datas e Valores</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        <Gavel className="h-5 w-5 mr-2 text-auction-primary" />
                        <h4 className="font-semibold">1º Leilão - {formatDate(propertyData.auctionDetails.firstDate)}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        No 1º leilão, o valor mínimo para lance é o valor de avaliação do imóvel.
                      </p>
                      <div className="flex justify-between">
                        <span>Lance mínimo:</span>
                        <span className="font-bold">{formatCurrency(propertyData.auctionDetails.minimumBid1)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        <Gavel className="h-5 w-5 mr-2 text-auction-primary" />
                        <h4 className="font-semibold">2º Leilão - {formatDate(propertyData.auctionDetails.secondDate)}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        No 2º leilão, caso o 1º não tenha lances, o valor mínimo costuma ser menor.
                      </p>
                      <div className="flex justify-between">
                        <span>Lance mínimo:</span>
                        <span className="font-bold">{formatCurrency(propertyData.auctionDetails.minimumBid2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-auction-primary hover:bg-auction-secondary">
                  Quero participar deste leilão
                </Button>
              </TabsContent>
              
              <TabsContent value="location" className="p-6">
                <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                  <p className="text-gray-600">Mapa indisponível no MVP</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <RiskAnalyzer />
            <ProfitSimulator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
