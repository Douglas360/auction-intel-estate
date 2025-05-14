
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthSectionProps {
  authStep: 'check' | 'login' | 'register' | 'confirmed';
  setAuthStep: (step: 'check' | 'login' | 'register' | 'confirmed') => void;
  isAuthLoading: boolean;
  setIsAuthLoading: (loading: boolean) => void;
}

const AuthSection = ({ authStep, setAuthStep, isAuthLoading, setIsAuthLoading }: AuthSectionProps) => {
  if (authStep === 'check') {
    return (
      <Card className="mb-6">
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (authStep === 'login') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Acesse sua conta</CardTitle>
          <CardDescription>
            Entre com sua conta para continuar com a assinatura ou crie uma nova conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoginForm 
              onSuccess={() => setAuthStep('confirmed')}
              onRegisterClick={() => setAuthStep('register')}
              isLoading={isAuthLoading}
              setIsLoading={setIsAuthLoading}
            />
            
            <div>
              <h3 className="font-medium mb-4">Novo por aqui?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Crie uma conta para prosseguir com a assinatura do plano.
              </p>
              <button 
                onClick={() => setAuthStep('register')} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
              >
                Criar uma conta
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authStep === 'register') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Crie sua conta</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para criar sua conta e prosseguir com a assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm 
            onSuccess={() => setAuthStep('confirmed')}
            onBackClick={() => setAuthStep('login')}
            isLoading={isAuthLoading}
            setIsLoading={setIsAuthLoading}
          />
        </CardContent>
      </Card>
    );
  }

  if (authStep === 'confirmed') {
    return (
      <Card className="mb-6 border-green-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Conta verificada</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default AuthSection;
