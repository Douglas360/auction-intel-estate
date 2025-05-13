
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash, CreditCard, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SubscriptionPlanForm from '@/components/admin/SubscriptionPlanForm';
import { Json } from '@/integrations/supabase/types';

// Define the type for the subscription plans
type SubscriptionPlan = {
  id: string;
  title: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  benefits: string[] | null;
  status: string;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
};

const SubscriptionPlansAdmin = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Format currency in BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Fetch plans from database
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Process the data to ensure benefits is properly typed as string[]
      const processedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        benefits: processBenefits(plan.benefits)
      }));
      
      setPlans(processedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar os planos de assinatura.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to process benefits data from different formats
  const processBenefits = (benefits: Json | null): string[] | null => {
    if (!benefits) return null;
    
    if (Array.isArray(benefits)) {
      return benefits.map(b => String(b));
    }
    
    if (typeof benefits === 'string') {
      try {
        // Try to parse it as JSON if it's a stringified array
        const parsed = JSON.parse(benefits);
        return Array.isArray(parsed) ? parsed.map(b => String(b)) : [benefits];
      } catch {
        // If parsing fails, treat it as a single string
        return [benefits];
      }
    }
    
    // If it's an object or other type, convert to string and return as array
    return [String(benefits)];
  };

  // Sync with Stripe
  const syncWithStripe = async () => {
    setIsSyncingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-sync-plans', {
        body: {
          operation: 'sync'
        },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(`Sincronização concluída! ${data.updates} planos atualizados, ${data.inserts} planos adicionados.`);
        // Refresh plans list
        fetchPlans();
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      toast.error('Erro ao sincronizar com o Stripe.');
    } finally {
      setIsSyncingStripe(false);
    }
  };

  // Delete plan
  const deletePlan = async () => {
    if (!deletingPlanId) return;

    try {
      // First check if the plan has a Stripe product ID
      const planToDelete = plans.find(p => p.id === deletingPlanId);
      
      if (planToDelete?.stripe_product_id) {
        // Delete in Stripe first
        const { error: stripeError } = await supabase.functions.invoke('stripe-sync-plans', {
          body: {
            operation: 'delete',
            plan: { id: deletingPlanId }
          },
        });
        
        if (stripeError) {
          console.error('Error deleting from Stripe:', stripeError);
          // Continue with local deletion anyway
        }
      }
      
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', deletingPlanId);

      if (error) throw error;
      toast.success('Plano excluído com sucesso!');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao excluir o plano.');
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingPlanId(null);
    }
  };

  // Handle edit plan
  const handleEditPlan = (planId: string) => {
    setEditingPlanId(planId);
    setFormOpen(true);
  };

  // Handle delete confirmation
  const confirmDeletePlan = (planId: string) => {
    setDeletingPlanId(planId);
    setDeleteConfirmOpen(true);
  };

  // Initialize
  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Planos de Assinatura</h1>
          <p className="text-muted-foreground">Gerencie os planos de assinatura disponíveis.</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={syncWithStripe}
            disabled={isSyncingStripe}
          >
            {isSyncingStripe ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar com Stripe
          </Button>
          
          <Button onClick={() => { setEditingPlanId(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Plano
          </Button>
        </div>
      </div>

      {/* List of plans */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Carregando planos...</p>
            </CardContent>
          </Card>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Nenhum plano de assinatura encontrado. Crie um novo plano para começar.</p>
              <Button onClick={() => { setEditingPlanId(null); setFormOpen(true); }} className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Criar Plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{plan.title}</h3>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                    <div className="pt-2">
                      <p className="text-sm">
                        <span className="font-medium">Mensal:</span> {formatCurrency(plan.price_monthly)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Anual:</span> {formatCurrency(plan.price_annual)}
                      </p>
                    </div>
                  </div>

                  {/* Stripe integration status */}
                  <div className="md:text-right">
                    {plan.stripe_product_id ? (
                      <div className="flex items-center justify-end text-green-600 text-sm">
                        <CreditCard className="h-4 w-4 mr-1" />
                        <span>Integrado com Stripe</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end text-amber-600 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>Não integrado com Stripe</span>
                      </div>
                    )}
                    <div className="flex space-x-2 mt-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan.id)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => confirmDeletePlan(plan.id)}>
                        <Trash className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="p-6">
                  <h4 className="text-sm font-medium mb-2">Benefícios:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                    {plan.benefits && Array.isArray(plan.benefits) && plan.benefits.length > 0 ? (
                      plan.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))
                    ) : (
                      <li>Nenhum benefício cadastrado</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Plan form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlanId ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription>
              {editingPlanId 
                ? 'Edite as informações do plano de assinatura.' 
                : 'Preencha as informações para criar um novo plano de assinatura.'}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionPlanForm
            planId={editingPlanId || undefined}
            onSuccess={() => {
              setFormOpen(false);
              fetchPlans();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este plano de assinatura? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deletePlan}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlansAdmin;
