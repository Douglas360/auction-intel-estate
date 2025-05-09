
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Bell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock alerts data
const mockAlerts = [
  {
    id: '1',
    name: 'Apartamentos em SP até R$ 300 mil',
    propertyType: 'Apartamento',
    location: 'São Paulo, SP',
    priceRange: 'Até R$ 300.000',
    minDiscount: 30,
    auctionType: 'Qualquer',
    active: true,
    createdAt: '2025-04-10',
  },
  {
    id: '2',
    name: 'Casas em Alphaville',
    propertyType: 'Casa',
    location: 'Barueri, SP',
    priceRange: 'R$ 500.000 - R$ 1.500.000',
    minDiscount: 25,
    auctionType: 'Banco',
    active: true,
    createdAt: '2025-04-15',
  },
  {
    id: '3',
    name: 'Terrenos no Litoral Norte',
    propertyType: 'Terreno',
    location: 'Ubatuba, SP',
    priceRange: 'Até R$ 400.000',
    minDiscount: 20,
    auctionType: 'Judicial',
    active: false,
    createdAt: '2025-03-20',
  }
];

const UserAlerts = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Meus Alertas</h2>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> Novo Alerta
        </Button>
      </div>
      
      {mockAlerts.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-gray-500 mb-4">Você ainda não tem alertas configurados.</p>
            <Button>Criar Alerta</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Desconto Min.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.name}</TableCell>
                    <TableCell>{alert.propertyType}</TableCell>
                    <TableCell>{alert.location}</TableCell>
                    <TableCell>{alert.priceRange}</TableCell>
                    <TableCell>{alert.minDiscount}%</TableCell>
                    <TableCell>
                      <Badge variant={alert.active ? "default" : "outline"} className={
                        alert.active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                      }>
                        {alert.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Como funcionam os alertas?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-500">
              <p>Crie alertas personalizados para receber notificações por e-mail sempre que novos imóveis que correspondam aos seus critérios aparecerem na plataforma.</p>
              <p className="mt-2">Você pode configurar múltiplos alertas com diferentes filtros para não perder nenhuma oportunidade.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAlerts;
