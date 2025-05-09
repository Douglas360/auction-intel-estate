
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash, User, Home, Gavel, AlertTriangle } from 'lucide-react';

// Mock data for the admin dashboard
const mockProperties = [
  {
    id: '1',
    title: 'Apartamento 3 dormitórios no Morumbi',
    type: 'Apartamento',
    address: 'Rua Engenheiro João de Ulhôa Cintra, 214, Apto 132',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 450000,
    marketPrice: 650000,
    discount: 30,
    auctionDate: '2025-06-15',
    auctionType: 'Judicial',
    riskLevel: 'low',
    imageUrl: '/placeholder.svg',
    status: 'active'
  },
  {
    id: '2',
    title: 'Casa em condomínio em Alphaville',
    type: 'Casa',
    address: 'Alameda Grajau, 325, Residencial 5',
    city: 'Barueri',
    state: 'SP',
    auctionPrice: 1200000,
    marketPrice: 1850000,
    discount: 35,
    auctionDate: '2025-06-22',
    auctionType: 'Extrajudicial',
    riskLevel: 'medium',
    imageUrl: '/placeholder.svg',
    status: 'active'
  },
  {
    id: '3',
    title: 'Terreno comercial na Marginal Tietê',
    type: 'Terreno',
    address: 'Avenida Marginal Tietê, 2500',
    city: 'São Paulo',
    state: 'SP',
    auctionPrice: 900000,
    marketPrice: 1300000,
    discount: 31,
    auctionDate: '2025-07-05',
    auctionType: 'Banco',
    riskLevel: 'low',
    imageUrl: '/placeholder.svg',
    status: 'pending'
  },
];

