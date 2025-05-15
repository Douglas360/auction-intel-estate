import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, LogOut, Shield, Mail, Phone } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
  };
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '(11) 98765-4321', // Mock data
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    // Atualizar nome e telefone em user_metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        name: formData.name,
        phone: formData.phone,
      },
    });
    if (metaError) {
      toast.error('Erro ao atualizar dados pessoais.');
      return;
    }
    // Atualizar senha se fornecida
    if (formData.password) {
      const { error: passError } = await supabase.auth.updateUser({ password: formData.password });
      if (passError) {
        toast.error('Erro ao atualizar senha.');
        return;
      }
    }
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleLogout = async () => {
    await import('@/integrations/supabase/client').then(async ({ supabase }) => {
      await supabase.auth.signOut();
    });
    toast.info("Logout realizado com sucesso!");
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
    );
    
    if (confirmed) {
      toast.success("Conta excluída com sucesso!");
      // In a real app, this would call an API to delete the account
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" /> Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <span className="text-xs text-gray-500">O e-mail não pode ser alterado.</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Alterar senha</h3>
              <p className="text-sm text-gray-500">Deixe em branco caso não queira alterar a senha atual</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" /> Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium">Plano {user.plan}</h3>
                <p className="text-sm text-gray-500 mt-1">Acesso a todas as ferramentas básicas</p>
              </div>
              
              <Button className="w-full">Conhecer outros planos</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" /> Segurança e Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <span className="text-sm">E-mail verificado</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Telefone não verificado</span>
              </div>
              
              <Separator className="my-2" />
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da conta
              </Button>
              
              <Button 
                variant="outline"
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleDeleteAccount}
              >
                Excluir minha conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
