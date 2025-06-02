import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash, User, Home, Gavel, AlertTriangle, MapPin, Calendar, CreditCard, Loader2, Ticket } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import SubscriptionPlansAdmin from './admin/SubscriptionPlans';
import AllUsers from './admin/AllUsers';
import DiscountCoupons from './admin/DiscountCoupons';
import { supabase } from '@/integrations/supabase/client';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  // Fix the auctions state type to match what comes from the database
  const [auctions, setAuctions] = useState<{
    auction_number: number;
    auction_date: string;
    min_bid: string | number;
    id?: string;
    property_id?: string;
  }[]>([
    { auction_number: 1, auction_date: '', min_bid: '' }
  ]);
  const [propertyAuctions, setPropertyAuctions] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Query for dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      // Get active auctions count
      const currentDate = new Date().toISOString().split('T')[0];
      const { count: auctionsCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('auction_date', currentDate);
      
      // Get total users count from edge function
      const { data: usersData } = await supabase.functions.invoke('get-all-users');
      const usersCount = usersData?.length || 0;
      
      // Get premium users count
      const { count: premiumCount } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      return {
        propertiesCount: propertiesCount || 0,
        auctionsCount: auctionsCount || 0,
        usersCount,
        premiumCount: premiumCount || 0
      };
    },
    enabled: activeTab === 'dashboard'
  });

  const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  };
  
  const handleEditProperty = async (property: any) => {
    // Buscar leilões do imóvel
    const { data: auctionsData } = await supabase
      .from('auctions')
      .select('*')
      .eq('property_id', property.id)
      .order('auction_number');
    
    // Convert auction min_bid to string for form display
    const processedAuctions = auctionsData && auctionsData.length > 0 
      ? auctionsData.map(auction => ({
          ...auction,
          min_bid: auction.min_bid.toString()
        }))
      : [{ auction_number: 1, auction_date: '', min_bid: '' }];
      
    setAuctions(processedAuctions);
    
    setEditingProperty({
      id: property.id,
      title: property.title || '',
      description: property.description || '',
      type: property.type || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      auctionPrice: property.auction_price ?? 0,
      marketPrice: property.market_price ?? 0,
      discount: property.discount ?? 0,
      auctionDate: property.auction_date || '',
      auctionType: property.auction_type || '',
      imageUrl: (Array.isArray(property.images) && property.images.length > 0) ? property.images[0] : (property.image_url || ''),
      status: property.status || 'pending',
      auctioneer: property.auctioneer || '',
      auctioneer_site: property.auctioneer_site || '',
      process_number: property.process_number || '',
      court: property.court || '',
      min_bid: property.min_bid ?? 0,
      region_description: property.region_description || '',
      matricula_pdf_url: property.matricula_pdf_url || '',
      images: property.images || [],
    });
  };
  
  const handleDeleteProperty = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.');
    if (!confirmDelete) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      toast({
        title: "Erro",
        description: 'Erro ao excluir imóvel: ' + error.message,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Sucesso",
      description: 'Imóvel excluído com sucesso.',
    });
    await fetchProperties();
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };
  
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    let imageUrls: string[] = [];
    // Se o usuário fez upload de novas imagens, faz upload e usa elas
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('properties-images').upload(fileName, file);
        if (error) {
          toast({
            title: "Erro",
            description: 'Erro ao fazer upload da imagem: ' + error.message,
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
        const url = supabase.storage.from('properties-images').getPublicUrl(fileName).data.publicUrl;
        imageUrls.push(url);
      }
    } else if (editingProperty.images && editingProperty.images.length > 0) {
      // Se não fez upload, mantém as imagens antigas
      imageUrls = editingProperty.images;
    }
    const propertyData = {
      title: editingProperty.title,
      description: editingProperty.description,
      type: editingProperty.type,
      address: editingProperty.address,
      city: editingProperty.city,
      state: editingProperty.state,
      auction_price: editingProperty.auctionPrice,
      market_price: editingProperty.marketPrice,
      discount: editingProperty.discount,
      auction_date: editingProperty.auctionDate ? editingProperty.auctionDate : null,
      auction_type: editingProperty.auctionType,
      status: editingProperty.status,
      images: imageUrls,
      auctioneer: editingProperty.auctioneer,
      auctioneer_site: editingProperty.auctioneer_site,
      process_number: editingProperty.process_number,
      court: editingProperty.court,
      min_bid: editingProperty.min_bid,
      region_description: editingProperty.region_description,
      matricula_pdf_url: editingProperty.matricula_pdf_url,
    };
    let propertyId = editingProperty.id;
    if (propertyId) {
      // UPDATE
      const { error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId);
      if (error) {
        toast({
          title: "Erro",
          description: 'Erro ao atualizar imóvel: ' + error.message,
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      // Remove auctions antigos
      await supabase.from('auctions').delete().eq('property_id', propertyId);
      toast({
        title: "Sucesso",
        description: "Imóvel atualizado com sucesso!",
      });
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select('id');
      if (error) {
        toast({
          title: "Erro",
          description: 'Erro ao salvar imóvel: ' + error.message,
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      propertyId = data[0].id;
      toast({
        title: "Sucesso",
        description: "Imóvel salvo com sucesso!",
      });
    }
    
    // Salvar auctions - Convert string min_bid to number for database insertion
    for (const auction of auctions) {
      if (!auction.auction_date || !auction.min_bid) continue; // Pula leilões incompletos
      await supabase.from('auctions').insert([{
        property_id: propertyId,
        auction_number: auction.auction_number,
        auction_date: auction.auction_date,
        min_bid: Number(auction.min_bid)
      }]);
    }
    
    await fetchProperties();
    setEditingProperty(null);
    setImageFiles([]);
    setIsSaving(false);
  };
  
  const handleAddNewProperty = () => {
    setEditingProperty({
      id: '',
      title: '',
      description: '',
      type: '',
      address: '',
      city: '',
      state: '',
      auctionPrice: 0,
      marketPrice: 0,
      discount: 0,
      auctionDate: '',
      auctionType: '',
      imageUrl: '',
      status: 'pending',
      auctioneer: '',
      auctioneer_site: '',
      process_number: '',
      court: '',
      min_bid: 0,
      region_description: '',
      matricula_pdf_url: '',
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  useEffect(() => {
    if (activeTab === 'properties') {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        fetchProperties();
      }, 400);
    }
    // eslint-disable-next-line
  }, [searchQuery, currentPage, activeTab]);

  const fetchProperties = async () => {
    setIsLoadingProperties(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    let query = supabase.from('properties').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (searchQuery.trim() !== '') {
      // Busca case insensitive por título ou descrição
      query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
    }
    const { data, error, count } = await query.range(from, to);
    if (error) {
      toast({
        title: "Erro",
        description: 'Erro ao buscar imóveis: ' + error.message,
        variant: "destructive"
      });
      setIsLoadingProperties(false);
      return;
    }
    setProperties(data || []);
    setTotalProperties(count || 0);
    setIsLoadingProperties(false);
  };

  useEffect(() => {
    const fetchAllAuctions = async () => {
      if (properties.length === 0) return;
      const ids = properties.map(p => p.id);
      const batchSize = 50;
      let allAuctions = [];
      for (let i = 0; i < ids.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize);
        const { data } = await supabase
          .from('auctions')
          .select('property_id, auction_number, auction_date')
          .in('property_id', batchIds);
        if (data) allAuctions = allAuctions.concat(data);
      }
      // Agrupa por property_id
      const grouped = {};
      allAuctions.forEach(a => {
        if (!grouped[a.property_id]) grouped[a.property_id] = [];
        grouped[a.property_id].push(a);
      });
      setPropertyAuctions(grouped);
    };
    fetchAllAuctions();
  }, [properties]);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      const { data, error } = await supabase.from('system_settings').select('*').single();
      if (!error && data) setSettings(data);
      setIsLoadingSettings(false);
    };
    fetchSettings();
  }, []);

  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsLoadingSettings(true);
    const { error } = await supabase
      .from('system_settings')
      .update({
        openai_api_key: settings.openai_api_key,
        google_maps_api_key: settings.google_maps_api_key,
        scraping_interval: settings.scraping_interval,
        scraping_sites: settings.scraping_sites,
        notification_email: settings.notification_email,
        notification_template: settings.notification_template,
        show_plans_section: settings.show_plans_section,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);
    setIsLoadingSettings(false);
    if (error) {
      toast({
        title: "Erro",
        description: 'Erro ao salvar configurações: ' + error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: 'Configurações salvas com sucesso!',
      });
    }
  };

  const totalPages = Math.ceil((totalProperties || 0) / itemsPerPage);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button className="bg-auction-primary hover:bg-auction-secondary" onClick={handleAddNewProperty}>
            <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
          </Button>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="properties">Imóveis</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats?.propertiesCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +2 novos imóveis esta semana
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leilões Ativos</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats?.auctionsCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +3 leilões nos próximos 7 dias
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats?.usersCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +1 novo usuário esta semana
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinantes Premium</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats?.premiumCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +1 novo assinante esta semana
                      </p>
                    </>
                  )}
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
                    {properties.slice(0, 3).map(property => (
                      <div key={property.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{property.city} - {property.state}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-right">{formatCurrency(property.auction_price)}</p>
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
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={editingProperty.description}
                          onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
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
                        <Label htmlFor="auctionType">Tipo de Leilão</Label>
                        <Select 
                          value={editingProperty.auctionType} 
                          onValueChange={(value) => setEditingProperty({...editingProperty, auctionType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de leilão" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Judicial">Judicial</SelectItem>
                            <SelectItem value="Extrajudicial">Extrajudicial</SelectItem>
                            <SelectItem value="Banco">Banco</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Leilões</Label>
                        {auctions.map((auction, idx) => (
                          <div key={idx} className="flex gap-2 items-end">
                            <div>
                              <Label>Data do {auction.auction_number}º Leilão</Label>
                              <Input
                                type="date"
                                value={auction.auction_date}
                                onChange={e => {
                                  const newAuctions = [...auctions];
                                  newAuctions[idx].auction_date = e.target.value;
                                  setAuctions(newAuctions);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Lance mínimo</Label>
                              <Input
                                type="number"
                                value={auction.min_bid}
                                onChange={e => {
                                  const newAuctions = [...auctions];
                                  newAuctions[idx].min_bid = e.target.value;
                                  setAuctions(newAuctions);
                                }}
                              />
                            </div>
                            {auctions.length > 1 && (
                              <Button type="button" variant="destructive" onClick={() => setAuctions(auctions.filter((_, i) => i !== idx))}>
                                Remover
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() =>
                            setAuctions([
                              ...auctions,
                              { auction_number: auctions.length + 1, auction_date: '', min_bid: '' }
                            ])
                          }
                        >
                          Adicionar Leilão
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="images_url">URL(s) da(s) Imagem(ns)</Label>
                        <Textarea
                          id="images_url"
                          placeholder="Cole uma ou mais URLs de imagens, separadas por vírgula ou quebra de linha"
                          value={editingProperty.images ? editingProperty.images.join('\n') : ''}
                          onChange={e => {
                            const value = e.target.value;
                            // Permite separar por vírgula ou quebra de linha
                            const urls = value
                              .split(/\n|,/)
                              .map(url => url.trim())
                              .filter(url => url.length > 0);
                            setEditingProperty({ ...editingProperty, images: urls });
                          }}
                          className="min-h-[60px] font-mono"
                        />
                        <Label htmlFor="images_upload">Upload de Imagens</Label>
                        <Input
                          id="images_upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files) {
                              setImageFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                        {editingProperty.images && editingProperty.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {editingProperty.images.map((imgUrl: string, idx: number) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={`Imagem ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auctioneer">Leiloeiro</Label>
                        <Input
                          id="auctioneer"
                          value={editingProperty.auctioneer}
                          onChange={(e) => setEditingProperty({ ...editingProperty, auctioneer: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auctioneer_site">Site do Leiloeiro</Label>
                        <Input
                          id="auctioneer_site"
                          value={editingProperty.auctioneer_site}
                          onChange={(e) => setEditingProperty({ ...editingProperty, auctioneer_site: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="process_number">Processo</Label>
                        <Input
                          id="process_number"
                          value={editingProperty.process_number}
                          onChange={(e) => setEditingProperty({ ...editingProperty, process_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="court">Vara/Tribunal</Label>
                        <Input
                          id="court"
                          value={editingProperty.court}
                          onChange={(e) => setEditingProperty({ ...editingProperty, court: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region_description">Descrição da Região</Label>
                        <Textarea
                          id="region_description"
                          value={editingProperty.region_description}
                          onChange={(e) => setEditingProperty({ ...editingProperty, region_description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="matricula_pdf_url">PDF da Matrícula (URL)</Label>
                        <Input
                          id="matricula_pdf_url"
                          value={editingProperty.matricula_pdf_url}
                          onChange={(e) => setEditingProperty({ ...editingProperty, matricula_pdf_url: e.target.value })}
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
                      <Button type="submit" className="bg-auction-primary hover:bg-auction-secondary" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar'
                        )}
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
                          onChange={handleSearchChange}
                        />
                      </div>
                      <Button onClick={handleAddNewProperty} className="bg-auction-primary hover:bg-auction-secondary">
                        <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {isLoadingProperties ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left">Imagem</th>
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
                          {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() => handleEditProperty(property)}
                                  style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                                  aria-label={`Editar imóvel ${property.title}`}
                                >
                                  {property.images && property.images.length > 0 ? (
                                    <img
                                      src={property.images[0]}
                                      alt={property.title}
                                      className="w-14 h-14 object-cover rounded-md border hover:opacity-80 transition"
                                    />
                                  ) : property.image_url ? (
                                    <img
                                      src={property.image_url}
                                      alt={property.title}
                                      className="w-14 h-14 object-cover rounded-md border hover:opacity-80 transition"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border text-xs">
                                      Sem imagem
                                    </div>
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  className="font-medium text-left hover:underline focus:outline-none"
                                  onClick={() => handleEditProperty(property)}
                                  aria-label={`Editar imóvel ${property.title}`}
                                  style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                                >
                                  {property.title}
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <div className="">{property.type}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="">{property.city}, {property.state}</div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="font-medium">{formatCurrency(property.auction_price || 0)}</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  {property.discount}%
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <div className="">
                                  {propertyAuctions[property.id] && propertyAuctions[property.id][0]?.auction_date
                                    ? formatDate(propertyAuctions[property.id][0].auction_date)
                                    : '-'
                                  }
                                </div>
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
                )}
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={e => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {(() => {
                        const pages = [];
                        const showPages = [];
                        // Sempre mostrar as 2 primeiras e 2 últimas
                        showPages.push(1);
                        if (totalPages > 1) showPages.push(2);
                        if (currentPage > 4) showPages.push('start-ellipsis');
                        // Páginas próximas da atual
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          if (i > 2 && i < totalPages - 1) showPages.push(i);
                        }
                        if (currentPage < totalPages - 3) showPages.push('end-ellipsis');
                        if (totalPages > 2) showPages.push(totalPages - 1);
                        if (totalPages > 1) showPages.push(totalPages);
                        // Remover duplicados e fora do range
                        const uniquePages = Array.from(new Set(showPages)).filter(p => typeof p === 'number' && p >= 1 && p <= totalPages);
                        let lastPage = 0;
                        uniquePages.forEach((page, idx) => {
                          if (lastPage && page - lastPage > 1) {
                            pages.push(
                              <PaginationItem key={`ellipsis-${page}-${idx}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          pages.push(
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={e => { e.preventDefault(); setCurrentPage(page); }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                          lastPage = page;
                        });
                        return pages;
                      })()}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={e => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <AllUsers />
          </TabsContent>
          
          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <SubscriptionPlansAdmin />
          </TabsContent>
          
          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <DiscountCoupons />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSettings ? (
                  <div>Carregando configurações...</div>
                ) : settings ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Configurações Gerais</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium">
                            Exibir Seção de Planos
                          </Label>
                          <p className="text-sm text-gray-500">
                            Controla se a seção de planos aparece na página inicial e no menu
                          </p>
                        </div>
                        <Switch
                          checked={settings.show_plans_section ?? true}
                          onCheckedChange={(checked) => handleSettingsChange('show_plans_section', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Integração com APIs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="openai-api">OpenAI API Key</Label>
                          <Input id="openai-api" type="password" value={settings.openai_api_key || ''} onChange={e => handleSettingsChange('openai_api_key', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maps-api">Google Maps API Key</Label>
                          <Input id="maps-api" type="password" value={settings.google_maps_api_key || ''} onChange={e => handleSettingsChange('google_maps_api_key', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Configurações de Scraping</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scraping-interval">Intervalo de Atualização (horas)</Label>
                          <Input id="scraping-interval" type="number" value={settings.scraping_interval || ''} onChange={e => handleSettingsChange('scraping_interval', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scraping-sites">Sites de Leilão para Monitorar</Label>
                          <Textarea id="scraping-sites" className="min-h-[100px]" value={settings.scraping_sites || ''} onChange={e => handleSettingsChange('scraping_sites', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Notificações</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-from">Email de Envio</Label>
                          <Input id="email-from" type="email" value={settings.notification_email || ''} onChange={e => handleSettingsChange('notification_email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-template">Template de Notificação</Label>
                          <Textarea id="email-template" className="min-h-[100px]" value={settings.notification_template || ''} onChange={e => handleSettingsChange('notification_template', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>Não foi possível carregar as configurações.</div>
                )}
                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSettings(settings)} disabled={isLoadingSettings}>Cancelar</Button>
                  <Button className="bg-auction-primary hover:bg-auction-secondary" onClick={handleSaveSettings} disabled={isLoadingSettings}>
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
