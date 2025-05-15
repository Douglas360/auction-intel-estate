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

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando busca de imóveis no Supabase...');
      
      // Buscar imóveis do Supabase
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          auctions (
            auction_number,
            auction_date,
            min_bid
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Resposta do Supabase:', { propertiesData, propertiesError });

      if (propertiesError) {
        console.error('Erro ao buscar imóveis:', propertiesError);
        throw propertiesError;
      }

      if (!propertiesData || propertiesData.length === 0) {
        console.log('Nenhum imóvel encontrado no banco de dados');
        setProperties([]);
        setFeaturedProperties([]);
        return;
      }

      // Transformar os dados do Supabase para o formato esperado pela aplicação
      const formattedProperties = propertiesData.map(property => {
        console.log('Transformando imóvel:', property);
        // Corrigir imagem
        let imageUrl = '/placeholder.svg';
        
        const images = property['images'];
        if (Array.isArray(images) && images.length > 0) {
          imageUrl = images[0];
        } else if (property.image_url) {
          imageUrl = property.image_url;
        }
        return {
          id: property.id,
          title: property.title,
          type: property.type,
          address: property.address,
          city: property.city,
          state: property.state,
          auctionPrice: property.auction_price,
          marketPrice: property.market_price,
          discount: property.discount,
          auctionDate: property.auctions?.[0]?.auction_date || '',
          auctionType: property.auction_type || '',
          riskLevel: property.risk_level || 'medium',
          imageUrl,
          description: property.description,
          details: property.details as Property['details'],
          auctionDetails: {
            auctionHouse: property.auctioneer || '',
            auctionSite: property.auctioneer_site || '',
            auctionProcess: property.process_number || '',
            auctionCourt: property.court || '',
            firstDate: property.auctions?.[0]?.auction_date || '',
            secondDate: property.auctions?.[1]?.auction_date || '',
            minimumBid1: property.auctions?.[0]?.min_bid || 0,
            minimumBid2: property.auctions?.[1]?.min_bid || 0
          }
        };
      });

      console.log('Imóveis formatados:', formattedProperties);

      setProperties(formattedProperties);
      // Definir os 3 primeiros imóveis como destaque
      setFeaturedProperties(formattedProperties.slice(0, 3));
      
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
    console.log('useProperties hook montado, buscando imóveis...');
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
