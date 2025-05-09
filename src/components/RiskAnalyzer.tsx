
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';

const RiskAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    risk: 'low' | 'medium' | 'high' | null;
    summary: string;
    details: { issue: string; severity: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // In a real app, we would upload and process the file here
    // Simulating API call with timeout
    setLoading(true);
    
    // This is just a simulation for the MVP demo
    setTimeout(() => {
      // Mock result - in real app this would come from OpenAI API
      setResult({
        risk: 'medium',
        summary: 'O imóvel apresenta alguns riscos jurídicos que merecem atenção, mas nada que impeça a compra definitivamente.',
        details: [
          { 
            issue: 'Existem penhoras registradas em outros processos, mas que não afetam o leilão atual.', 
            severity: 'medium' 
          },
          { 
            issue: 'Há uma hipoteca bancária que será cancelada com a arrematação.', 
            severity: 'low' 
          },
          {
            issue: 'Existem débitos de condomínio em aberto que somam R$ 12.450,00.', 
            severity: 'high'
          }
        ]
      });
      setLoading(false);
    }, 2000);
  };

  const getRiskBadgeClass = (risk: string | null) => {
    if (!risk) return '';
    
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const getItemSeverityClass = (severity: string) => {
    switch(severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Risco Jurídico</CardTitle>
        <CardDescription>
          Faça upload da matrícula do imóvel para receber uma análise automática dos riscos jurídicos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
                Upload da Matrícula (PDF)
              </label>
              <Input
                id="matricula"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!file || loading} 
              className="w-full bg-auction-primary hover:bg-auction-secondary"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : 'Analisar Riscos'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Nível de risco:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeClass(result.risk)}`}>
                {result.risk === 'low' ? 'Baixo' : result.risk === 'medium' ? 'Médio' : 'Alto'}
              </span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Resumo:</h4>
              <p className="text-gray-700">{result.summary}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Pontos de atenção:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {result.details.map((item, index) => (
                  <li key={index} className={getItemSeverityClass(item.severity)}>
                    {item.issue}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Nova Análise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAnalyzer;
