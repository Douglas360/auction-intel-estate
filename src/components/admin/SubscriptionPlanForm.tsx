
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Json } from '@/integrations/supabase/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  price_monthly: z.coerce.number().min(0, 'O preço deve ser maior ou igual a zero'),
  price_annual: z.coerce.number().min(0, 'O preço deve ser maior ou igual a zero'),
  benefits: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionPlanFormProps {
  planId?: string;
  onSuccess?: () => void;
}

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  planId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [originalPlan, setOriginalPlan] = useState<any>(null);
  const [stripeConnected, setStripeConnected] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price_monthly: 0,
      price_annual: 0,
      benefits: '',
      status: 'active',
    },
  });

  // Load plan data if editing
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setOriginalPlan(data);
          setStripeConnected(!!data.stripe_product_id);
          // Format benefits for the form
          const benefitsString = data.benefits 
            ? Array.isArray(data.benefits) 
              ? data.benefits.join('\n') 
              : typeof data.benefits === 'string' 
                ? data.benefits 
                : JSON.stringify(data.benefits)
            : '';
            
          form.reset({
            title: data.title || '',
            description: data.description || '',
            price_monthly: data.price_monthly || 0,
            price_annual: data.price_annual || 0,
            benefits: benefitsString,
            status: (data.status as 'active' | 'inactive') || 'active',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
        toast.error('Erro ao carregar dados do plano.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, form]);

  // Sync with Stripe
  const syncWithStripe = async (planData: any) => {
    setIsStripeLoading(true);
    try {
      // Check if this is an update or a new plan
      const isUpdate = !!originalPlan?.stripe_product_id;
      
      // Check if prices have changed (for updates)
      if (isUpdate) {
        planData.price_monthly_changed = planData.price_monthly !== originalPlan.price_monthly;
        planData.price_annual_changed = planData.price_annual !== originalPlan.price_annual;
      }
      
      const operation = isUpdate ? 'update' : 'create';
      
      // Call our Stripe sync edge function
      const { data, error } = await supabase.functions.invoke('stripe-sync-plans', {
        body: {
          operation,
          plan: planData,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error('Falha ao sincronizar com o Stripe.');
      }
      
      // Return any data from Stripe that we need to save
      return data.data || {};
    } catch (error) {
      console.error('Erro na integração com o Stripe:', error);
      throw new Error('Falha ao integrar com o Stripe. Verifique os logs para mais detalhes.');
    } finally {
      setIsStripeLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Format benefits as an array for JSON compatibility
      const parsedBenefits = values.benefits
        ? values.benefits.split('\n').filter(line => line.trim() !== '')
        : [];
        
      const planData = {
        title: values.title,
        description: values.description,
        price_monthly: values.price_monthly,
        price_annual: values.price_annual,
        benefits: parsedBenefits as Json,
        status: values.status,
        updated_at: new Date().toISOString(),
      };
      
      let operation;
      let planId;
      
      if (planId) {
        // Update existing plan
        planData.id = planId;
        
        try {
          // Sync with Stripe first
          const stripeData = await syncWithStripe(planData);
          
          // Merge any Stripe data into our plan data
          Object.assign(planData, stripeData);
          
          // Update Supabase
          operation = supabase
            .from('subscription_plans')
            .update(planData)
            .eq('id', planId);
        } catch (error) {
          toast.error(`Erro ao sincronizar com o Stripe: ${error.message}`);
          setIsLoading(false);
          return;
        }
      } else {
        // First create the plan in Supabase to get an ID
        const { data: newPlanData, error: insertError } = await supabase
          .from('subscription_plans')
          .insert(planData)
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        try {
          // Then sync the new plan with Stripe
          const stripeData = await syncWithStripe(newPlanData);
          
          // Update the plan with Stripe IDs
          if (Object.keys(stripeData).length > 0) {
            operation = supabase
              .from('subscription_plans')
              .update(stripeData)
              .eq('id', newPlanData.id);
          }
        } catch (error) {
          toast.error(`Erro ao sincronizar com o Stripe: ${error.message}`);
          // We've already created the plan in Supabase, no need to throw
        }
      }
      
      // Perform final database update if needed
      if (operation) {
        const { error } = await operation;
        if (error) throw error;
      }
      
      toast.success(planId ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!planId) {
        // Reset form after creating new plan
        form.reset({
          title: '',
          description: '',
          price_monthly: 0,
          price_annual: 0,
          benefits: '',
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {planId && stripeConnected && (
          <div className="bg-green-50 border border-green-100 p-3 rounded-md flex items-center">
            <div className="bg-green-100 rounded-full p-1 mr-3">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-green-800">
              Este plano está integrado com o Stripe.
            </div>
          </div>
        )}
        
        {planId && !stripeConnected && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plano não integrado</AlertTitle>
            <AlertDescription>
              Este plano ainda não está integrado ao Stripe. Ao salvar, será criado automaticamente na sua conta Stripe.
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="Ex: Plano Premium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  disabled={isLoading} 
                  placeholder="Descreva o plano..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price_monthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Mensal (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    disabled={isLoading} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price_annual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Anual (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    disabled={isLoading} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefícios (um por linha)</FormLabel>
              <FormControl>
                <Textarea 
                  disabled={isLoading} 
                  placeholder="Ex: Acesso ilimitado&#10;Relatórios premium&#10;Suporte prioritário" 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                disabled={isLoading} 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading || isStripeLoading}
            className="bg-auction-primary hover:bg-auction-secondary"
          >
            {isLoading || isStripeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isStripeLoading ? 'Integrando com Stripe...' : 'Salvando...'}
              </>
            ) : planId ? 'Atualizar Plano' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

import { CreditCard, Loader2 } from 'lucide-react';
export default SubscriptionPlanForm;
