import { useState, useEffect } from 'react'
import { Search, Filter, UserPlus, Download, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setBeneficiaries([
        {
          id: '1',
          name: 'João Silva',
          cpf: '123.456.789-00',
          email: 'joao.silva@email.com',
          phone: '(11) 98765-4321',
          plan: 'Clínico 24h',
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Maria Santos',
          cpf: '987.654.321-00',
          email: 'maria.santos@email.com',
          phone: '(11) 91234-5678',
          plan: 'Completo',
          status: 'active',
          createdAt: '2024-02-20'
        },
        {
          id: '3',
          name: 'Pedro Oliveira',
          cpf: '456.789.123-00',
          email: 'pedro.oliveira@email.com',
          phone: '(11) 99876-5432',
          plan: 'Clínico + Psicologia',
          status: 'inactive',
          createdAt: '2024-03-10'
        },
        {
          id: '4',
          name: 'Ana Costa',
          cpf: '321.654.987-00',
          email: 'ana.costa@email.com',
          phone: '(11) 97654-3210',
          plan: 'Clínico + Especialistas',
          status: 'active',
          createdAt: '2024-01-25'
        },
        {
          id: '5',
          name: 'Carlos Mendes',
          cpf: '789.123.456-00',
          email: 'carlos.mendes@email.com',
          phone: '(11) 96543-2109',
          plan: 'Clínico 24h',
          status: 'pending',
          createdAt: '2024-04-05'
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    const matchesSearch = 
      beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.cpf.includes(searchTerm) ||
      beneficiary.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || beneficiary.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4DB]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beneficiários</h1>
          <p className="text-gray-600 mt-1">Gerenciar beneficiários do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
          <Button className="gap-2 bg-[#00B4DB] hover:bg-[#0083B0]">
            <UserPlus size={16} />
            Novo Beneficiário
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Beneficiários</CardTitle>
          <CardDescription>
            {filteredBeneficiaries.length} beneficiário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum beneficiário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBeneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{beneficiary.name}</TableCell>
                      <TableCell>{beneficiary.cpf}</TableCell>
                      <TableCell>{beneficiary.email}</TableCell>
                      <TableCell>{beneficiary.phone}</TableCell>
                      <TableCell>{beneficiary.plan}</TableCell>
                      <TableCell>{getStatusBadge(beneficiary.status)}</TableCell>
                      <TableCell>{new Date(beneficiary.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

