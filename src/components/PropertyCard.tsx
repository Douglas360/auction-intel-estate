
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Gavel, AlertTriangle } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// Define risk level colors
const riskColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500"
};

// Define risk level labels
const riskLabels: Record<string, string> = {
  low: "Baixo risco",
  medium: "Médio risco",
  high: "Alto risco"
};

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  imageUrl?: string;
  auctionPrice: number;
  marketPrice: number;
  discount: number;
  auctionDate: string;
  auctionType?: string;
  riskLevel: 'low' | 'medium' | 'high';
  clickable?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  address,
  city,
  state,
  imageUrl,
  auctionPrice,
  marketPrice,
  discount,
  auctionDate,
  auctionType,
  riskLevel,
  clickable = false
}) => {
  const location = useLocation();
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date to Brazilian standard
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  };
  
  // Preserve current URL params when navigating to property detail
  const detailUrl = React.useMemo(() => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // Encode the current path+search as a param to return to later
    return `/properties/${id}?from=${encodeURIComponent(`${currentPath}${currentSearch}`)}`;
  }, [id, location.pathname, location.search]);
  
  // Generate property type from title or use a default
  const propertyType = title?.includes('Apartamento') ? 'Apartamento' : 'Casa';
  
  // Wrapper component that conditionally renders a Link or a div
  const CardWrapper = clickable 
    ? ({children}: {children: React.ReactNode}) => <Link to={detailUrl} className="block transition-transform duration-300">{children}</Link>
    : ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    
  return (
    <CardWrapper>
      <Card className="overflow-hidden h-full">
        {/* Property image with discount badge */}
        <div className="relative">
          <img 
            src={imageUrl || "/placeholder.svg"} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
            {discount}% abaixo do mercado
          </Badge>
          
          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white p-2 text-center">
            Venda Online Caixa
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{title || `${propertyType} Caixa em ${city}`}</h3>
            <div className="bg-yellow-100 text-xs px-2 py-1 rounded-md">
              Risco<br />Médio
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-1 text-sm text-gray-700">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{address}, {city} - {state}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-1 text-sm text-gray-700">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Leilão em {formatDate(auctionDate)}</span>
          </div>
          
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Valor do Leilão:</span>
              <span className="font-semibold">{formatCurrency(auctionPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Valor de Mercado:</span>
              <span>{formatCurrency(marketPrice)}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              if (clickable) {
                e.preventDefault();
                window.location.href = detailUrl;
              }
            }}
          >
            Ver detalhes
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Adicionar aos favoritos
          </Button>
        </CardFooter>
      </Card>
    </CardWrapper>
  );
};

export default PropertyCard;
