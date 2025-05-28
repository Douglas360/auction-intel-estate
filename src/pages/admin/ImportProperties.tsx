import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, ClipboardCopyIcon, LoaderIcon, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportedProperty {
  title: string;
  address: string;
  auction_price: string;
  market_price: string;
  discount: string;
  auction_date: string;
  image: string;
  type: string;
  auction_type: string;
  auctioneer: string;
  description: string;
  matricula_pdf_url?: string;
  edital_pdf_url?: string;
  state: string;
  city: string;
  url?: string;
}

interface NewFormatProperty {
  _id: number;
  aceitaConsorcio: boolean;
  aceitaFGTS: boolean;
  aceitaFinanciamento: boolean;
  aceitaParcelamento: boolean;
  autor?: string;
  bairro: string;
  bairroId: number;
  bairroNome: string;
  caracteristicas: string[];
  cep: string;
  cidade: string;
  cidadeId: number;
  cidadeNome: string;
  dataCadastro: { $date: string };
  dataFim: { $date: string };
  descricao: string;
  detalheLocalizacao: {
    id: number;
    rua: string;
    cep: string;
  };
  estado: string;
  estadoId: number;
  garagem?: number;
  imagensImoveis: Array<{
    caminhoImagem?: string;
    caminhoImagemSmall: string;
    caminhoImagemLarge: string;
  }>;
  imovelPracas: Array<{
    imovelId: number;
    valor: number;
    dataFim: { $date: string };
  }>;
  imovelTipoBems: number[];
  imovelTipoBemsDescricoes: string[];
  informacaoJudicial: string;
  interacaoCount: number;
  localizacao: string;
  metroQuadrado?: number;
  processo: string;
  quartos?: number;
  siteLeilaoId: number;
  situacaoId: number;
  tipoBemDescricao: string;
  tipoBemId: number;
  tipoLeilaoCaixaId?: number;
  tipoLeilaoId: number;
  tipoLeilaoNome: string;
  urlLeilaoExterno: string;
  valor: number;
  valorAvaliacao: number;
  valorDesconto: number;
}

interface ImportError {
  property: Partial<ImportedProperty>;
  error: string;
  index: number;
}

