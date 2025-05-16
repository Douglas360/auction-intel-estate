
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  is_super_admin: z.boolean().default(false),
});

const AdminUsers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      is_super_admin: false,
    },
  });

  // Fetch admin users
  const { data: adminUsers, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // Get current user to determine if super admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }
      
      const { data: currentAdmin } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('user_id', session.user.id)
        .single();
      
      const isSuperAdmin = currentAdmin?.is_super_admin || false;
      
      // Get admin users with their emails
      const { data: admins, error } = await supabase.functions.invoke('get-admin-users');
      
      if (error) {
        throw error;
      }
      
      return { admins: admins || [], currentUserIsSuperAdmin: isSuperAdmin };
    },
  });

  const handleCreateAdmin = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { 
          email: values.email, 
          password: values.password, 
          is_super_admin: values.is_super_admin 
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.message || 'Erro desconhecido');
      
      toast.success('Administrador criado com sucesso!');
      setIsDialogOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao criar administrador: ${error.message}`);
    }
  };

  const toggleAdminStatus = async (admin: AdminUser) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          is_active: !admin.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);
      
      if (error) throw error;
      
      toast.success(`Administrador ${admin.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao alterar status: ${error.message}`);
    }
  };

  const toggleSuperAdminStatus = async (admin: AdminUser) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          is_super_admin: !admin.is_super_admin,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);
      
      if (error) throw error;
      
      toast.success(`Nível de permissão alterado com sucesso!`);
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao alterar permissão: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Administradores</h1>
        
        {adminUsers?.currentUserIsSuperAdmin && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Administrador
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de criação</th>
                  {adminUsers?.currentUserIsSuperAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminUsers?.admins?.map((admin: AdminUser) => (
                  <tr key={admin.id} className={!admin.is_active ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.user_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={admin.is_super_admin ? "default" : "secondary"}>
                        {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {admin.is_active ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span>Inativo</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    {adminUsers?.currentUserIsSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAdminStatus(admin)}
                        >
                          {admin.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleSuperAdminStatus(admin)}
                        >
                          {admin.is_super_admin ? 'Remover Super Admin' : 'Tornar Super Admin'}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {adminUsers?.admins?.length === 0 && (
                  <tr>
                    <td colSpan={adminUsers.currentUserIsSuperAdmin ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum administrador encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo administrador</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo usuário administrador.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha inicial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_super_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Super Admin</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Concede permissões adicionais, como criar outros administradores
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Criando...' : 'Criar administrador'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