const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'admin',
    lastLogin: '2025-05-08T14:22:00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    role: 'user',
    lastLogin: '2025-05-07T09:45:00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    role: 'user',
    lastLogin: '2025-05-05T16:30:00',
    status: 'inactive'
  }
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  
  const handleEditProperty = (property: any) => {
    setEditingProperty({...property});
  };
  
  const handleDeleteProperty = (id: string) => {
    // In a real app, this would call an API to delete the property
    toast.success(`Imóvel ${id} excluído com sucesso.`);
  };
  
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to save the property
    toast.success("Imóvel salvo com sucesso!");
    setEditingProperty(null);
  };
  
  const handleAddNewProperty = () => {
    setEditingProperty({
      id: '',
      title: '',
      type: '',
      address: '',
      city: '',
      state: '',
      auctionPrice: 0,
      marketPrice: 0,
      discount: 0,
      auctionDate: '',
      auctionType: '',
      riskLevel: 'low',
      imageUrl: '/placeholder.svg',
      status: 'pending'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button className="bg-auction-primary hover:bg-auction-secondary">
            <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
          </Button>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="properties">Imóveis</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProperties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 novos imóveis esta semana
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leilões Ativos</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +3 leilões nos próximos 7 dias
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 novo usuário esta semana
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Últimos Imóveis Adicionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProperties.slice(0, 3).map(property => (
                      <div key={property.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{property.city} - {property.state}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-right">{formatCurrency(property.auctionPrice)}</p>
                          <p className="text-sm text-green-600">{property.discount}% off</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alertas do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-md bg-yellow-50 border-l-4 border-yellow-400">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Scraper do TJ-SP parado</p>
                          <p className="text-sm text-gray-600">O serviço de coleta está inativo há 6 horas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-md bg-red-50 border-l-4 border-red-400">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Falha na API de precificação</p>
                          <p className="text-sm text-gray-600">A integração com ZAP Imóveis está com erro</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties">
            {editingProperty ? (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProperty.id ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProperty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input 
                          id="title" 
                          value={editingProperty.title} 
                          onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Imóvel</Label>
                        <Select 
                          value={editingProperty.type} 
                          onValueChange={(value) => setEditingProperty({...editingProperty, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apartamento">Apartamento</SelectItem>
                            <SelectItem value="Casa">Casa</SelectItem>
                            <SelectItem value="Terreno">Terreno</SelectItem>
                            <SelectItem value="Comercial">Comercial</SelectItem>
                            <SelectItem value="Rural">Rural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input 
                          id="address" 
                          value={editingProperty.address} 
                          onChange={(e) => setEditingProperty({...editingProperty, address: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input 
                            id="city" 
                            value={editingProperty.city} 
                            onChange={(e) => setEditingProperty({...editingProperty, city: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input 
                            id="state" 
                            value={editingProperty.state} 
                            onChange={(e) => setEditingProperty({...editingProperty, state: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={editingProperty.status} 
                            onValueChange={(value) => setEditingProperty({...editingProperty, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="sold">Vendido</SelectItem>
                              <SelectItem value="canceled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auctionPrice">Valor do Leilão</Label>
                        <Input 
                          id="auctionPrice" 
                          type="number"
                          value={editingProperty.auctionPrice} 
                          onChange={(e) => setEditingProperty({...editingProperty, auctionPrice: Number(e.target.value)})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="marketPrice">Valor de Mercado</Label>
                        <Input 
                          id="marketPrice" 
                          type="number"
                          value={editingProperty.marketPrice} 
                          onChange={(e) => setEditingProperty({...editingProperty, marketPrice: Number(e.target.value)})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Desconto (%)</Label>
                        <Input 
                          id="discount" 
                          type="number"
                          value={editingProperty.discount} 
                          onChange={(e) => setEditingProperty({...editingProperty, discount: Number(e.target.value)})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auctionDate">Data do Leilão</Label>
                        <Input 
                          id="auctionDate" 
                          type="date"
                          value={editingProperty.auctionDate} 
                          onChange={(e) => setEditingProperty({...editingProperty, auctionDate: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auctionType">Tipo do Leilão</Label>
                        <Select 
                          value={editingProperty.auctionType} 
                          onValueChange={(value) => setEditingProperty({...editingProperty, auctionType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Judicial">Judicial</SelectItem>
                            <SelectItem value="Extrajudicial">Extrajudicial</SelectItem>
                            <SelectItem value="Banco">Banco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="riskLevel">Nível de Risco</Label>
                        <Select 
                          value={editingProperty.riskLevel} 
                          onValueChange={(value) => setEditingProperty({...editingProperty, riskLevel: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível de risco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixo</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL da Imagem</Label>
                        <Input 
                          id="imageUrl" 
                          value={editingProperty.imageUrl} 
                          onChange={(e) => setEditingProperty({...editingProperty, imageUrl: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setEditingProperty(null)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-auction-primary hover:bg-auction-secondary">
                        Salvar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input 
                          placeholder="Buscar imóveis..." 
                          className="pl-10" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddNewProperty} className="bg-auction-primary hover:bg-auction-secondary">
                        <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">Título</th>
                          <th className="px-4 py-3 text-left">Tipo</th>
                          <th className="px-4 py-3 text-left">Localização</th>
                          <th className="px-4 py-3 text-right">Valor</th>
                          <th className="px-4 py-3 text-center">Desconto</th>
                          <th className="px-4 py-3 text-left">Data do Leilão</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockProperties.map((property) => (
                          <tr key={property.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="font-medium">{property.title}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="">{property.type}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="">{property.city}, {property.state}</div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="font-medium">{formatCurrency(property.auctionPrice)}</div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                {property.discount}%
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="">{formatDate(property.auctionDate)}</div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Badge 
                                variant="outline"
                                className={property.status === 'active' 
                                  ? 'bg-green-50 text-green-600 border-green-200' 
                                  : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                }
                              >
                                {property.status === 'active' ? 'Ativo' : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditProperty(property)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteProperty(property.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input placeholder="Buscar usuários..." className="pl-10" />
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Função</th>
                      <th className="px-4 py-3 text-left">Último Login</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium">{user.name}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="">{user.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="capitalize">{user.role}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="">{new Date(user.lastLogin).toLocaleString('pt-BR')}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge 
                            variant="outline"
                            className={user.status === 'active' 
                              ? 'bg-green-50 text-green-600 border-green-200' 
                              : 'bg-red-50 text-red-600 border-red-200'
                            }
                          >
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Integração com APIs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-api">OpenAI API Key</Label>
                      <Input id="openai-api" type="password" value="sk-..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maps-api">Google Maps API Key</Label>
                      <Input id="maps-api" type="password" value="AIzaSy..." />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Configurações de Scraping</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scraping-interval">Intervalo de Atualização (horas)</Label>
                      <Input id="scraping-interval" type="number" value="12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scraping-sites">Sites de Leilão para Monitorar</Label>
                      <Textarea id="scraping-sites" className="min-h-[100px]" defaultValue="https://www.leilaoimovel.com.br/
https://www.leiloeiro.online/
https://www.megaleiloes.com.br/" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notificações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-from">Email de Envio</Label>
                      <Input id="email-from" type="email" value="notificacoes@leiloaimobi.com.br" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-template">Template de Notificação</Label>
                      <Textarea id="email-template" className="min-h-[100px]" defaultValue="Olá {nome},

Encontramos um novo imóvel que corresponde aos seus critérios de busca:

{titulo_imovel}
Valor: {valor_leilao}
Desconto: {desconto}%

Acesse agora para ver mais detalhes:
{link}

Atenciosamente,
Equipe LeiloaImobi" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-auction-primary hover:bg-auction-secondary" onClick={() => toast.success("Configurações salvas com sucesso!")}>
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
