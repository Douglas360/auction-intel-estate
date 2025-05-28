import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SearchFilters = ({ onSearch }: { onSearch: (filters: any) => void }) => {
  const defaultFilters = {
    location: '',
    propertyType: '',
    minPrice: 0,
    maxPrice: 2000000,
    auctionType: '',
    discount: 0,
    riskLevel: ''
  };
  const [filters, setFilters] = useState(defaultFilters);
  
  const handleChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const propertyTypes = ['Apartamento', 'Casa', 'Terreno', 'Comercial', 'Rural'];
  const auctionTypes = ['Judicial', 'Extrajudicial', 'Banco', 'Outros'];
  const riskLevels = ['Baixo', 'Médio', 'Alto'];
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Filtros de Busca</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Localização
            </label>
            <div className="flex space-x-2">
              <Select
                onValueChange={(value) => handleChange('state', value)}
              >
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="location"
                placeholder="Cidade ou bairro"
                value={filters.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-2/3"
              />
            </div>
          </div>

          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Imóvel
            </label>
            <Select
              onValueChange={(value) => handleChange('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Accordion type="single" collapsible className="w-full border-none">
            <AccordionItem value="advanced-filters" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium text-auction-primary hover:no-underline hover:text-auction-secondary">
                Filtros avançados
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faixa de Preço: {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
                  </label>
                  <div className="flex space-x-4 mt-6">
                    <Slider
                      defaultValue={[filters.minPrice, filters.maxPrice]}
                      max={5000000}
                      step={10000}
                      onValueChange={(value) => {
                        handleChange('minPrice', value[0]);
                        handleChange('maxPrice', value[1]);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auctionType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Leilão
                  </label>
                  <Select
                    onValueChange={(value) => handleChange('auctionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de leilão" />
                    </SelectTrigger>
                    <SelectContent>
                      {auctionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto Mínimo: {filters.discount}%
                  </label>
                  <Slider
                    defaultValue={[filters.discount]}
                    min={0}
                    max={80}
                    step={5}
                    onValueChange={(value) => handleChange('discount', value[0])}
                  />
                </div>

                <div>
                  <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Risco Jurídico
                  </label>
                  <Select
                    onValueChange={(value) => handleChange('riskLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de risco" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((level) => (
                        <SelectItem key={level} value={level.toLowerCase()}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Buscar Imóveis</Button>
          <Button type="button" variant="outline" className="w-full mt-2" onClick={handleReset}>
            Resetar filtros
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
