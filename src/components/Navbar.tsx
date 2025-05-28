import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();
        
        setIsAdmin(!!adminData);
      }
    };
    
    checkAuthStatus();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      checkAuthStatus();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 left-0 shadow-sm">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex ml-2">
              <img 
                src="/assets/logo.png" 
                alt="HAU Logo" 
                className="h-10" 
              />              
            </Link>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center space-x-4">
            <Link to="/properties" className="nav-link">Imóveis</Link>
            <Link to="/simulator" className="nav-link">Simulador</Link>
            <Link to="/pricing" className="nav-link">Planos</Link>
            {isLoggedIn && (
              <Link to="/dashboard" className="nav-link">Minha Conta</Link>
            )}
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button type="button" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
              <Search className="w-5 h-5" />
            </button>
            {isLoggedIn && (
              <Link to="/dashboard" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
                <Bell className="w-5 h-5" />
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
                <Settings className="w-5 h-5" />
              </Link>
            )}
            {isLoggedIn ? (
              <Button variant="outline" size="sm" className="ml-2" asChild>
                <Link to="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate('/login')}>
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
