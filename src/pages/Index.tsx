
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { MapPin, Calendar, Search, FileText, DollarSign, Bell } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:px-6 bg-gradient-to-br from-auction-primary to-auction-secondary text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in">
                Encontre as melhores oportunidades em leilões imobiliários
              </h1>
              <p className="text-lg opacity-90">
                Centralizamos e analisamos imóveis de leilões judiciais e extrajudiciais para você investir com inteligência e segurança.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-white text-auction-primary hover:bg-gray-100">
                  <Link to="/search">Buscar Imóveis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-auction-primary">
                  <Link to="/simulator">Simular Rentabilidade</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/placeholder.svg" 
                alt="Imóveis em leilão" 
                className="rounded-lg shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Busque Imóveis</h3>
              <p className="text-gray-600">Acesse nossa base com imóveis de diversos leilões, judiciais e extrajudiciais, e filtre de acordo com suas preferências.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analise os Riscos</h3>
              <p className="text-gray-600">Faça upload da matrícula do imóvel e receba uma análise detalhada dos riscos jurídicos envolvidos na compra.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-auction-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simule o Lucro</h3>
              <p className="text-gray-600">Utilize nossa calculadora de rentabilidade para projetar o retorno financeiro da operação de compra e revenda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-auction-primary mb-2">2.500+</p>
              <p className="text-gray-600">Imóveis cadastrados</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-auction-primary mb-2">35%</p>
              <p className="text-gray-600">Desconto médio</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-auction-primary mb-2">48h</p>
              <p className="text-gray-600">Análise jurídica</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-auction-primary mb-2">500+</p>
              <p className="text-gray-600">Investidores ativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-auction-primary text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Receba alertas de novas oportunidades</h2>
          <p className="text-lg opacity-90 mb-8">
            Cadastre-se para receber notificações quando surgir um imóvel que corresponda aos seus critérios de investimento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-auction-primary hover:bg-gray-100">
              <Link to="/signup">Criar conta grátis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-gray-900 text-gray-400">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">LeiloaImobi</h3>
              <p className="text-sm">
                Plataforma de análise e oportunidades em leilões imobiliários.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/search" className="hover:text-white transition-colors">Buscar Imóveis</Link></li>
                <li><Link to="/simulator" className="hover:text-white transition-colors">Simulador de Lucro</Link></li>
                <li><Link to="/legal" className="hover:text-white transition-colors">Análise de Risco</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Guia de Leilões</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li>contato@leiloaimobi.com.br</li>
                <li>(11) 3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
            <p>&copy; 2025 LeiloaImobi. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
