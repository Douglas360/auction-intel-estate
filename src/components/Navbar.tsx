
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, Bell, User, Settings } from 'lucide-react';

const Navbar = () => {
  // For demo purposes, we'll assume the user is logged in
  const isLoggedIn = true;

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 left-0 shadow-sm">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-auction-primary">
                LeiloaImobi
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="nav-link">Buscar</Link>
            <Link to="/properties" className="nav-link">Imóveis</Link>
            <Link to="/simulator" className="nav-link">Simulador</Link>
            {isLoggedIn && (
              <Link to="/dashboard" className="nav-link">Minha Conta</Link>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button type="button" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
              <Search className="w-5 h-5" />
            </button>
            {isLoggedIn && (
              <Link to="/dashboard" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
                <Bell className="w-5 h-5" />
              </Link>
            )}
            <Link to="/admin" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
              <Settings className="w-5 h-5" />
            </Link>
            {isLoggedIn ? (
              <Button variant="outline" size="sm" className="ml-2" asChild>
                <Link to="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="ml-2">
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
