
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const AllUsers = () => {
  const queryClient = useQueryClient();
  
  // Query for fetching all users
  const { data, isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // Get all users from the auth data via edge function
      const { data: users, error } = await supabase.functions.invoke('get-all-users');
      
      if (error) throw error;
      
      // Fetch subscription information for all users
      const userIds = (users || []).map((user: any) => user.id);
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_plan_id, status')
        .in('user_id', userIds);
      
      // Fetch subscription plans
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id, title');
      
      // Map subscription plans to users
      const usersWithSubscriptions = (users || []).map((user: any) => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === user.id);
        const planDetails = plans?.find(plan => plan.id === userSubscription?.subscription_plan_id);
        
        return {
          ...user,
          subscription: userSubscription?.status === 'active' ? planDetails?.title || 'Free' : 'Free',
          subscription_status: userSubscription?.status || 'inactive'
        };
      });
      
      return usersWithSubscriptions || [];
    },
  });

  // Mutation for toggling user active status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const { data, error } = await supabase.functions.invoke('toggle-user-status', {
        body: { user_id: userId, is_active: isActive }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o status do usuário: ${error.message}`,
        variant: "destructive",
      });
    }
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
            Para visualizar todos os usuários, você precisa ter permissão de super administrador.
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Último login</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.subscription === 'Free' ? "outline" : "default"} className={user.subscription !== 'Free' ? "bg-green-100 text-green-800" : ""}>
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "outline"} className={user.is_active ? "bg-green-100 text-green-800" : ""}>
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch 
                          checked={user.is_active} 
                          onCheckedChange={(checked) => {
                            toggleUserStatus.mutate({ userId: user.id, isActive: checked });
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllUsers;
