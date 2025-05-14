
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoginForm = ({ onSuccess, onRegisterClick, isLoading, setIsLoading }: LoginFormProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Você pode prosseguir com a assinatura.",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Já possui uma conta?</h3>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input 
            id="login-email" 
            type="email" 
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Senha</Label>
          <Input 
            id="login-password" 
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
