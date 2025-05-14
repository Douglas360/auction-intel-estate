
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres')
});

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void; // Updated from onBackClick to match usage in AuthSection
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RegisterForm = ({ onSuccess, onLoginClick, isLoading, setIsLoading }: RegisterFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    },
  });

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Tentando registrar com:", values);
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          }
        }
      });
      
      if (error) throw error;
      
      console.log("Registro bem-sucedido:", data);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode prosseguir com a assinatura.",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
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
                  <Input type="password" placeholder="Crie uma senha segura" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onLoginClick}
            >
              Voltar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta e continuar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
