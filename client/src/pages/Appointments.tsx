import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, CheckCircle, XCircle, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Appointments() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: beneficiaries } = trpc.beneficiaries.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: specialties } = trpc.specialties.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const confirmMutation = trpc.appointments.confirm.useMutation({
    onSuccess: () => {
      toast.success("Agendamento confirmado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      beneficiaryId: Number(formData.get('beneficiaryId')),
      specialtyId: formData.get('specialtyId') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      notes: formData.get('notes') as string,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="badge-success">Confirmado</Badge>;
      case 'pending':
        return <Badge className="badge-warning">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="badge-error">Cancelado</Badge>;
      case 'completed':
        return <Badge className="badge-info">Concluído</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os agendamentos de consultas
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo agendamento
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="beneficiaryId">Beneficiário *</Label>
                    <Select name="beneficiaryId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um beneficiário" />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiaries?.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name} - {b.cpf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialtyId">Especialidade *</Label>
                    <Select name="specialtyId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties?.map((s) => (
                          <SelectItem key={s.id} value={s.rapidocId}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data *</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Horário *</Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" name="notes" placeholder="Observações sobre o agendamento" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments?.filter(a => a.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments?.filter(a => a.status === 'confirmed').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments?.filter(a => a.status === 'cancelled').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
            <CardDescription>
              {appointments?.length || 0} agendamentos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : appointments && appointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiário</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const beneficiary = beneficiaries?.find(b => b.id === appointment.beneficiaryId);
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {beneficiary?.name || 'Beneficiário não encontrado'}
                        </TableCell>
                        <TableCell>{appointment.specialtyName || '-'}</TableCell>
                        <TableCell>
                          {new Date(appointment.scheduledDate).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmMutation.mutate({ id: appointment.id })}
                                  disabled={confirmMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt('Motivo do cancelamento (opcional):');
                                    cancelMutation.mutate({ id: appointment.id, reason: reason || undefined });
                                  }}
                                  disabled={cancelMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