const ImportProperties = () => {
  const [jsonData, setJsonData] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importStats, setImportStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [batchSize, setBatchSize] = useState<number>(100); // Batch size for large imports
  const navigate = useNavigate();

  const parsePrice = (priceString: string): number => {
    // Remove "R$ " and replace comma with period
    return parseFloat(priceString.replace('R$ ', '').replace('.', '').replace(',', '.'));
  };

  const parseDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const formatCurrencyValue = (value: number): string => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const convertNewFormatToStandard = (newProperty: NewFormatProperty): ImportedProperty => {
    // Safely handle date conversion with null checks
    let auctionDate = '';
    if (newProperty.dataFim && newProperty.dataFim.$date) {
      try {
        auctionDate = new Date(newProperty.dataFim.$date).toLocaleDateString('pt-BR');
      } catch (error) {
        console.warn('Invalid date format in dataFim:', newProperty.dataFim);
        auctionDate = '';
      }
    }
    
    const firstImage = newProperty.imagensImoveis && newProperty.imagensImoveis.length > 0 
      ? newProperty.imagensImoveis[0].caminhoImagemLarge || newProperty.imagensImoveis[0].caminhoImagemSmall || ''
      : '';
    
    return {
      title: newProperty.descricao || 'Título não informado',
      address: newProperty.detalheLocalizacao?.rua || newProperty.localizacao || 'Endereço não informado',
      auction_price: formatCurrencyValue(newProperty.valor || 0),
      market_price: formatCurrencyValue(newProperty.valorAvaliacao || 0),
      discount: (newProperty.valorDesconto || 0).toString(),
      auction_date: auctionDate,
      image: firstImage,
      type: newProperty.tipoBemDescricao || 'Tipo não informado',
      auction_type: newProperty.tipoLeilaoNome || 'Leilão',
      auctioneer: 'Leiloeiro não informado',
      description: newProperty.informacaoJudicial || newProperty.descricao || '',
      state: newProperty.estado || '',
      city: newProperty.cidade || '',
      url: newProperty.urlLeilaoExterno || ''
    };
  };

  const detectJsonFormat = (data: any): 'standard' | 'new' | 'unknown' => {
    if (Array.isArray(data)) {
      if (data.length === 0) return 'unknown';
      
      const firstItem = data[0];
      
      // Check if it's the new format
      if (firstItem._id !== undefined && firstItem.tipoBemDescricao !== undefined && firstItem.valorAvaliacao !== undefined) {
        return 'new';
      }
      
      // Check if it's the standard format
      if (firstItem.title !== undefined && firstItem.auction_price !== undefined) {
        return 'standard';
      }
    } else {
      // Single object
      if (data._id !== undefined && data.tipoBemDescricao !== undefined && data.valorAvaliacao !== undefined) {
        return 'new';
      }
      
      if (data.title !== undefined && data.auction_price !== undefined) {
        return 'standard';
      }
    }
    
    return 'unknown';
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Test if the content is valid JSON
        JSON.parse(content);
        setJsonData(content);
        toast.success("Arquivo JSON carregado com sucesso");
        // Reset previous errors and stats when a new file is loaded
        setImportErrors([]);
        setImportStats(null);
      } catch (error) {
        toast.error("Erro ao processar o arquivo JSON. Verifique o formato");
        console.error("JSON parse error:", error);
      }
    };
    reader.readAsText(file);
  };

  const checkIfPropertyExists = async (title: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .eq('title', title)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Error checking if property exists:", error);
      return null; // Return null to indicate an error occurred
    }

    return data ? data.id : false; // Return the ID if found, false if not found
  };

  const processBatch = async (
    properties: ImportedProperty[], 
    startIndex: number, 
    batchSize: number,
    totalProperties: number
  ): Promise<{ success: number; failed: number; errors: ImportError[] }> => {
    const endIndex = Math.min(startIndex + batchSize, properties.length);
    const batch = properties.slice(startIndex, endIndex);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: ImportError[] = [];

    console.log(`Processando lote ${startIndex + 1}-${endIndex} de ${totalProperties} imóveis...`);

    for (let i = 0; i < batch.length; i++) {
      try {
        const property = batch[i];
        const globalIndex = startIndex + i;
        
        // Update progress for this batch
        const currentProgress = Math.round(((globalIndex + 1) / totalProperties) * 100);
        setProgress(currentProgress);

        // Check if property already exists
        const existingPropertyId = await checkIfPropertyExists(property.title);
        
        if (existingPropertyId === null) {
          throw new Error("Erro ao verificar se o imóvel já existe");
        }

        const auction_price = typeof property.auction_price === 'string' ? parsePrice(property.auction_price) : property.auction_price;
        const market_price = typeof property.market_price === 'string' ? parsePrice(property.market_price) : property.market_price;
        const discount = typeof property.discount === 'string' ? parseInt(property.discount, 10) : property.discount;
        const formattedDate = parseDate(property.auction_date);

        // Prepare data for insertion or update
        const propertyData = {
          title: property.title,
          address: property.address,
          auction_price,
          market_price,
          discount,
          auction_date: formattedDate,
          images: property.image ? [property.image] : [],
          type: property.type,
          auction_type: property.auction_type,
          auctioneer: property.auctioneer,
          description: property.description,
          matricula_pdf_url: property.matricula_pdf_url,
          edital_pdf_url: property.edital_pdf_url,
          state: property.state,
          city: property.city,
          auctioneer_site: property.url
        };

        let result;
        if (existingPropertyId) {
          result = await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', existingPropertyId);
        } else {
          result = await supabase
            .from('properties')
            .insert(propertyData);
        }
        
        if (result.error) {
          throw new Error(`Erro ao processar imóvel: ${result.error.message}`);
        }

        successCount++;
      } catch (propertyError: any) {
        console.error("Erro ao processar propriedade:", propertyError);
        failedCount++;
        errors.push({
          property: batch[i],
          error: propertyError.message || "Erro desconhecido",
          index: startIndex + i
        });
      }
    }

    return { success: successCount, failed: failedCount, errors };
  };

  const importProperties = async () => {
    try {
      setIsUploading(true);
      setImportStats(null);
      setImportErrors([]);
      setProgress(0);

      console.log('Iniciando importação...');

      // Parse JSON data
      const rawData = JSON.parse(jsonData);
      
      // Detect the format
      const format = detectJsonFormat(rawData);
      
      if (format === 'unknown') {
        throw new Error("Formato de JSON não reconhecido. Verifique se está usando um dos formatos suportados.");
      }

      console.log(`Formato detectado: ${format}`);

      let properties: ImportedProperty[] = [];

      if (format === 'new') {
        // Handle new format with better error handling
        const newFormatData: NewFormatProperty[] = Array.isArray(rawData) ? rawData : [rawData];
        console.log(`Convertendo ${newFormatData.length} imóveis do novo formato...`);
        
        properties = newFormatData.map((item, index) => {
          try {
            return convertNewFormatToStandard(item);
          } catch (error) {
            console.error(`Erro ao converter item ${index}:`, error, item);
            throw new Error(`Erro na conversão do item ${index}: ${error.message}`);
          }
        });
      } else {
        // Handle standard format
        properties = Array.isArray(rawData) ? rawData : [rawData];
      }

      if (!Array.isArray(properties)) {
        throw new Error("O JSON fornecido não contém um array válido de propriedades");
      }

      console.log(`Total de ${properties.length} imóveis para processar`);

      // Adjust batch size based on total number of properties
      let dynamicBatchSize = batchSize;
      if (properties.length > 10000) {
        dynamicBatchSize = 50; // Smaller batches for very large imports
      } else if (properties.length > 1000) {
        dynamicBatchSize = 100;
      }

      let totalSuccess = 0;
      let totalFailed = 0;
      const allErrors: ImportError[] = [];

      // Process properties in batches
      for (let i = 0; i < properties.length; i += dynamicBatchSize) {
        try {
          console.log(`Processando lote ${Math.floor(i / dynamicBatchSize) + 1} de ${Math.ceil(properties.length / dynamicBatchSize)}`);
          
          const batchResult = await processBatch(properties, i, dynamicBatchSize, properties.length);
          
          totalSuccess += batchResult.success;
          totalFailed += batchResult.failed;
          allErrors.push(...batchResult.errors);

          // Short delay between batches to prevent overwhelming the database
          if (i + dynamicBatchSize < properties.length) {
            await new Promise(r => setTimeout(r, 100));
          }

          // Update stats periodically for better UX
          setImportStats({
            total: properties.length,
            success: totalSuccess,
            failed: totalFailed
          });

        } catch (batchError: any) {
          console.error(`Erro no lote iniciado em ${i}:`, batchError);
          // Continue with next batch instead of stopping everything
          totalFailed += Math.min(dynamicBatchSize, properties.length - i);
        }
      }

      setImportStats({
        total: properties.length,
        success: totalSuccess,
        failed: totalFailed
      });

      setImportErrors(allErrors);

      if (totalSuccess > 0) {
        toast.success(`${totalSuccess} imóveis importados com sucesso`);
      }
      
      if (totalFailed > 0) {
        toast.error(`${totalFailed} imóveis falharam na importação`);
      }

      console.log(`Importação concluída: ${totalSuccess} sucessos, ${totalFailed} falhas`);

    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao processar o JSON. Verifique o formato e tente novamente.");
      setImportStats(null);
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Importar Imóveis</CardTitle>
          <CardDescription>
            Importe imóveis em leilão através de um arquivo JSON ou cole o JSON diretamente. 
            O sistema suporta tanto o formato padrão quanto o novo formato de importação.
            Otimizado para importações grandes (50.000+ imóveis).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="paste">Colar JSON</TabsTrigger>
              <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paste">
              <div className="space-y-4">
                <Textarea 
                  placeholder="Cole o JSON dos imóveis aqui... (suporta ambos os formatos)"
                  className="min-h-[200px] font-mono text-sm"
                  value={jsonData}
                  onChange={(e) => {
                    setJsonData(e.target.value);
                    setImportErrors([]);
                    setImportStats(null);
                  }}
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="batch-size" className="text-sm font-medium">
                    Tamanho do lote (para arquivos grandes):
                  </label>
                  <input
                    id="batch-size"
                    type="number"
                    min="10"
                    max="500"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 100)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-xs text-gray-500">
                    (Recomendado: 50-100 para arquivos grandes)
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="json-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                    <p className="text-xs text-gray-500">Arquivos JSON (ambos os formatos suportados)</p>
                    <p className="text-xs text-gray-400 mt-1">Suporta arquivos grandes (50.000+ imóveis)</p>
                  </div>
                  <input 
                    id="json-file" 
                    type="file" 
                    accept=".json"
                    className="hidden" 
                    onChange={handleJsonUpload}
                  />
                </label>
              </div>
            </TabsContent>
          </Tabs>

          {isUploading && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Processando importação em lotes</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {importStats && (
                <div className="mt-2 text-xs text-gray-600">
                  Processados: {importStats.success + importStats.failed} de {importStats.total}
                </div>
              )}
            </div>
          )}

          {importStats && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Resultado da Importação:</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold">{importStats.total}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-600">Sucesso</p>
                  <p className="text-xl font-bold text-green-600">{importStats.success}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-md">
                  <p className="text-sm text-gray-600">Falhas</p>
                  <p className="text-xl font-bold text-red-600">{importStats.failed}</p>
                </div>
              </div>
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Erros de Importação ({importErrors.length} erros):</h3>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4 space-y-4">
                  {importErrors.slice(0, 20).map((error, idx) => (
                    <Alert key={idx} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Erro no registro #{error.index + 1}: {error.property.title}</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 text-sm">
                          <span className="font-bold">Mensagem de erro:</span> {error.error}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  {importErrors.length > 20 && (
                    <div className="text-sm text-gray-500 text-center">
                      ... e mais {importErrors.length - 20} erros
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
            >
              Cancelar
            </Button>
            <Button 
              onClick={importProperties}
              disabled={!jsonData.trim() || isUploading}
            >
              {isUploading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <ClipboardCopyIcon className="mr-2 h-4 w-4" />
                  Importar Imóveis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportProperties;
