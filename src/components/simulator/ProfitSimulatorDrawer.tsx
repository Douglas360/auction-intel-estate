import React, { useState, useEffect, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NumericFormat } from 'react-number-format';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#e11d48', '#a3a3a3'];

const inputTips = {
  auctionValue: 'Valor que você pretende arrematar o imóvel no leilão.',
  resaleValue: 'Valor que espera vender o imóvel após a compra e reforma.',
  renovation: 'Valor estimado para reforma ou melhorias no imóvel.',
  itbi: 'Imposto de Transmissão de Bens Imóveis (média de 3% do valor de compra).',
  commission: 'Comissão do leiloeiro (média de 5% do valor de compra).',
  cartorio: 'Custos de cartório para registro do imóvel.',
  sellTime: 'Tempo estimado (em meses) para vender o imóvel após a compra.',
};

export function ProfitSimulatorDrawer({ open, onClose, property }) {
  const [formData, setFormData] = useState({
    auctionValue: property?.auctionPrice || 0,
    marketValue: property?.marketPrice || 0,
    renovation: 0,
    itbiPercent: 3,
    commissionPercent: 5,
    cartorio: 2000,
    sellTime: 6,
    resaleValue: property?.marketPrice || 0,
  });
  const [results, setResults] = useState({
    grossProfit: 0,
    netProfit: 0,
    roi: 0,
    totalCosts: 0,
  });
  const pdfRef = useRef(null);

  useEffect(() => {
    calculate();
    // eslint-disable-next-line
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: Number(value) });
  };

  const itbiValue = formData.auctionValue * (formData.itbiPercent / 100);
  const commissionValue = formData.auctionValue * (formData.commissionPercent / 100);

  const calculate = () => {
    const totalCosts =
      formData.renovation +
      itbiValue +
      commissionValue +
      formData.cartorio;
    const grossProfit = formData.resaleValue - formData.auctionValue;
    const netProfit = grossProfit - totalCosts;
    const roi = ((netProfit) / (formData.auctionValue + totalCosts)) * 100;
    setResults({ grossProfit, netProfit, roi, totalCosts });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const data = [
    { name: 'Lance', value: formData.auctionValue },
    { name: 'Reforma', value: formData.renovation },
    { name: 'ITBI', value: itbiValue },
    { name: 'Comissão', value: commissionValue },
    { name: 'Cartório', value: formData.cartorio },
    { name: 'Lucro Líquido', value: results.netProfit > 0 ? results.netProfit : 0 },
  ];

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Logo
    try {
      const logoImg = await toDataURL('/assets/logo.png');
      doc.addImage(logoImg, 'PNG', 10, y, 40, 16);
    } catch {}

    // Título
    doc.setFontSize(18);
    doc.setTextColor('#2563eb');
    doc.text('Relatório de Simulação de Lucro', pageWidth / 2, y + 10, { align: 'center' });
    y += 25;

    // Dados do imóvel
    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text(`Imóvel: ${property?.title || ''}`, 10, y);
    y += 7;
    doc.setFontSize(10);
    // Endereço com quebra de linha automática
    const endereco = `Endereço: ${property?.address || ''}, ${property?.city || ''} - ${property?.state || ''}`;
    const enderecoLines = doc.splitTextToSize(endereco, pageWidth - 20);
    doc.text(enderecoLines, 10, y);
    y += enderecoLines.length * 5;
    doc.text(`Leilão em: ${property?.auctionDate ? new Date(property.auctionDate).toLocaleDateString('pt-BR') : '-'}`, 10, y);
    y += 10;

    // Foto do imóvel
    if (property?.imageUrl) {
      try {
        const img = await toDataURL(property.imageUrl);
        doc.addImage(img, 'JPEG', 10, y, 50, 30);
      } catch {}
    }
    y += 35;

    // Parâmetros da simulação
    doc.setFontSize(12);
    doc.setTextColor('#2563eb');
    doc.text('Parâmetros da Simulação', 10, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor('#222');
    doc.text(`Lance Final: ${formatCurrency(formData.auctionValue)}`, 10, y);
    doc.text(`Valor de Revenda: ${formatCurrency(formData.resaleValue)}`, 80, y);
    y += 6;
    doc.text(`Valor de Reforma: ${formatCurrency(formData.renovation)}`, 10, y);
    doc.text(`ITBI: ${formData.itbiPercent}% (${formatCurrency(itbiValue)})`, 80, y);
    y += 6;
    doc.text(`Comissão: ${formData.commissionPercent}% (${formatCurrency(commissionValue)})`, 10, y);
    doc.text(`Cartório: ${formatCurrency(formData.cartorio)}`, 80, y);
    y += 6;
    doc.text(`Prazo para Venda: ${formData.sellTime} meses`, 10, y);
    y += 10;

    // Resultados
    doc.setFontSize(12);
    doc.setTextColor('#2563eb');
    doc.text('Resultados', 10, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor('#222');
    doc.text(`Lucro Líquido: ${formatCurrency(results.netProfit)}`, 10, y);
    doc.text(`Rentabilidade: ${results.roi.toFixed(2)}%`, 80, y);
    y += 6;
    doc.text(`Total de Custos: ${formatCurrency(results.totalCosts)}`, 10, y);
    doc.text(`Lucro Bruto: ${formatCurrency(results.grossProfit)}`, 80, y);
    y += 10;

    // Gráfico de pizza (renderizar como imagem)
    const chartNode = document.querySelector('.simulator-piechart');
    if (chartNode) {
      const chartCanvas = await html2canvas(chartNode as HTMLElement);
      const chartImg = chartCanvas.toDataURL('image/png');
      doc.addImage(chartImg, 'PNG', 10, y, 90, 60);
    }
    y += 65;

    // Rodapé elegante
    doc.setDrawColor('#2563eb');
    doc.setLineWidth(0.5);
    doc.line(10, 287, pageWidth - 10, 287);
    doc.setFontSize(8);
    doc.setTextColor('#888');
    const marca = 'hau.imóveis | Relatório gerado automaticamente';
    const dataHora = new Date().toLocaleString('pt-BR');
    doc.text(marca, 10, 292, { align: 'left' });
    doc.text(dataHora, pageWidth - 10, 292, { align: 'right' });
    doc.setFont('helvetica', 'italic');
    doc.setTextColor('#2563eb');
    const frase = '“Grandes oportunidades não surgem por acaso. Elas são simuladas, analisadas e conquistadas.”';
    const fraseLines = doc.splitTextToSize(frase, pageWidth - 40);
    let fraseY = 296;
    fraseLines.forEach((line, idx) => {
      doc.text(line, pageWidth / 2, fraseY + idx * 4, { align: 'center' });
    });
    doc.setFont('helvetica', 'normal');

    doc.save('relatorio-simulacao.pdf');
  };

  // Função utilitária para converter imagem em base64
  async function toDataURL(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="!p-0">
        <DrawerHeader className="sticky top-0 z-20 bg-white flex flex-row justify-between items-center px-4 py-2 border-b">
          <DrawerTitle>Simulador de Lucro</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" className="ml-auto">Fechar</Button>
          </DrawerClose>
        </DrawerHeader>
        <div ref={pdfRef} className="p-2 md:p-4 flex flex-col gap-8 w-full max-h-[80vh] overflow-y-auto">
          {/* Imagem e dados do imóvel */}
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex flex-col items-center md:w-1/3 w-full mb-4 md:mb-0">
              <img src={property?.imageUrl || '/placeholder.svg'} alt={property?.title} className="w-48 h-32 object-cover rounded mb-2" />
              <div className="font-semibold text-lg text-center mb-2">{property?.title}</div>
              <div className="text-sm text-gray-500 text-center mb-2">{property?.address}, {property?.city} - {property?.state}</div>
              <div className="text-xs text-gray-400 mb-2">Leilão em {property?.auctionDate ? new Date(property.auctionDate).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
            {/* Formulário e gráfico */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Lance Final
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.auctionValue}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <NumericFormat
                    value={formData.auctionValue}
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onValueChange={({ floatValue }) => handleChange('auctionValue', floatValue || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Valor de Revenda Esperado
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.resaleValue}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <NumericFormat
                    value={formData.resaleValue}
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onValueChange={({ floatValue }) => handleChange('resaleValue', floatValue || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Valor de Reforma
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.renovation}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <NumericFormat
                    value={formData.renovation}
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onValueChange={({ floatValue }) => handleChange('renovation', floatValue || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    ITBI (%)
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.itbi}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={formData.itbiPercent} min={0} max={100} step={0.01} onChange={e => handleChange('itbiPercent', e.target.value)} className="w-24" />
                    <span className="text-xs text-gray-500">({formatCurrency(itbiValue)})</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Comissão (%)
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.commission}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={formData.commissionPercent} min={0} max={100} step={0.01} onChange={e => handleChange('commissionPercent', e.target.value)} className="w-24" />
                    <span className="text-xs text-gray-500">({formatCurrency(commissionValue)})</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Cartório
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.cartorio}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <NumericFormat
                    value={formData.cartorio}
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onValueChange={({ floatValue }) => handleChange('cartorio', floatValue || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Prazo para Venda (meses)
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>{inputTips.sellTime}</TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </label>
                  <Input type="number" value={formData.sellTime} onChange={e => handleChange('sellTime', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center mt-4 w-full">
                <div className="w-full flex justify-center items-center md:w-1/2">
                  <PieChart className="simulator-piechart" width={window.innerWidth < 768 ? 220 : 350} height={window.innerWidth < 768 ? 220 : 350}>
                    <Pie
                      data={data.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 768 ? 70 : 120}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {data.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatCurrency} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/2 items-center md:items-start">
                  <div className="text-lg font-semibold">Lucro Líquido: <span className={results.netProfit > 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(results.netProfit)}</span></div>
                  <div className="text-lg font-semibold">Rentabilidade: <span className={results.roi > 0 ? 'text-green-600' : 'text-red-600'}>{results.roi.toFixed(2)}%</span></div>
                  <div className="text-md">Total de Custos: <span>{formatCurrency(results.totalCosts)}</span></div>
                  <div className="text-md">Lucro Bruto: <span>{formatCurrency(results.grossProfit)}</span></div>
                  <div className="text-xs text-gray-500 mt-2">* Rentabilidade calculada sobre o investimento total.</div>
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={handleExportPDF}>Exportar PDF</Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 