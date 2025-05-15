import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Trash, Calculator, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ProfitSimulatorDrawer } from './simulator/ProfitSimulatorDrawer';
import { toast } from '@/components/ui/use-toast';

interface Property {
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

interface UserFavoritesProps {
  favorites: Property[];
  onRemoveFavorite?: (propertyId: string) => void;
}

const UserFavorites = ({ favorites, onRemoveFavorite }: UserFavoritesProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorProperty, setSimulatorProperty] = useState<Property | null>(null);

  if (favorites.length === 0) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <p className="text-gray-500 mb-4">Você ainda não tem imóveis favoritos.</p>
          <Button asChild>
            <Link to="/properties?sort=discount">Buscar Imóveis</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Meus Imóveis Favoritos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3">
                <img 
                  src={property.imageUrl || '/placeholder.svg'} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-2/3 p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                  <Badge variant="outline" className={
                    property.riskLevel === 'low' ? 'bg-green-100 text-green-800' : 
                    property.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }>
                    Risco {property.riskLevel === 'low' ? 'Baixo' : 
                           property.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">{property.address}, {property.city} - {property.state}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Leilão em {new Date(property.auctionDate).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="text-sm text-gray-500">Valor do Leilão:</div>
                    <div className="font-medium">{formatCurrency(property.auctionPrice)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Desconto:</div>
                    <div className="font-medium text-green-600">{property.discount}%</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button size="sm" asChild>
                    <Link to={`/properties/${property.id}`}>Ver Detalhes</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center" onClick={() => { setSimulatorProperty(property); setSimulatorOpen(true); }}>
                    <Calculator className="h-4 w-4 mr-1" />
                    Simular
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center" onClick={() => toast({ title: 'Em desenvolvimento', description: 'Esta funcionalidade estará disponível em breve.' })}>
                    <FileText className="h-4 w-4 mr-1" />
                    Análise
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => onRemoveFavorite && onRemoveFavorite(property.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {simulatorProperty && (
        <ProfitSimulatorDrawer
          open={simulatorOpen}
          onClose={() => setSimulatorOpen(false)}
          property={simulatorProperty}
        />
      )}
    </div>
  );
};

export default UserFavorites;
