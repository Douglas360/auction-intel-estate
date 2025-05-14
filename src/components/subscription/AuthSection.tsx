
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthSectionProps {
  authStep: string;
  setAuthStep: (step: 'check' | 'login' | 'register' | 'confirmed') => void;
  isAuthLoading: boolean;
  setIsAuthLoading: (loading: boolean) => void;
}

const AuthSection = ({ 
  authStep, 
  setAuthStep, 
  isAuthLoading, 
  setIsAuthLoading 
}: AuthSectionProps) => {
  
  const handleAuthSuccess = () => {
    console.log('Autenticação bem-sucedida, alterando para o estado confirmado');
    setAuthStep('confirmed');
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
      
      setAuthStep('login');
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth Step: check, login, register, confirmed
  return (
    <Card>
      <CardContent className="pt-6">
        {authStep === 'login' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LoginForm 
              onSuccess={handleAuthSuccess} 
              onRegisterClick={() => setAuthStep('register')}
              isLoading={isAuthLoading}
              setIsLoading={setIsAuthLoading}
            />
            
            <div className="border-t md:border-l md:border-t-0 pt-6 md:pt-0 md:pl-8">
              <h3 className="font-medium mb-4">Novo por aqui?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Crie uma conta para continuar com sua assinatura e aproveitar todos os benefícios.
              </p>
              <button
                onClick={() => setAuthStep('register')}
                className="text-primary hover:underline font-medium"
              >
                Criar uma conta
              </button>
            </div>
          </div>
        )}
        
        {authStep === 'register' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RegisterForm 
              onSuccess={handleAuthSuccess}
              onLoginClick={() => setAuthStep('login')}
              isLoading={isAuthLoading}
              setIsLoading={setIsAuthLoading}
            />
            
            <div className="border-t md:border-l md:border-t-0 pt-6 md:pt-0 md:pl-8">
              <h3 className="font-medium mb-4">Já possui uma conta?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Se você já tem uma conta conosco, faça login para continuar.
              </p>
              <button
                onClick={() => setAuthStep('login')}
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </button>
            </div>
          </div>
        )}
        
        {authStep === 'confirmed' && (
          <div className="py-4 text-center">
            <p className="mb-4 text-green-700 bg-green-50 p-3 rounded-md">
              ✓ Você está logado e pronto para assinar o plano.
            </p>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Deseja trocar de conta? Clique para sair.
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthSection;
