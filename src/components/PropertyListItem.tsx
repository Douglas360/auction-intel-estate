import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart as HeartIcon } from "lucide-react";
import { slugify } from '@/utils/slugify';

const getDiscountBadgeColor = (discount: number): string => {
  if (discount > 80) return "bg-green-500 text-white";
  if (discount > 60) return "bg-yellow-500 text-black";
  if (discount > 40) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
};

interface PropertyListItemProps {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  auctionPrice: number;
  marketPrice: number;
  discount: number;
  auctionDate: string;
  auctionType?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({
  id,
  title,
  address,
  city,
  state,
  auctionPrice,
  marketPrice,
  discount,
  auctionDate,
  auctionType,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm mb-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl font-bold text-auction-primary">{auctionPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span className="line-through text-gray-400">{marketPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <Badge className={`${getDiscountBadgeColor(discount)} ml-2`}>{discount}%</Badge>
        </div>
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sm text-gray-600 truncate">{address}, {city} - {state}</div>
        <div className="text-xs text-gray-500">Leilão em {new Date(auctionDate).toLocaleDateString('pt-BR')}</div>
        {auctionType && (
          <Badge className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 mt-1">
            {auctionType}
          </Badge>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 ml-4">
        <Button variant="ghost" onClick={() => onToggleFavorite && onToggleFavorite(id)}>
          <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
        </Button>
        <Button asChild>
          <a href={`/imovel/${state}/${slugify(city)}/${id}`}>Ver detalhes</a>
        </Button>
      </div>
    </div>
  );
};

export default PropertyListItem; 