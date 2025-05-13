
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface Property {
  id: string;
  title: string;
  type: string;
  address: string;
  city: string;
  state: string;
  auctionPrice: number;
  marketPrice: number;
  discount: number;
  auctionDate: string;
  auctionType: string;
  riskLevel: 'low' | 'medium' | 'high';
  imageUrl: string;
  description?: string;
  details?: {
    area: string;
    bedrooms: number;
    bathrooms: number;
    parkingSpots: number;
    floor?: number;
    yearBuilt?: number;
    condominium?: number;
    iptu?: number;
  };
  auctionDetails?: {
    auctionHouse: string;
    auctionSite: string;
    auctionProcess: string;
    auctionCourt: string;
    firstDate: string;
    secondDate: string;
    minimumBid1: number;
    minimumBid2: number;
  };
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Esta função no MVP vai retornar dados mockados, mas está estruturada
  // para ser facilmente adaptada para buscar dados reais do Supabase
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Aqui seria a chamada para o Supabase
      // const { data, error } = await supabase.from('properties').select('*');
      
      // Simulando resposta do banco de dados com dados mockados
      // Em uma implementação real, isso viria do Supabase
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

      setProperties(mockProperties);
      setFeaturedProperties(mockProperties.slice(0, 3));
      
      // Se tivesse erro do Supabase:
      // if (error) throw error;
      
    } catch (err) {
      console.error('Erro ao buscar propriedades:', err);
      setError('Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os imóveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    featuredProperties,
    isLoading,
    error,
    fetchProperties,
    getPropertyById
  };
};
