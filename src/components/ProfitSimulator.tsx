
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

const ProfitSimulator = () => {
  const [formData, setFormData] = useState({
    auctionValue: 300000,
    marketValue: 450000,
    evictionCost: 0,
    debts: 0,
    itbi: 0, // Will be calculated
    commission: 0, // Will be calculated
    renovation: 0,
    sellTime: 6
  });
  
  const [results, setResults] = useState({
    grossProfit: 0,
    netProfit: 0,
    roi: 0,
    totalCosts: 0
  });

  useEffect(() => {
    // Calculate ITBI (property transfer tax) - typically 3% in Brazil
    const itbi = formData.auctionValue * 0.03;
    
    // Calculate commission - typically 5% of market value
    const commission = formData.marketValue * 0.05;
    
    // Update form with calculated values
    setFormData(prev => ({
      ...prev,
      itbi,
      commission
    }));
  }, [formData.auctionValue, formData.marketValue]);

  useEffect(() => {
    calculate();
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: Number(value)
    });
  };

  const calculate = () => {
    // Total costs
    const totalCosts = 
      formData.evictionCost + 
      formData.debts + 
      formData.itbi + 
      formData.commission + 
      formData.renovation;
      
    // Gross profit
    const grossProfit = formData.marketValue - formData.auctionValue;
    
    // Net profit
    const netProfit = grossProfit - totalCosts;
    
    // ROI (Return on Investment)
    const roi = (netProfit / formData.auctionValue) * 100;
    
    setResults({
      grossProfit,
      netProfit,
      roi,
      totalCosts
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 30) return 'text-green-600';
    if (roi >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador de Rentabilidade</CardTitle>
        <CardDescription>
          Calcule o potencial de lucro em uma operação de compra em leilão e revenda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Valor no Leilão</label>
              <span className="text-sm text-gray-500">{formatCurrency(formData.auctionValue)}</span>
            </div>
            <Slider
              value={[formData.auctionValue]}
              min={10000}
              max={2000000}
              step={10000}
              onValueChange={(value) => handleChange('auctionValue', value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Valor de Mercado</label>
              <span className="text-sm text-gray-500">{formatCurrency(formData.marketValue)}</span>
            </div>
            <Slider
              value={[formData.marketValue]}
              min={10000}
              max={3000000}
              step={10000}
              onValueChange={(value) => handleChange('marketValue', value[0])}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Custo de Desocupação</label>
              <Input
                type="number"
                value={formData.evictionCost}
                onChange={(e) => handleChange('evictionCost', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dívidas (IPTU, etc)</label>
              <Input
                type="number"
                value={formData.debts}
                onChange={(e) => handleChange('debts', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ITBI (3%)</label>
              <Input
                type="number"
                value={formData.itbi}
                disabled
                className="w-full bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Comissão (5%)</label>
              <Input
                type="number"
                value={formData.commission}
                disabled
                className="w-full bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Custo de Reforma</label>
              <Input
                type="number"
                value={formData.renovation}
                onChange={(e) => handleChange('renovation', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tempo para Venda</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[formData.sellTime]}
                  min={1}
                  max={24}
                  step={1}
                  onValueChange={(value) => handleChange('sellTime', value[0])}
                />
                <span className="text-sm min-w-[60px] text-right">{formData.sellTime} meses</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-gray-50 mt-6 border">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Lucro Bruto</span>
                  <span className="text-sm font-medium">{formatCurrency(results.grossProfit)}</span>
                </div>
                <Progress value={(results.grossProfit / formData.marketValue) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Total de Custos</span>
                  <span className="text-sm font-medium">{formatCurrency(results.totalCosts)}</span>
                </div>
                <Progress value={(results.totalCosts / formData.marketValue) * 100} className="h-2" />
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-bold">Lucro Líquido</span>
                  <span className="font-bold">{formatCurrency(results.netProfit)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-medium">ROI (Retorno sobre Investimento)</span>
                  <span className={`font-bold ${getRoiColor(results.roi)}`}>
                    {results.roi.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ProfitSimulator;
