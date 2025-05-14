
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres')
});

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [isYearly, setIsYearly] = useState(false);
  const { plans, subscribeToPlan, isLoading, isCheckoutLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [authStep, setAuthStep] = useState<'check' | 'login' | 'register' | 'confirmed'>('check');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    },
  });
  
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast({
          title: "Plano não encontrado",
          description: "O plano selecionado não foi encontrado.",
          variant: "destructive",
        });
        navigate('/pricing');
      }
    }
    
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthStep('confirmed');
      } else {
        setAuthStep('login');
      }
    };
    
    checkAuth();
  }, [plans, planId, navigate]);

  const handleSubscribe = () => {
    if (selectedPlan) {
      subscribeToPlan(selectedPlan.id, isYearly ? 'year' : 'month');
    }
  };

  // Format currency in BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    setIsAuthLoading(true);
    
    try {
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
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode prosseguir com a assinatura.",
      });
      
      setAuthStep('confirmed');
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginCredentials.email,
        password: loginCredentials.password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Você pode prosseguir com a assinatura.",
      });
      
      setAuthStep('confirmed');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-3xl mx-auto px-4 pt-20 pb-16">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-3xl mx-auto px-4 pt-20 pb-16">
          <Card>
            <CardHeader>
              <CardTitle>Plano não encontrado</CardTitle>
              <CardDescription>
                Não encontramos o plano selecionado. Por favor, escolha um plano na página de preços.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/pricing')}>Ver planos disponíveis</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Assinar {selectedPlan.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {authStep === 'check' && (
              <Card className="mb-6">
                <CardContent className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </CardContent>
              </Card>
            )}
            
            {authStep === 'login' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Acesse sua conta</CardTitle>
                  <CardDescription>
                    Entre com sua conta para continuar com a assinatura ou crie uma nova conta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Já possui uma conta?</h3>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input 
                            id="login-email" 
                            type="email" 
                            value={loginCredentials.email}
                            onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Senha</Label>
                          <Input 
                            id="login-password" 
                            type="password"
                            value={loginCredentials.password}
                            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isAuthLoading}>
                          {isAuthLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                      </form>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Novo por aqui?</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Crie uma conta para prosseguir com a assinatura do plano.
                      </p>
                      <Button 
                        onClick={() => setAuthStep('register')} 
                        variant="outline"
                        className="w-full"
                      >
                        Criar uma conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {authStep === 'register' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Crie sua conta</CardTitle>
                  <CardDescription>
                    Preencha as informações abaixo para criar sua conta e prosseguir com a assinatura.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                          onClick={() => setAuthStep('login')}
                        >
                          Voltar
                        </Button>
                        <Button type="submit" disabled={isAuthLoading}>
                          {isAuthLoading ? 'Criando conta...' : 'Criar conta e continuar'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {authStep === 'confirmed' && (
              <Card className="mb-6 border-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Conta verificada</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPlan.title}</CardTitle>
                    <CardDescription>{selectedPlan.description}</CardDescription>
                  </div>
                  <Badge className="bg-green-600">Selecionado</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Período de cobrança:</span>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant={!isYearly ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setIsYearly(false)}
                        >
                          Mensal
                        </Button>
                        <Button 
                          variant={isYearly ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setIsYearly(true)}
                        >
                          Anual
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-center mb-2">
                    {formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}
                  </div>
                  <div className="text-sm text-gray-500 text-center">
                    {isYearly ? 'por ano' : 'por mês'}
                  </div>

                  {isYearly && (
                    <div className="bg-green-50 border border-green-100 rounded p-3 text-sm text-green-700 mt-4 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Economize com o pagamento anual!</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">O que está incluído:</h3>
                  <ul className="space-y-2">
                    {selectedPlan.benefits && selectedPlan.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(isYearly ? selectedPlan.price_annual : selectedPlan.price_monthly)}</span>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {isYearly ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={handleSubscribe} 
                  className="w-full" 
                  size="lg"
                  disabled={authStep !== 'confirmed' || isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Assinar agora'
                  )}
                </Button>
                
                {authStep !== 'confirmed' && (
                  <div className="text-sm text-amber-600 w-full flex items-center justify-center mt-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Faça login ou crie uma conta para continuar</span>
                  </div>
                )}
              </CardFooter>
            </Card>
            
            <div className="mt-4 text-sm text-center text-gray-500">
              Ao assinar, você concorda com nossos termos de serviço e política de privacidade.
              <br />Você pode cancelar sua assinatura a qualquer momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
