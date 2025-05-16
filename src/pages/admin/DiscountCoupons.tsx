
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash, Loader2 } from 'lucide-react';

const DiscountCoupons = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'percentage',
    percentOff: '',
    amountOff: '',
    currency: 'brl',
    duration: 'once',
    durationMonths: '',
    maxRedemptions: '',
    expiresAt: ''
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'list' }
      });
      
      if (error) throw error;
      return data || [];
    }
  });

  const createCoupon = useMutation({
    mutationFn: async (couponData: any) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'create',
          coupon: couponData
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Cupom criado",
        description: "O cupom foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar cupom: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'delete',
          coupon: { id: couponId }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: "Cupom excluído",
        description: "O cupom foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir cupom: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      discountType: 'percentage',
      percentOff: '',
      amountOff: '',
      currency: 'brl',
      duration: 'once',
      durationMonths: '',
      maxRedemptions: '',
      expiresAt: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData: any = {
      name: formData.name,
      code: formData.code,
      duration: formData.duration
    };
    
    if (formData.discountType === 'percentage') {
      couponData.percent_off = parseFloat(formData.percentOff);
    } else {
      couponData.amount_off = parseFloat(formData.amountOff);
      couponData.currency = formData.currency;
    }
    
    if (formData.duration === 'repeating') {
      couponData.duration_in_months = parseInt(formData.durationMonths);
    }
    
    if (formData.maxRedemptions) {
      couponData.max_redemptions = parseInt(formData.maxRedemptions);
    }
    
    if (formData.expiresAt) {
      couponData.expires_at = formData.expiresAt;
    }
    
    createCoupon.mutate(couponData);
  };

  const handleDelete = (couponId: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCoupon.mutate(couponId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Cupons de Desconto</CardTitle>
          <CardDescription>Gerencie cupons de desconto para assinaturas</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-auction-primary hover:bg-auction-secondary">
              <Plus className="mr-2 h-4 w-4" /> Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo cupom de desconto.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome do cupom"
                    className="col-span-3"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Código
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="Código do cupom (opcional)"
                    className="col-span-3"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountType" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => handleSelectChange('discountType', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tipo de desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="amount">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.discountType === 'percentage' ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="percentOff" className="text-right">
                      Percentual (%)
                    </Label>
                    <Input
                      id="percentOff"
                      name="percentOff"
                      type="number"
                      placeholder="Ex: 10"
                      className="col-span-3"
                      value={formData.percentOff}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amountOff" className="text-right">
                      Valor (R$)
                    </Label>
                    <Input
                      id="amountOff"
                      name="amountOff"
                      type="number"
                      placeholder="Ex: 50"
                      className="col-span-3"
                      value={formData.amountOff}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duração
                  </Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => handleSelectChange('duration', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Duração do cupom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Uso único</SelectItem>
                      <SelectItem value="repeating">Múltiplos meses</SelectItem>
                      <SelectItem value="forever">Sempre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.duration === 'repeating' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="durationMonths" className="text-right">
                      Meses
                    </Label>
                    <Input
                      id="durationMonths"
                      name="durationMonths"
                      type="number"
                      placeholder="Número de meses"
                      className="col-span-3"
                      value={formData.durationMonths}
                      onChange={handleInputChange}
                      required={formData.duration === 'repeating'}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxRedemptions" className="text-right">
                    Máx. Usos
                  </Label>
                  <Input
                    id="maxRedemptions"
                    name="maxRedemptions"
                    type="number"
                    placeholder="Ilimitado se vazio"
                    className="col-span-3"
                    value={formData.maxRedemptions}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">
                    Expiração
                  </Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    className="col-span-3"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCoupon.isPending}
                  className="bg-auction-primary hover:bg-auction-secondary"
                >
                  {createCoupon.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Cupom'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando cupons...</span>
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum cupom de desconto encontrado.</p>
            <p className="text-sm mt-2">Clique em "Novo Cupom" para criar um.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon: any) => (
                  <TableRow key={coupon.id}>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>
                      {coupon.promotion_codes && coupon.promotion_codes.length > 0 
                        ? coupon.promotion_codes[0].code 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {coupon.percent_off 
                        ? `${coupon.percent_off}%` 
                        : `${(coupon.amount_off / 100).toFixed(2)} ${coupon.currency.toUpperCase()}`}
                    </TableCell>
                    <TableCell>
                      {coupon.duration === 'once' ? 'Uso único' : 
                       coupon.duration === 'repeating' ? `${coupon.duration_in_months} meses` :
                       'Para sempre'}
                    </TableCell>
                    <TableCell>
                      {coupon.promotion_codes && 
                       coupon.promotion_codes.length > 0 && 
                       coupon.promotion_codes[0].expires_at
                        ? formatDate(coupon.promotion_codes[0].expires_at)
                        : 'Não expira'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={coupon.valid ? 'default' : 'outline'}
                        className={coupon.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {coupon.valid ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        disabled={deleteCoupon.isPending}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
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

export default DiscountCoupons;
