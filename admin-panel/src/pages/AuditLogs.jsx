import { useState, useEffect } from 'react'
import { Search, Filter, Download, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = () => {
    setLoading(true)
    // Simular carregamento de dados
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          eventType: 'user_login',
          userEmail: 'admin@ailun.com.br',
          status: 'success',
          timestamp: '2024-04-15T14:30:00',
          ipAddress: '192.168.1.100',
          details: 'Login bem-sucedido via web'
        },
        {
          id: '2',
          eventType: 'beneficiary_created',
          userEmail: 'admin@ailun.com.br',
          status: 'success',
          timestamp: '2024-04-15T14:35:00',
          ipAddress: '192.168.1.100',
          details: 'Novo beneficiário: João Silva (CPF: 123.456.789-00)'
        },
        {
          id: '3',
          eventType: 'plan_updated',
          userEmail: 'admin@ailun.com.br',
          status: 'success',
          timestamp: '2024-04-15T14:40:00',
          ipAddress: '192.168.1.100',
          details: 'Plano atualizado: Clínico 24h - Preço alterado'
        },
        {
          id: '4',
          eventType: 'payment_processed',
          userEmail: 'system@ailun.com.br',
          status: 'success',
          timestamp: '2024-04-15T15:00:00',
          ipAddress: 'webhook',
          details: 'Pagamento confirmado - R$ 49,90'
        },
        {
          id: '5',
          eventType: 'consultation_scheduled',
          userEmail: 'maria.santos@email.com',
          status: 'success',
          timestamp: '2024-04-15T15:15:00',
          ipAddress: '192.168.1.105',
          details: 'Consulta agendada com Dr. Carlos Mendes'
        },
        {
          id: '6',
          eventType: 'user_login',
          userEmail: 'pedro.oliveira@email.com',
          status: 'failure',
          timestamp: '2024-04-15T15:20:00',
          ipAddress: '192.168.1.110',
          details: 'Falha no login: Senha incorreta'
        },
        {
          id: '7',
          eventType: 'beneficiary_updated',
          userEmail: 'admin@ailun.com.br',
          status: 'success',
          timestamp: '2024-04-15T15:30:00',
          ipAddress: '192.168.1.100',
          details: 'Dados do beneficiário atualizados: Ana Costa'
        },
        {
          id: '8',
          eventType: 'plan_cancelled',
          userEmail: 'carlos.mendes@email.com',
          status: 'pending',
          timestamp: '2024-04-15T15:45:00',
          ipAddress: '192.168.1.115',
          details: 'Solicitação de cancelamento de plano'
        },
      ])
      setLoading(false)
    }, 1000)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEventType = eventTypeFilter === 'all' || log.eventType === eventTypeFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter

    return matchesSearch && matchesEventType && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failure: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    const labels = {
      success: 'Sucesso',
      failure: 'Falha',
      pending: 'Pendente'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getEventTypeLabel = (eventType) => {
    const labels = {
      user_login: 'Login de Usuário',
      user_logout: 'Logout de Usuário',
      beneficiary_created: 'Beneficiário Criado',
      beneficiary_updated: 'Beneficiário Atualizado',
      beneficiary_deleted: 'Beneficiário Excluído',
      plan_created: 'Plano Criado',
      plan_updated: 'Plano Atualizado',
      plan_cancelled: 'Plano Cancelado',
      payment_processed: 'Pagamento Processado',
      consultation_scheduled: 'Consulta Agendada',
      consultation_completed: 'Consulta Concluída',
      consultation_cancelled: 'Consulta Cancelada'
    }

    return labels[eventType] || eventType.replace(/_/g, ' ').toUpperCase()
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4DB]"></div>
      </div>
    )
  }

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failure: logs.filter(l => l.status === 'failure').length,
    pending: logs.filter(l => l.status === 'pending').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600 mt-1">Monitorar eventos e atividades do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={loadLogs}>
            <RefreshCw size={16} />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bem-sucedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Falhas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.failure}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por evento, usuário ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Tipo de Evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eventos</SelectItem>
                <SelectItem value="user_login">Login de Usuário</SelectItem>
                <SelectItem value="beneficiary_created">Beneficiário Criado</SelectItem>
                <SelectItem value="plan_updated">Plano Atualizado</SelectItem>
                <SelectItem value="payment_processed">Pagamento Processado</SelectItem>
                <SelectItem value="consultation_scheduled">Consulta Agendada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>
            {filteredLogs.length} evento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum log de auditoria encontrado</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {getEventTypeLabel(log.eventType)}
                        </h4>
                        {getStatusBadge(log.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span>Usuário: {log.userEmail}</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

