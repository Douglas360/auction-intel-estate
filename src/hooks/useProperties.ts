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
  matricula_pdf_url?: string;
  edital_pdf_url?: string;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar imóveis paginados
  const fetchPropertiesPage = async (page = 1, pageSize = 100) => {
    setIsLoading(true);
    setError(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data: propertiesData, error: propertiesError, count } = await supabase
        .from('properties')
        .select(`
          *,
          auctions (
            auction_number,
            auction_date,
            min_bid
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (propertiesError) {
        throw propertiesError;
      }
      if (!propertiesData || propertiesData.length === 0) {
        setProperties([]);
        setFeaturedProperties([]);
        return { data: [], count: 0 };
      }
      const formattedProperties = propertiesData.map(property => {
        let imageUrl = '/placeholder.svg';
        const images = property['images'];
        if (Array.isArray(images) && images.length > 0) {
          imageUrl = images[0];
        }
        let riskLevel: 'low' | 'medium' | 'high' = 'medium';
        if (property.discount) {
          if (property.discount < 30) {
            riskLevel = 'low';
          } else if (property.discount >= 30 && property.discount < 50) {
            riskLevel = 'medium';
          } else {
            riskLevel = 'high';
          }
        }
        const details = {
          area: '0',
          bedrooms: 0,
          bathrooms: 0,
          parkingSpots: 0
        };
        if (property.description) {
          const description = property.description.toLowerCase();
          const bedroomsMatch = description.match(/(\d+)\s*(quarto|dormit[oó]rio|dorm|suíte)/i);
          if (bedroomsMatch) {
            details.bedrooms = parseInt(bedroomsMatch[1], 10);
          }
          const bathroomsMatch = description.match(/(\d+)\s*(banheiro|wc|lavabo)/i);
          if (bathroomsMatch) {
            details.bathrooms = parseInt(bathroomsMatch[1], 10);
          }
          const parkingMatch = description.match(/(\d+)\s*(vaga|garagem)/i);
          if (parkingMatch) {
            details.parkingSpots = parseInt(parkingMatch[1], 10);
          }
          const areaMatch = description.match(/(\d+)\s*m²/i);
          if (areaMatch) {
            details.area = areaMatch[1] + 'm²';
          }
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
          discount: property.discount || 0,
          auctionDate: property.auction_date || property.auctions?.[0]?.auction_date || '',
          auctionType: property.auction_type || '',
          riskLevel,
          imageUrl,
          description: property.description,
          details,
          matricula_pdf_url: property.matricula_pdf_url,
          edital_pdf_url: property.edital_pdf_url,
          auctionDetails: {
            auctionHouse: property.auctioneer || '',
            auctionSite: property.auctioneer_site || '',
            auctionProcess: property.process_number || '',
            auctionCourt: property.court || '',
            firstDate: property.auctions?.[0]?.auction_date || '',
            secondDate: property.auctions?.[1]?.auction_date || '',
            minimumBid1: property.auctions?.[0]?.min_bid || property.min_bid || 0,
            minimumBid2: property.auctions?.[1]?.min_bid || 0
          }
        };
      });
      setProperties(formattedProperties);
      setFeaturedProperties(formattedProperties.slice(0, 3));
      return { data: formattedProperties, count };
    } catch (err) {
      setError('Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os imóveis.",
        variant: "destructive",
      });
      return { data: [], count: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // Função antiga para compatibilidade (busca primeira página)
  const fetchProperties = async () => {
    return fetchPropertiesPage(1, 100);
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
    fetchPropertiesPage,
    getPropertyById
  };
};
