
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

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Format benefits as an array
      const parsedBenefits = values.benefits
        ? values.benefits.split('\n').filter(line => line.trim() !== '')
        : [];
        
      const planData = {
        ...values,
        benefits: parsedBenefits,
        updated_at: new Date().toISOString(),
      };
      
      let operation;
      if (planId) {
        // Update existing plan
        operation = supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', planId);
      } else {
        // Create new plan
        operation = supabase
          .from('subscription_plans')
          .insert([planData]);
      }
      
      const { error } = await operation;
      
      if (error) throw error;
      
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
            disabled={isLoading}
            className="bg-auction-primary hover:bg-auction-secondary"
          >
            {isLoading ? 'Salvando...' : planId ? 'Atualizar Plano' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubscriptionPlanForm;
