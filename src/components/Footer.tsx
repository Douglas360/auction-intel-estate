import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-8 px-4 mt-12 border-t border-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        <div className="flex-1 mb-6 md:mb-0 flex flex-col items-start">
          <img src="/assets/logo-branco.svg" alt="Logo AP3" className="h-24 w-auto mb-2" />
          
          <p className="text-sm text-gray-300 mb-2">AP3 é uma Força de Vanguarda Tecnológica do Grupo HAU LTDA (CNPJ: 21.758.793/0001-82)</p>
          <p className="text-xs text-gray-500">Validação Regulatória (Creci): 224108-F</p>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-2 text-sm min-w-[280px]">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="font-semibold text-[#39FF14] min-w-[180px]">Interface de Inovação Direta:</span>
            <a href="mailto:tf@hau.com.br" className="hover:underline text-white break-all">tf@hau.com.br</a>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="font-semibold text-[#39FF14] min-w-[180px]">Conexão Quântica WhatsApp:</span>
            <a href="https://wa.me/5511990065000" target="_blank" rel="noopener noreferrer" className="hover:underline text-white">+55 11 99006-5000</a>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="font-semibold text-[#39FF14] min-w-[180px]">Nexus Central de Operações:</span>
            <span className="text-white">Rua Professor Atílio Innocenti, 165, 6º andar, Vila Nova Conceição, São Paulo – SP, 04538-000</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 border-t border-gray-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <span>© 2025 AP3 Inteligência Artificial Imobiliária. Todos os Direitos Reservados ao Futuro.</span>
      </div>
    </footer>
  );
};

export default Footer; 