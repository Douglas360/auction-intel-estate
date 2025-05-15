
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, Home, Users, CreditCard, Database, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const AdminLayout = () => {
  // Check if user is authenticated and is an admin
  const { data: authData, isLoading } = useQuery({
    queryKey: ['adminAuth'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { isAdmin: false, user: null };
      }
      
      // Check if user is in admin_users table
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();
        
      return { 
        isAdmin: !!adminData, 
        user: session.user,
        isSuperAdmin: adminData?.is_super_admin || false
      };
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    window.location.href = '/admin/login';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Verificando credenciais de administrador...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not admin
  if (!authData?.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">HAU Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm">
              <User className="h-4 w-4 mr-2" />
              <span>{authData?.user?.email}</span>
              {authData?.isSuperAdmin && (
                <span className="ml-2 bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
        <div className="bg-gray-800">
          <div className="container mx-auto px-4">
            <nav className="flex overflow-x-auto">
              <a href="/admin" className="px-4 py-3 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </a>
              <a href="/admin/plans" className="px-4 py-3 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Planos de Assinatura
              </a>
              <a href="/admin/users" className="px-4 py-3 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </a>
              <a href="/admin/admins" className="px-4 py-3 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Administradores
              </a>
              <a href="/admin/import" className="px-4 py-3 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Importar Imóveis
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HAU - Área Administrativa
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
