
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
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
}

const PropertyCard = ({
  id,
  title,
  type,
  address,
  city,
  state,
  auctionPrice,
  marketPrice,
  discount,
  auctionDate,
  auctionType,
  riskLevel,
  imageUrl,
}: PropertyCardProps) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low': 
        return <Badge variant="outline" className="risk-badge-low">Risco Baixo</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="risk-badge-medium">Risco Médio</Badge>;
      case 'high': 
        return <Badge variant="outline" className="risk-badge-high">Risco Alto</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="property-card">
      <div className="relative h-44 overflow-hidden">
        <img 
          src={imageUrl || '/placeholder.svg'} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="discount-badge">
            {discount}% abaixo do mercado
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary">{auctionType}</Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Home className="h-4 w-4 mr-1" />
              <span>{type}</span>
            </div>
          </div>
          {getRiskBadge(riskLevel)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-start text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{address}, {city} - {state}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Leilão em {new Date(auctionDate).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor do Leilão:</span>
            <span className="font-medium">{formatCurrency(auctionPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor de Mercado:</span>
            <span className="font-medium">{formatCurrency(marketPrice)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full space-y-2">
          <Button className="w-full bg-auction-primary hover:bg-auction-secondary" asChild>
            <Link to={`/properties/${id}`}>Ver detalhes</Link>
          </Button>
          <Button variant="outline" className="w-full border-auction-primary text-auction-primary hover:bg-auction-primary hover:text-white">
            Adicionar aos favoritos
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
