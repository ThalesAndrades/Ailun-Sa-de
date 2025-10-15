import { useState, useEffect } from 'react'
import { Calendar, Clock, User, FileText, Filter, Download } from 'lucide-react'
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

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setConsultations([
        {
          id: '1',
          patient: 'João Silva',
          doctor: 'Dr. Carlos Mendes',
          specialty: 'Clínico Geral',
          type: 'clinical',
          date: '2024-04-15',
          time: '14:30',
          status: 'completed',
          duration: '30 min'
        },
        {
          id: '2',
          patient: 'Maria Santos',
          doctor: 'Dra. Ana Costa',
          specialty: 'Psicologia',
          type: 'psychology',
          date: '2024-04-15',
          time: '15:00',
          status: 'completed',
          duration: '45 min'
        },
        {
          id: '3',
          patient: 'Pedro Oliveira',
          doctor: 'Dr. Roberto Lima',
          specialty: 'Cardiologia',
          type: 'specialist',
          date: '2024-04-16',
          time: '10:00',
          status: 'scheduled',
          duration: '40 min'
        },
        {
          id: '4',
          patient: 'Ana Costa',
          doctor: 'Dr. Fernando Silva',
          specialty: 'Clínico Geral',
          type: 'clinical',
          date: '2024-04-16',
          time: '11:30',
          status: 'scheduled',
          duration: '30 min'
        },
        {
          id: '5',
          patient: 'Carlos Mendes',
          doctor: 'Dra. Patricia Souza',
          specialty: 'Dermatologia',
          type: 'specialist',
          date: '2024-04-14',
          time: '16:00',
          status: 'cancelled',
          duration: '30 min'
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter
    const matchesType = typeFilter === 'all' || consultation.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800'
    }

    const labels = {
      completed: 'Concluída',
      scheduled: 'Agendada',
      cancelled: 'Cancelada',
      in_progress: 'Em Andamento'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const styles = {
      clinical: 'bg-purple-100 text-purple-800',
      specialist: 'bg-orange-100 text-orange-800',
      psychology: 'bg-pink-100 text-pink-800',
      nutrition: 'bg-teal-100 text-teal-800'
    }

    const labels = {
      clinical: 'Clínico',
      specialist: 'Especialista',
      psychology: 'Psicologia',
      nutrition: 'Nutrição'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
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

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    scheduled: consultations.filter(c => c.status === 'scheduled').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
          <p className="text-gray-600 mt-1">Gerenciar consultas e agendamentos</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Exportar Relatório
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Consultas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Canceladas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por paciente, médico ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="clinical">Clínico</SelectItem>
                <SelectItem value="specialist">Especialista</SelectItem>
                <SelectItem value="psychology">Psicologia</SelectItem>
                <SelectItem value="nutrition">Nutrição</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Consultas</CardTitle>
          <CardDescription>
            {filteredConsultations.length} consulta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma consulta encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <TableRow key={consultation.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{consultation.patient}</TableCell>
                      <TableCell>{consultation.doctor}</TableCell>
                      <TableCell>{consultation.specialty}</TableCell>
                      <TableCell>{getTypeBadge(consultation.type)}</TableCell>
                      <TableCell>{new Date(consultation.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{consultation.time}</TableCell>
                      <TableCell>{consultation.duration}</TableCell>
                      <TableCell>{getStatusBadge(consultation.status)}</TableCell>
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

