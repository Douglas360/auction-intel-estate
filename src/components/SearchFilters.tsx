import React, { useState, useEffect } from 'react';
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
import { usePropertyTypeStats } from '@/hooks/usePropertyTypeStats';

export const defaultFilters = {
  location: '',
  state: '',
  propertyType: '',
  minPrice: 0,
  maxPrice: 2000000,
  auctionType: '',
  discount: 0,
  riskLevel: '',
  bedrooms: '',
  garage: '',
  allow_financing: false,
  allow_consorcio: false,
  allow_fgts: false,
  allow_parcelamento: false,
};

const SearchFilters = ({ filters, setFilters, onSearch }: { filters: any, setFilters: (filters: any) => void, onSearch: (filters: any) => void }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const { stats } = usePropertyTypeStats();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (name: string, value: any) => {
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(localFilters);
    onSearch(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
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

  const getPropertyTypeCount = (type: string) => {
    const stat = stats.find(s => s.type === type);
    return stat ? stat.count : 0;
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
                value={localFilters.state}
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
                value={localFilters.location}
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
              value={localFilters.propertyType}
              onValueChange={(value) => handleChange('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {propertyTypes.map((type) => {
                  const count = getPropertyTypeCount(type);
                  return (
                    <SelectItem key={type} value={type} className="w-full relative">
                      <span>{type}</span>
                      <span className="absolute right-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-semibold min-w-[24px] text-center">
                        {count}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Accordion type="single" collapsible className="w-full border-none" defaultValue="advanced-filters">
            <AccordionItem value="advanced-filters" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium text-auction-primary hover:no-underline hover:text-auction-secondary">
                Filtros avançados
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faixa de Preço: {formatCurrency(localFilters.minPrice)} - {formatCurrency(localFilters.maxPrice)}
                  </label>
                  <div className="flex space-x-4 mt-6">
                    <Slider
                      defaultValue={[localFilters.minPrice, localFilters.maxPrice]}
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
                    value={localFilters.auctionType}
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
                    Desconto Mínimo: {localFilters.discount}%
                  </label>
                  <Slider
                    defaultValue={[localFilters.discount]}
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
                    value={localFilters.riskLevel}
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

                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Quartos
                  </label>
                  <Select
                    value={localFilters.bedrooms || 'any'}
                    onValueChange={value => handleChange('bedrooms', value === 'any' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="garage" className="block text-sm font-medium text-gray-700 mb-1">
                    Garagem
                  </label>
                  <Select
                    value={localFilters.garage || 'any'}
                    onValueChange={value => handleChange('garage', value === 'any' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={localFilters.allow_financing} onChange={e => handleChange('allow_financing', e.target.checked)} />
                    Aceita financiamento
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={localFilters.allow_consorcio} onChange={e => handleChange('allow_consorcio', e.target.checked)} />
                    Aceita consórcio
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={localFilters.allow_fgts} onChange={e => handleChange('allow_fgts', e.target.checked)} />
                    Aceita FGTS
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={localFilters.allow_parcelamento} onChange={e => handleChange('allow_parcelamento', e.target.checked)} />
                    Aceita parcelamento
                  </label>
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
