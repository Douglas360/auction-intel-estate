import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Bell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { NumericFormat } from 'react-number-format';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const propertyTypes = ['Apartamento', 'Casa', 'Terreno', 'Comercial'];
const auctionTypes = ['Qualquer', 'Banco', 'Judicial'];
const statusOptions = ['ativo', 'inativo'];

const UserAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({
    id: undefined,
    name: '',
    property_type: '',
    location: '',
    price_min: '',
    price_max: '',
    discount_min: '',
    status: 'ativo',
    auction_type: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) setError('Erro ao buscar alertas.');
    setAlerts(data || []);
    setLoading(false);
  }

  function openNewAlert() {
    setForm({
      id: undefined,
      name: '',
      property_type: '',
      location: '',
      price_min: '',
      price_max: '',
      discount_min: '',
      status: 'ativo',
      auction_type: '',
    });
    setModalOpen(true);
  }

  async function handleSaveAlert(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({ title: 'Erro', description: 'Usuário não autenticado.' });
      setSaving(false);
      return;
    }
    let payload = {
      user_id: session.user.id,
      name: form.name.trim(),
      property_type: form.property_type.trim(),
      location: form.location.trim(),
      price_min: Number(form.price_min),
      price_max: Number(form.price_max),
      discount_min: Number(form.discount_min),
      status: form.status,
      auction_type: form.auction_type.trim(),
      created_at: form.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Remover campos vazios
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === undefined || Number.isNaN(payload[key])) delete payload[key];
    });
    console.log('Payload enviado:', payload);
    let result;
    if (form.id) {
      result = await supabase.from('alerts').update(payload).eq('id', form.id);
    } else {
      result = await supabase.from('alerts').insert(payload);
    }
    if (result.error) {
      toast({ title: 'Erro', description: result.error.message || 'Não foi possível salvar o alerta.' });
    } else {
      toast({ title: 'Sucesso', description: 'Alerta salvo com sucesso!' });
      setModalOpen(false);
      fetchAlerts();
    }
    setSaving(false);
  }

  function handleEditAlert(alert: any) {
    setForm({
      ...alert,
      price_min: alert.price_min?.toString() || '',
      price_max: alert.price_max?.toString() || '',
      discount_min: alert.discount_min?.toString() || '',
      auction_type: alert.auction_type || '',
    });
    setModalOpen(true);
  }

  async function handleDeleteAlert(id: string) {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir o alerta.' });
    } else {
      toast({ title: 'Sucesso', description: 'Alerta excluído com sucesso!' });
      fetchAlerts();
    }
    setDeleteId(null);
  }

  async function handleToggleStatus(alert: any) {
    const newStatus = alert.status === 'ativo' ? 'inativo' : 'ativo';
    const { error } = await supabase.from('alerts').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', alert.id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status.' });
    } else {
      fetchAlerts();
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Meus Alertas</h2>
        <Button onClick={openNewAlert}>
          <Plus className="h-4 w-4 mr-1" /> Novo Alerta
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center text-gray-500 py-10">Carregando alertas...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : alerts.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-gray-500 mb-4">Você ainda não tem alertas configurados.</p>
            <Button onClick={openNewAlert}>Criar Alerta</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Preço R$</TableHead>
                  <TableHead>Desconto Min.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.name}</TableCell>
                    <TableCell>{alert.property_type}</TableCell>
                    <TableCell>{alert.location}</TableCell>
                    <TableCell>{formatCurrency(alert.price_min)} - {formatCurrency(alert.price_max)}</TableCell>
                    <TableCell>{alert.discount_min}%</TableCell>
                    <TableCell>
                      <Badge variant={alert.status === 'ativo' ? "default" : "outline"} className={alert.status === 'ativo' ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" : "cursor-pointer"} onClick={() => handleToggleStatus(alert)}>
                        {alert.status === 'ativo' ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditAlert(alert)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => setDeleteId(alert.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir alerta?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="text-sm text-gray-500 mb-4">Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.</div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAlert(alert.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Como funcionam os alertas?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-500">
              <p>Crie alertas personalizados para receber notificações por e-mail sempre que novos imóveis que correspondam aos seus critérios aparecerem na plataforma.</p>
              <p className="mt-2">Você pode configurar múltiplos alertas com diferentes filtros para não perder nenhuma oportunidade.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <form onSubmit={handleSaveAlert} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{form.id ? 'Editar Alerta' : 'Novo Alerta'}</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Nome do alerta"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <div className="flex gap-2">
              <select
                className="border rounded px-3 py-2 w-1/2"
                value={form.property_type}
                onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}
                required
              >
                <option value="">Tipo de imóvel</option>
                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <Input
                placeholder="Localização"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-2">
              <NumericFormat
                value={form.price_min}
                thousandSeparator="."
                decimalSeparator="," 
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Preço mínimo"
                onValueChange={({ floatValue }) => setForm(f => ({ ...f, price_min: floatValue || '' }))}
                required
              />
              <NumericFormat
                value={form.price_max}
                thousandSeparator="."
                decimalSeparator="," 
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Preço máximo"
                onValueChange={({ floatValue }) => setForm(f => ({ ...f, price_max: floatValue || '' }))}
                required
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Desconto mínimo (%)"
                value={form.discount_min}
                onChange={e => setForm(f => ({ ...f, discount_min: e.target.value }))}
                min={0}
                max={100}
                required
              />
              <select
                className="border rounded px-3 py-2 w-1/2"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                {statusOptions.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
              </select>
            </div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.auction_type}
              onChange={e => setForm(f => ({ ...f, auction_type: e.target.value }))}
              required
            >
              <option value="">Tipo de leilão</option>
              {auctionTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <DialogFooter>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAlerts;
