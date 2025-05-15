
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, ClipboardCopyIcon, LoaderIcon } from 'lucide-react';

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

const ImportProperties = () => {
  const [jsonData, setJsonData] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importStats, setImportStats] = useState<{ total: number; success: number; failed: number } | null>(null);
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
      } catch (error) {
        toast.error("Erro ao processar o arquivo JSON. Verifique o formato");
        console.error("JSON parse error:", error);
      }
    };
    reader.readAsText(file);
  };

  const importProperties = async () => {
    try {
      setIsUploading(true);
      setImportStats(null);

      // Parse JSON data
      const properties: ImportedProperty[] = JSON.parse(jsonData);
      
      if (!Array.isArray(properties)) {
        throw new Error("O JSON fornecido não é um array");
      }

      let successCount = 0;
      let failedCount = 0;

      // Process properties one by one
      for (const property of properties) {
        try {
          const auction_price = parsePrice(property.auction_price);
          const market_price = parsePrice(property.market_price);
          const discount = parseInt(property.discount, 10);
          const formattedDate = parseDate(property.auction_date);

          // Prepare data for insertion
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
            state: property.state,
            city: property.city,
            auctioneer_site: property.url
          };

          // Insert property
          const { error } = await supabase
            .from('properties')
            .insert(propertyData);

          if (error) {
            console.error("Erro ao inserir propriedade:", error);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (propertyError) {
          console.error("Erro ao processar propriedade:", propertyError);
          failedCount++;
        }
      }

      setImportStats({
        total: properties.length,
        success: successCount,
        failed: failedCount
      });

      if (successCount > 0) {
        toast.success(`${successCount} imóveis importados com sucesso`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} imóveis falharam na importação`);
      }

    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao processar o JSON. Verifique o formato e tente novamente.");
    } finally {
      setIsUploading(false);
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
                  onChange={(e) => setJsonData(e.target.value)}
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
