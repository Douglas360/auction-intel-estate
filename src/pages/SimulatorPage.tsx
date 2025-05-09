
import React from 'react';
import Navbar from '@/components/Navbar';
import ProfitSimulator from '@/components/ProfitSimulator';

const SimulatorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-20 pb-10">
        <h1 className="text-3xl font-bold mb-6 mt-4">Simulador de Rentabilidade</h1>
        <p className="text-gray-600 mb-8">
          Utilize nosso simulador para calcular o potencial retorno financeiro de uma operação de compra em leilão e revenda do imóvel.
        </p>
        
        <ProfitSimulator />
        
        <div className="mt-10 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Como funciona o simulador?</h2>
          <p className="text-gray-600 mb-4">
            O simulador de rentabilidade permite estimar o lucro potencial em uma operação imobiliária envolvendo compra em leilão e posterior revenda. 
            Leve em consideração os seguintes fatores:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Valor no Leilão</h3>
              <p className="text-sm text-gray-600">
                Valor pelo qual você pretende arrematar o imóvel no leilão. Este será seu investimento inicial.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Valor de Mercado</h3>
              <p className="text-sm text-gray-600">
                Quanto o imóvel vale no mercado tradicional, após ser regularizado. Este será seu preço potencial de venda.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Custos de Desocupação</h3>
              <p className="text-sm text-gray-600">
                Caso o imóvel esteja ocupado, inclua os custos para desocupação amigável ou judicial.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Dívidas</h3>
              <p className="text-sm text-gray-600">
                Débitos de IPTU, condomínio e outras pendências que precisarão ser quitadas pelo arrematante.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">ITBI</h3>
              <p className="text-sm text-gray-600">
                Imposto de transmissão que incide sobre a transação, geralmente 3% do valor do imóvel.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Comissão</h3>
              <p className="text-sm text-gray-600">
                Valor pago ao corretor ou imobiliária pela venda do imóvel, tipicamente 5% do valor de venda.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Custo de Reforma</h3>
              <p className="text-sm text-gray-600">
                Investimento necessário para deixar o imóvel em condições de venda no mercado tradicional.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Tempo para Venda</h3>
              <p className="text-sm text-gray-600">
                Período estimado para concluir todo o processo, desde a arrematação até a venda final do imóvel.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Atenção</h3>
            <p className="text-sm text-gray-600">
              Este simulador fornece apenas uma estimativa e não leva em conta todos os fatores que podem afetar a operação, como impostos específicos, 
              variações de mercado, custos de financiamento, entre outros. Para uma análise mais precisa, recomendamos consultar um especialista.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;
