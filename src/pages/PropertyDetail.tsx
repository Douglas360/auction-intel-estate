import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import ProfitSimulator from '@/components/ProfitSimulator';
import { Calendar, MapPin, Home, DollarSign, Clock, Gavel, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

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
  imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
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
  },
  coordinates: {
    lat: -23.5987,
    lng: -46.7240
  }
};

// Mock database with properties for the detail page
const propertiesDatabase = {
  '1': {
    ...propertyData
  },
  '2': {
    ...propertyData,
    id: '2',
    title: 'Casa em condomínio em Alphaville',
    type: 'Casa',
    address: 'Alameda Grajau, 325, Residencial 5',
    city: 'Barueri',
    state: 'SP',
    auctionPrice: 1200000,
    marketPrice: 1850000,
    discount: 35,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    details: {
      ...propertyData.details,
      area: '280m²',
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 4
    },
    coordinates: {
      lat: -23.4840,
      lng: -46.8520
    }
  },
  '3': {
    ...propertyData,
    id: '3',
    title: 'Terreno comercial na Marginal Tietê',
    type: 'Terreno',
    address: 'Avenida Marginal Tietê, 2500',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 900000,
    marketPrice: 1300000,
    discount: 31,
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716',
    coordinates: {
      lat: -23.5200,
      lng: -46.6360
    }
  }
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get property data based on ID from URL params
  const property = id ? propertiesDatabase[id as keyof typeof propertiesDatabase] : propertyData;
  
  // If property doesn't exist in our mock database, show a message and redirect
  if (!property) {
    toast({
      title: "Imóvel não encontrado",
      description: "O imóvel que você está procurando não está disponível.",
      variant: "destructive",
    });
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/properties');
    }, 2000);
    
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 pt-10">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Imóvel não encontrado</h1>
            <p className="mb-8">O imóvel que você está procurando não está disponível.</p>
            <Button onClick={() => navigate('/properties')}>Ver todos os imóveis</Button>
          </div>
        </div>
      </div>
    );
  }

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
                src={property.imageUrl} 
                alt={property.title} 
                className="w-full h-80 object-cover"
              />
            </div>
            
            {/* Property header */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address}, {property.city} - {property.state}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-gray-700" />
                      <span>{property.type}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      <span>{formatCurrency(property.auctionPrice)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-700" />
                      <span>{formatDate(property.auctionDate)}</span>
                    </div>
                  </div>
                </div>
                <Badge className="discount-badge text-base">
                  {property.discount}% abaixo do mercado
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
                <h3 className="text-xl font-semibold mb-3">Localização do Imóvel</h3>
                <p className="text-gray-600 mb-4">
                  {property.address}, {property.city} - {property.state}
                </p>
                <div className="bg-white rounded-lg h-[400px] mb-4 overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBLo0Vh9TmVkFUSFDRUwgEf6LFcR17tKFw&q=${encodeURIComponent(
                      `${property.address}, ${property.city}, ${property.state}`
                    )}&center=${property.coordinates.lat},${property.coordinates.lng}&zoom=15`}
                  ></iframe>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <h4 className="font-semibold mb-2">Sobre a região</h4>
                  <p className="text-sm text-gray-600">
                    Verifique a segurança do bairro, proximidade de transporte público, escolas, comércio e outros serviços 
                    essenciais antes de tomar sua decisão de investimento.
                  </p>
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
