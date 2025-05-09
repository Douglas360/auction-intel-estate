
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, User, Bell, FileText } from 'lucide-react';

interface UserDashboardHeaderProps {
  user: {
    name: string;
    matchingAuctions: number;
    favoriteCount: number;
    alertCount: number;
    lastAnalysis: string;
  };
}

const UserDashboardHeader = ({ user }: UserDashboardHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo(a), {user.name}!</h1>
        <p className="text-gray-500 mt-2">Confira as últimas oportunidades de leilões de imóveis</p>
      </div>
      
      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-12 w-12 rounded-full bg-auction-primary/10 flex items-center justify-center mr-4">
              <Home className="h-6 w-6 text-auction-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Leilões no perfil</p>
              <h3 className="text-2xl font-bold">{user.matchingAuctions}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Imóveis favoritos</p>
              <h3 className="text-2xl font-bold">{user.favoriteCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alertas ativos</p>
              <h3 className="text-2xl font-bold">{user.alertCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Último parecer</p>
              <h3 className="text-lg font-bold">{formatDate(user.lastAnalysis)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHeader;
