import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Plus, Search, RefreshCw, UserX, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Beneficiaries() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);

  const { data: beneficiaries, isLoading, refetch } = trpc.beneficiaries.list.useQuery(
    { search: search || undefined },
    { enabled: user?.role === 'admin' }
  );

  const syncMutation = trpc.beneficiaries.sync.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.synced} beneficiários sincronizados com sucesso!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createMutation = trpc.beneficiaries.create.useMutation({
    onSuccess: () => {
      toast.success("Beneficiário criado com sucesso!");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const inactivateMutation = trpc.beneficiaries.inactivate.useMutation({
    onSuccess: () => {
      toast.success("Beneficiário inativado com sucesso!");
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
      cpf: formData.get('cpf') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      birthDate: formData.get('birthDate') as string,
      gender: formData.get('gender') as string,
    });
  };

  const handleView = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setIsViewOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os beneficiários cadastrados no sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Beneficiário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Novo Beneficiário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo beneficiário
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" name="name" placeholder="Nome completo" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" name="phone" placeholder="(00) 00000-0000" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input id="birthDate" name="birthDate" type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Input id="gender" name="gender" placeholder="Masculino, Feminino, Outro" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Criando...' : 'Criar Beneficiário'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Beneficiários</CardTitle>
            <CardDescription>
              {beneficiaries?.length || 0} beneficiários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : beneficiaries && beneficiaries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell className="font-medium">{beneficiary.name}</TableCell>
                      <TableCell>{beneficiary.cpf}</TableCell>
                      <TableCell>{beneficiary.email || '-'}</TableCell>
                      <TableCell>{beneficiary.phone || '-'}</TableCell>
                      <TableCell>
                        {beneficiary.active ? (
                          <Badge className="badge-success">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(beneficiary)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {beneficiary.active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Deseja realmente inativar este beneficiário?')) {
                                  inactivateMutation.mutate({ id: beneficiary.id });
                                }
                              }}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum beneficiário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Beneficiário</DialogTitle>
            </DialogHeader>
            {selectedBeneficiary && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <p className="font-medium">{selectedBeneficiary.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="font-medium">{selectedBeneficiary.cpf}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">E-mail</Label>
                    <p className="font-medium">{selectedBeneficiary.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{selectedBeneficiary.phone || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Data de Nascimento</Label>
                    <p className="font-medium">{selectedBeneficiary.birthDate || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Gênero</Label>
                    <p className="font-medium">{selectedBeneficiary.gender || '-'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {selectedBeneficiary.active ? (
                      <Badge className="badge-success">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Criado em</Label>
                    <p className="font-medium text-sm">
                      {new Date(selectedBeneficiary.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Atualizado em</Label>
                    <p className="font-medium text-sm">
                      {new Date(selectedBeneficiary.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
