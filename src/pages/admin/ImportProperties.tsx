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

  const importProperties = async () => {
    try {
      setIsUploading(true);
      setImportStats(null);
      setImportErrors([]);
      setProgress(0);

      // Parse JSON data
      const properties: ImportedProperty[] = JSON.parse(jsonData);
      
      if (!Array.isArray(properties)) {
        throw new Error("O JSON fornecido não é um array");
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: ImportError[] = [];

      // Process properties one by one
      for (let i = 0; i < properties.length; i++) {
        try {
          const property = properties[i];
          
          // Update progress
          const currentProgress = Math.round(((i + 1) / properties.length) * 100);
          setProgress(currentProgress);

          // Check if property already exists
          const existingPropertyId = await checkIfPropertyExists(property.title);
          
          if (existingPropertyId === null) {
            // An error occurred while checking
            throw new Error("Erro ao verificar se o imóvel já existe");
          }

          const auction_price = parsePrice(property.auction_price);
          const market_price = parsePrice(property.market_price);
          const discount = parseInt(property.discount, 10);
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
          // Insert new property or update existing one
          if (existingPropertyId) {
            // Update existing property
            result = await supabase
              .from('properties')
              .update(propertyData)
              .eq('id', existingPropertyId);
              
            if (result.error) {
              throw new Error(`Erro ao atualizar imóvel: ${result.error.message}`);
            } else {
              console.log(`Imóvel atualizado com sucesso: ${property.title}`);
            }
          } else {
            // Insert new property
            result = await supabase
              .from('properties')
              .insert(propertyData);
              
            if (result.error) {
              throw new Error(`Erro ao inserir imóvel: ${result.error.message}`);
            } else {
              console.log(`Imóvel inserido com sucesso: ${property.title}`);
            }
          }

          successCount++;
        } catch (propertyError: any) {
          console.error("Erro ao processar propriedade:", propertyError);
          failedCount++;
          errors.push({
            property: properties[i],
            error: propertyError.message || "Erro desconhecido",
            index: i
          });
        }

        // Short delay to prevent overwhelming the database
        await new Promise(r => setTimeout(r, 100));
      }

      setImportStats({
        total: properties.length,
        success: successCount,
        failed: failedCount
      });

      setImportErrors(errors);

      if (successCount > 0) {
        toast.success(`${successCount} imóveis importados com sucesso`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} imóveis falharam na importação`);
      }

    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao processar o JSON. Verifique o formato e tente novamente.");
      setImportStats(null);
    } finally {
      setIsUploading(false);
      // Keep progress at 100% if completed or 0 if failed with no items processed
      if (progress > 0) {
        setProgress(100);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Importar Imóveis</CardTitle>
          <CardDescription>
            Importe imóveis em leilão através de um arquivo JSON ou cole o JSON diretamente
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
                  placeholder="Cole o JSON dos imóveis aqui..."
                  className="min-h-[200px] font-mono text-sm"
                  value={jsonData}
                  onChange={(e) => {
                    setJsonData(e.target.value);
                    // Reset previous errors and stats when the JSON is modified
                    setImportErrors([]);
                    setImportStats(null);
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="json-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                    <p className="text-xs text-gray-500">Arquivos JSON</p>
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
                <span className="text-sm font-medium">Processando importação</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
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
              <h3 className="font-medium mb-2">Erros de Importação:</h3>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4 space-y-4">
                  {importErrors.map((error, idx) => (
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
