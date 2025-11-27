import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Specialties() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: specialties, isLoading, refetch } = trpc.specialties.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const syncMutation = trpc.specialties.sync.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.synced} especialidades sincronizadas com sucesso!`);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Especialidades</h1>
            <p className="text-muted-foreground mt-2">
              Consulte as especialidades médicas disponíveis
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{specialties?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Especialidades cadastradas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {specialties?.filter(s => s.available).length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prontas para agendamento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indisponíveis</CardTitle>
              <Activity className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {specialties?.filter(s => !s.available).length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Temporariamente indisponíveis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Especialidades</CardTitle>
            <CardDescription>
              {specialties?.length || 0} especialidades cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : specialties && specialties.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialties.map((specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className="font-medium">{specialty.name}</TableCell>
                      <TableCell>{specialty.description || '-'}</TableCell>
                      <TableCell>
                        {specialty.available ? (
                          <Badge className="badge-success">Disponível</Badge>
                        ) : (
                          <Badge variant="secondary">Indisponível</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(specialty.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma especialidade encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique em "Sincronizar" para buscar especialidades da API Rapidoc
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
