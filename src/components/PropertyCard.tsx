import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart as HeartIcon } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// Define risk level colors
const riskColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-400"
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
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
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
  clickable = false,
  isFavorite = false,
  onToggleFavorite,
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
      <Card className="overflow-hidden h-full transition-transform duration-300 hover:scale-[1.015] hover:shadow-lg focus-within:scale-[1.015] focus-within:shadow-lg">
        <div className="relative">
          {/* Ícone de favorito estilo AirBNB no topo esquerdo */}
          <button
            className={`absolute top-2 left-2 z-10 rounded-full p-2 bg-white/80 hover:bg-white shadow transition-all ${isFavorite ? 'text-red-600' : 'text-gray-400'}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite && onToggleFavorite(id);
            }}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <HeartIcon
              className={`w-6 h-6 ${isFavorite ? 'fill-red-600' : 'fill-none'}`}
              fill={isFavorite ? 'red' : 'none'}
            />
          </button>
          <img 
            src={imageUrl || "/placeholder.svg"} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
          {/* Badge de desconto sem tooltip */}
          <Badge className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-none animate-fade-in">
            {discount}% abaixo do mercado
          </Badge>
          {/* Badge de tipo de leilão sem tooltip */}
          <div className="absolute bottom-0 left-2 mb-2">
            <Badge className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-none animate-slide-in">
              {auctionType || 'Venda Online Caixa'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{title || `${propertyType} Caixa em ${city}`}</h3>
            <div className={`${riskColors[riskLevel]} text-xs px-2 py-1 rounded-md`}>
              Risco<br />
              {riskLabels[riskLevel].replace(' risco', '')}
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
            className="w-full bg-primary hover:bg-primary/90 transition-transform duration-200 hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary"
            onClick={(e) => {
              if (clickable) {
                e.preventDefault();
                window.location.href = detailUrl;
              }
            }}
          >
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    </CardWrapper>
  );
};

export default PropertyCard;
