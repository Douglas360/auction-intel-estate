
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Gavel, AlertTriangle } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

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
  
  // Wrapper component that conditionally renders a Link or a div
  const CardWrapper = clickable 
    ? ({children}: {children: React.ReactNode}) => <Link to={detailUrl} className="block transition-transform hover:scale-[1.02] duration-300">{children}</Link>
    : ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    
  return (
    <CardWrapper>
      <Card className="overflow-hidden h-full flex flex-col">
        {/* Property image with discount badge */}
        <div className="relative">
          <img 
            src={imageUrl || "/placeholder.svg"} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-auction-primary text-white">
            {discount}% abaixo do mercado
          </Badge>
          
          {/* Risk indicator badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-full text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${riskColors[riskLevel]}`}></div>
            <span>{riskLabels[riskLevel]}</span>
          </div>
        </div>
        
        {/* Card content */}
        <CardContent className="pt-4 flex-grow">
          <h3 className="font-bold text-lg line-clamp-2 mb-2">{title}</h3>
          
          <div className="flex items-start gap-1 text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{address}, {city} - {state}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
            <Calendar className="w-4 h-4" />
            <span>Leilão: {formatDate(auctionDate)}</span>
          </div>
          
          {auctionType && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <Gavel className="w-4 h-4" />
              <span>{auctionType}</span>
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Valor de mercado:</span>
              <span className="font-medium line-through text-gray-500">{formatCurrency(marketPrice)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold text-auction-primary">Lance mínimo:</span>
              <span className="font-bold text-auction-primary">{formatCurrency(auctionPrice)}</span>
            </div>
          </div>
        </CardContent>
        
        {/* Card footer - more visible call to action */}
        <CardFooter className="pt-0 pb-4">
          {clickable && (
            <div className="text-center w-full mt-2">
              <span className="text-sm font-medium text-auction-primary">Ver detalhes →</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </CardWrapper>
  );
};

export default PropertyCard;
