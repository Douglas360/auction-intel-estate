
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AllUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // Check if user is a super admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }
      
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('user_id', session.user.id)
        .single();
        
      if (!adminUser?.is_super_admin) {
        throw new Error('Permissão negada: Apenas super administradores podem visualizar todos os usuários');
      }
      
      // Get all users from the auth data via edge function
      // Since we can't query auth.users directly, we'll use a function that returns sanitized user data
      const { data: users, error } = await supabase.functions.invoke('get-all-users');
      
      if (error) throw error;
      
      return users || [];
    },
  });

  if (isLoading) return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Carregando usuários...</span>
    </div>
  );
  
  if (error) return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-red-500 py-5">
          <p>{error instanceof Error ? error.message : 'Erro ao carregar usuários'}</p>
          <p className="text-sm mt-2">
            Para visualizar todos os usuários, você precisa ter permissão de super administrador e 
            configurar corretamente as permissões no backend do Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Todos os Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.length === 0 ? (
          <div className="text-center text-gray-500 py-5">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-left">Último login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      <Badge variant={user.is_active ? "default" : "outline"} className={user.is_active ? "bg-green-100 text-green-800" : ""}>
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{new Date(user.created_at).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4">{user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'Nunca'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllUsers;
