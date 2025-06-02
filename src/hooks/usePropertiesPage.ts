
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useSWR from 'swr';

interface PropertyFilters {
  state?: string;
  location?: string;
  propertyType?: string;
  auctionType?: string;
  discount?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  garage?: string;
  allow_financing?: boolean;
  allow_consorcio?: boolean;
  allow_fgts?: boolean;
  allow_parcelamento?: boolean;
  riskLevel?: string;
}

interface PropertyData {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  auction_price: number;
  market_price: number;
  discount: number;
  auction_date: string;
  auction_type: string;
  images?: string[];
  allow_consorcio?: boolean;
  allow_fgts?: boolean;
  allow_financing?: boolean;
  created_at: string;
}

interface FetchResult {
  data: PropertyData[];
  count: number;
}

const fetchPropertiesPage = async (
  filters: PropertyFilters,
  page: number,
  pageSize: number
): Promise<FetchResult> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let queryBuilder = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  if (filters.state && filters.state !== '') {
    queryBuilder = queryBuilder.eq('state', filters.state);
  }
  
  if (filters.location && filters.location !== '') {
    queryBuilder = queryBuilder.or(`city.ilike.%${filters.location}%,address.ilike.%${filters.location}%,type.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
  }
  
  if (filters.propertyType && filters.propertyType !== '') {
    queryBuilder = queryBuilder.eq('type', filters.propertyType);
  }
  
  if (filters.auctionType && filters.auctionType !== '') {
    queryBuilder = queryBuilder.eq('auction_type', filters.auctionType);
  }
  
  if (filters.discount && filters.discount > 0) {
    queryBuilder = queryBuilder.gte('discount', filters.discount);
  }
  
  if (filters.minPrice && filters.minPrice > 0) {
    queryBuilder = queryBuilder.gte('auction_price', filters.minPrice);
  }
  
  if (filters.maxPrice && filters.maxPrice > 0) {
    queryBuilder = queryBuilder.lte('auction_price', filters.maxPrice);
  }
  
  if (filters.bedrooms && filters.bedrooms !== '') {
    queryBuilder = queryBuilder.gte('bedrooms', Number(filters.bedrooms));
  }
  
  if (filters.garage && filters.garage !== '') {
    queryBuilder = queryBuilder.gte('garage', Number(filters.garage));
  }
  
  if (filters.allow_financing) {
    queryBuilder = queryBuilder.eq('allow_financing', true);
  }
  
  if (filters.allow_consorcio) {
    queryBuilder = queryBuilder.eq('allow_consorcio', true);
  }
  
  if (filters.allow_fgts) {
    queryBuilder = queryBuilder.eq('allow_fgts', true);
  }
  
  if (filters.allow_parcelamento) {
    queryBuilder = queryBuilder.eq('allow_parcelamento', true);
  }

  const { data, error, count } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
};

export const usePropertiesPage = (filters: PropertyFilters, currentPage: number, itemsPerPage: number) => {
  const [processedProperties, setProcessedProperties] = useState<PropertyData[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [filteredTotal, setFilteredTotal] = useState<number>(0);

  const swrKey = JSON.stringify([filters, currentPage, itemsPerPage]);
  const { data: swrData, error: swrError, isValidating } = useSWR(
    swrKey,
    () => fetchPropertiesPage(filters, currentPage, itemsPerPage),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (swrData) {
      let sorted = swrData.data || [];
      
      if (filters && filters.riskLevel && filters.riskLevel !== '') {
        const riskMap: Record<string, string> = { baixo: 'low', médio: 'medium', alto: 'high' };
        const selectedRisk = riskMap[filters.riskLevel] || filters.riskLevel;
        sorted = sorted.filter(property => {
          let riskLevel = 'medium';
          if (property.discount < 30) riskLevel = 'low';
          else if (property.discount >= 30 && property.discount < 50) riskLevel = 'medium';
          else if (property.discount >= 50) riskLevel = 'high';
          return riskLevel === selectedRisk;
        });
      }
      
      setProcessedProperties(sorted);
      setTotalProperties(swrData.count || 0);
      setFilteredTotal(sorted.length);
    }
  }, [swrData, filters]);

  return {
    properties: processedProperties,
    totalProperties,
    filteredTotal,
    isLoading: isValidating,
    error: swrError ? 'Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.' : null
  };
};
