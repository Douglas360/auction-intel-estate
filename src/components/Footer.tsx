import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const [stats, setStats] = useState({
    total: 0,
    avgPrice: 0,
    sp: 0,
    rj: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Total de imóveis
      const { count: total } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Preço médio
      const { data: avgData } = await supabase
        .from('properties')
        .select('auction_price');
      const prices = avgData?.map(p => p.auction_price).filter(Boolean) || [];
      const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

      // Imóveis em SP
      const { count: sp } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'SP');

      // Imóveis em RJ
      const { count: rj } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'RJ');

      setStats({
        total: total || 0,
        avgPrice: avgPrice || 0,
        sp: sp || 0,
        rj: rj || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <footer className="bg-black text-white pt-10 pb-4">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/20">
          {/* Sobre */}
          <div>
            <h3 className="text-green-500 text-xl font-bold mb-2">Sobre</h3>
            <p className="text-sm leading-relaxed">
              AP3 é uma Proptech de leilões de imóveis, com análise de dados avançada, otimização de investimentos imobiliários, oportunidades únicas, descontos incríveis, lucro maximizado, agilidade, segurança, decisões inteligentes, investidores, empresas do setor, rentabilidade.
            </p>
          </div>
          {/* Links */}
          <div>
            <h3 className="text-green-500 text-xl font-bold mb-2">Links</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Termina em Breve</a></li>
              <li><a href="#" className="hover:underline">Buscar no Mapa</a></li>
              <li><a href="#" className="hover:underline">Maiores Rentabilidades</a></li>
              <li><a href="#" className="hover:underline">Imóveis em Destaque</a></li>
              <li><a href="#" className="hover:underline">Maiores Valor</a></li>
              <li><a href="#" className="hover:underline">Menor Valor</a></li>
              <li><a href="#" className="hover:underline">Afiliados</a></li>
            </ul>
          </div>
          {/* Contato */}
          <div>
            <h3 className="text-green-500 text-xl font-bold mb-2">Contato</h3>
            <ul className="text-sm space-y-1">
              <li>contato@ap3.com.br</li>
              <li>WhatsApp: +55 11 99006-5000</li>
              <li>Rua Professor Atílio Innocenti, 165, 6º andar</li>
              <li>CEP 04538-000</li>
              <li>São Paulo – SP</li>
            </ul>
          </div>
          {/* Inscreva-se / Inteligência */}
          <div>
            <h3 className="text-green-500 text-xl font-bold mb-2">Inscreva-se</h3>
            <div className="flex mb-3">
              <input type="email" placeholder="Seu e-mail" className="rounded-l px-3 py-1 text-black" />
              <button className="bg-green-500 text-white px-4 rounded-r font-bold">Ok!</button>
            </div>
            <div className="bg-black/80 rounded p-3 mt-2">
              <h4 className="text-green-500 text-lg font-bold mb-2">Inteligencia</h4>
              <ul className="text-sm space-y-1">
                <li>{stats.total.toLocaleString()} imóveis em leilão</li>
                <li>R$ {stats.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} preço médio</li>
                <li>{stats.sp.toLocaleString()} imóveis em São Paulo</li>
                <li>{stats.rj.toLocaleString()} imóveis em Rio de Janeiro</li>
              </ul>
              <div className="flex space-x-3 mt-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="text-center text-xs text-white/80 mt-6">
          © 2025 - AP3 Inteligência Artificial Imobiliária. Todos os Direitos Reservados ao Futuro.<br />
          (Creci): 224108-F - AP3 - Força Tecnológica do Grupo HAU LTDA CNPJ: 21.758.793/0001-82
        </div>
      </div>
    </footer>
  );
};

export default Footer; 