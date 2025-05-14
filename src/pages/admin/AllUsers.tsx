import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const AllUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      return data.users as any[];
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar usuários</div>;

  return (
    <Card>
      <CardContent>
        <h1 className="text-2xl font-bold mb-4">Todos os Usuários</h1>
        <table className="w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>ID</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user: any) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.id}</td>
                <td>{new Date(user.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default AllUsers; 