
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import RiskAnalyzer from '@/components/RiskAnalyzer';
import ProfitSimulator from '@/components/ProfitSimulator';
import { Calendar, MapPin, Home, DollarSign, Clock, Gavel, AlertTriangle, Heart, Share2, FileText, FilePdf } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { useProperties } from '@/hooks/useProperties';
import { createClient } from '@supabase/supabase-js';

const supabaseAny = createClient(
  'https://pkvrxhczpvmopgzgcqmk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnJ4aGN6cHZtb3BnemdjcW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDE1NzEsImV4cCI6MjA2MjM3NzU3MX0.8Cp2c2UXtRv7meUl8KNx4ihgdEhUTUd_dLeYDnUQn9o'
);

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, isLoading, error } = useProperties();
  const [mapsApiKey, setMapsApiKey] = React.useState<string | null>(null);
  const [isLoadingMapsKey, setIsLoadingMapsKey] = React.useState(true);
  const [mapsKeyError, setMapsKeyError] = React.useState<string | null>(null);

  const property = properties.find((p) => p.id === id);

  React.useEffect(() => {
    const fetchMapsKey = async () => {
      setIsLoadingMapsKey(true);
      const { data, error } = await supabaseAny.from('system_settings').select('google_maps_api_key').single();
      if (!error && data && data.google_maps_api_key) {
        setMapsApiKey(data.google_maps_api_key);
        setMapsKeyError(null);
      } else {
        setMapsApiKey(null);
        setMapsKeyError('Não foi possível carregar a chave da API do Google Maps.');
      }
      setIsLoadingMapsKey(false);
    };
    fetchMapsKey();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 pt-10">
          <div className="text-center py-20">
            <p>Carregando imóvel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    toast({
      title: "Imóvel não encontrado",
      description: "O imóvel que você está procurando não está disponível.",
      variant: "destructive",
    });
    setTimeout(() => {
      navigate('/properties');
    }, 2000);
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 pt-10">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Imóvel não encontrado</h1>
            <p className="mb-8">O imóvel que você está procurando não está disponível.</p>
            <Button onClick={() => navigate('/properties')}>Ver todos os imóveis</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
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

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property.title,
      text: `Confira este imóvel: ${property.title}`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiado!",
        description: "O link do imóvel foi copiado para a área de transferência.",
        variant: "default",
      });
    }
  };

  // Function to open documents in new tab
  const openDocument = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Documento não disponível",
        description: "Este documento não está disponível no momento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 pt-20 pb-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
              <img 
                src={property.imageUrl || '/placeholder.svg'} 
                alt={property.title} 
                className="w-full h-80 object-cover"
              />
            </div>
            {/* Bloco de informações principais */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Linha 1: Título à esquerda, badge à direita */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold min-w-0">{property.title}</h1>
                <Badge className="discount-badge text-base whitespace-nowrap bg-auction-primary text-white px-4 py-2 rounded-full">
                  {property.discount}% abaixo do mercado
                </Badge>
              </div>
              {/* Linha 2: Endereço */}
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}, {property.city} - {property.state}</span>
              </div>
              {/* Linha 3: tipo, valor, data */}
              <div className="flex items-center space-x-4 text-sm mt-2">
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1 text-gray-700" />
                  <span>{property.type}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                  <span>{formatCurrency(property.auctionPrice)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-700" />
                  <span>{formatDate(property.auctionDate)}</span>
                </div>
              </div>
              {/* Linha 4: Botões */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button className="bg-auction-primary hover:bg-auction-secondary flex items-center gap-2">
                  <Gavel className="w-4 h-4" /> Quero arrematar
                </Button>
                <Button variant="outline" className="border-auction-primary text-auction-primary hover:bg-auction-primary hover:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Adicionar aos favoritos
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Compartilhar
                </Button>
              </div>
            </div>
            {/* Tabs */}
            <Tabs defaultValue="details" className="bg-white rounded-lg shadow-sm">
              <TabsList className="w-full border-b">
                <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                <TabsTrigger value="auction" className="flex-1">Informações do Leilão</TabsTrigger>
                <TabsTrigger value="location" className="flex-1">Localização</TabsTrigger>
              </TabsList>
              {/* Detalhes */}
              <TabsContent value="details" className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Comparativo de Preços</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span>Valor do Leilão:</span>
                      <span className="font-bold">{formatCurrency(property.auctionPrice)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Valor de Mercado:</span>
                      <span className="font-bold">{formatCurrency(property.marketPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Economia:</span>
                      <span className="font-bold">{formatCurrency(property.marketPrice - property.auctionPrice)}</span>
                    </div>
                  </div>
                </div>
                {/* Documentos disponíveis */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Documentos</h2>
                  <div className="flex gap-6">
                    {property.matricula_pdf_url && (
                      <div 
                        className="flex flex-col items-center cursor-pointer border border-gray-200 p-4 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => openDocument(property.matricula_pdf_url)}
                      >
                        <div className="border border-teal-700 rounded p-4 mb-2">
                          <FileText className="w-8 h-8 text-teal-700" />
                        </div>
                        <span className="text-teal-700">Matrícula</span>
                      </div>
                    )}
                    
                    {property.edital_pdf_url && (
                      <div 
                        className="flex flex-col items-center cursor-pointer border border-gray-200 p-4 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => openDocument(property.edital_pdf_url)}
                      >
                        <div className="border border-teal-700 rounded p-4 mb-2">
                          <FilePdf className="w-8 h-8 text-teal-700" />
                        </div>
                        <span className="text-teal-700">Edital</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {property.details && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Detalhes Técnicos</h2>
                    <ul className="list-disc pl-6 text-gray-700">
                      {property.details.area && <li><strong>Área:</strong> {property.details.area}</li>}
                      {property.details.bedrooms && <li><strong>Dormitórios:</strong> {property.details.bedrooms}</li>}
                      {property.details.bathrooms && <li><strong>Banheiros:</strong> {property.details.bathrooms}</li>}
                      {property.details.parkingSpots && <li><strong>Vagas:</strong> {property.details.parkingSpots}</li>}
                      {property.details.floor && <li><strong>Andar:</strong> {property.details.floor}</li>}
                      {property.details.yearBuilt && <li><strong>Ano de construção:</strong> {property.details.yearBuilt}</li>}
                      {property.details.condominium && <li><strong>Condomínio:</strong> {formatCurrency(property.details.condominium)}</li>}
                      {property.details.iptu && <li><strong>IPTU:</strong> {formatCurrency(property.details.iptu)}</li>}
                    </ul>
                  </div>
                )}
              </TabsContent>
              {/* Informações do Leilão */}
              <TabsContent value="auction" className="p-6 space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                    <div>
                      <h4 className="font-semibold">Aviso importante</h4>
                      <p className="text-sm text-gray-600">
                        As informações aqui apresentadas são baseadas no edital do leilão. Sempre consulte o edital completo e busque assessoria jurídica antes de participar de qualquer leilão.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Leiloeiro</span>
                    <p className="font-semibold">{property.auctionDetails?.auctionHouse}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Site do Leiloeiro</span>
                    <p className="font-semibold">{property.auctionDetails?.auctionSite}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Processo</span>
                    <p className="font-semibold">{property.auctionDetails?.auctionProcess}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Vara/Tribunal</span>
                    <p className="font-semibold">{property.auctionDetails?.auctionCourt}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Datas e Valores</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        <Gavel className="h-5 w-5 mr-2 text-auction-primary" />
                        <h4 className="font-semibold">1º Leilão - {formatDate(property.auctionDetails?.firstDate)}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        No 1º leilão, o valor mínimo para lance é o valor de avaliação do imóvel.
                      </p>
                      <div className="flex justify-between">
                        <span>Lance mínimo:</span>
                        <span className="font-bold">{formatCurrency(property.auctionDetails?.minimumBid1 || 0)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        <Gavel className="h-5 w-5 mr-2 text-auction-primary" />
                        <h4 className="font-semibold">2º Leilão - {formatDate(property.auctionDetails?.secondDate)}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        No 2º leilão, caso o 1º não tenha lances, o valor mínimo costuma ser menor.
                      </p>
                      <div className="flex justify-between">
                        <span>Lance mínimo:</span>
                        <span className="font-bold">{formatCurrency(property.auctionDetails?.minimumBid2 || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-auction-primary hover:bg-auction-secondary">
                  Quero participar deste leilão
                </Button>
              </TabsContent>
              {/* Localização */}
              <TabsContent value="location" className="p-6">
                <h3 className="text-xl font-semibold mb-3">Localização do Imóvel</h3>
                <p className="text-gray-600 mb-4">
                  {property.address}, {property.city} - {property.state}
                </p>
                {isLoadingMapsKey ? (
                  <div className="bg-white rounded-lg h-[400px] mb-4 flex items-center justify-center">Carregando mapa...</div>
                ) : mapsKeyError ? (
                  <div className="bg-white rounded-lg h-[400px] mb-4 flex items-center justify-center text-red-600">{mapsKeyError}</div>
                ) : (
                  <div className="bg-white rounded-lg h-[400px] mb-4 overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(
                        `${property.address}, ${property.city}, ${property.state}`
                      )}`}
                    ></iframe>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <h4 className="font-semibold mb-2">Sobre a região</h4>
                  <p className="text-sm text-gray-600">
                    Verifique a segurança do bairro, proximidade de transporte público, escolas, comércio e outros serviços 
                    essenciais antes de tomar sua decisão de investimento.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <RiskAnalyzer />
            <ProfitSimulator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
