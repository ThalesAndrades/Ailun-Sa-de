import { useEffect, useState } from 'react'
import { Users, Package, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    activePlans: 0,
    totalConsultations: 0,
    revenueThisMonth: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalBeneficiaries: 1247,
        activePlans: 892,
        totalConsultations: 3456,
        revenueThisMonth: 125000
      })
      setLoading(false)
    }, 1000)
  }, [])

  const consultationsData = [
    { month: 'Jan', consultas: 245 },
    { month: 'Fev', consultas: 312 },
    { month: 'Mar', consultas: 289 },
    { month: 'Abr', consultas: 401 },
    { month: 'Mai', consultas: 378 },
    { month: 'Jun', consultas: 425 },
  ]

  const plansDistribution = [
    { name: 'Clínico 24h', value: 320 },
    { name: 'Clínico + Psicologia', value: 245 },
    { name: 'Clínico + Especialistas', value: 189 },
    { name: 'Completo', value: 138 },
  ]

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema AiLun Saude</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Beneficiários"
          value={stats.totalBeneficiaries.toLocaleString('pt-BR')}
          icon={Users}
          trend="+12% vs mês anterior"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Planos Ativos"
          value={stats.activePlans.toLocaleString('pt-BR')}
          icon={Package}
          trend="+8% vs mês anterior"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Consultas Realizadas"
          value={stats.totalConsultations.toLocaleString('pt-BR')}
          icon={Activity}
          trend="+15% vs mês anterior"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(stats.revenueThisMonth / 1000).toFixed(0)}k`}
          icon={TrendingUp}
          trend="+10% vs mês anterior"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
            <CardDescription>Evolução das consultas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consultationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="consultas" 
                  stroke="#00B4DB" 
                  strokeWidth={2}
                  dot={{ fill: '#00B4DB', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>Planos ativos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={plansDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00B4DB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">15 pagamentos pendentes</p>
                <p className="text-sm text-gray-600">Beneficiários com pagamentos vencidos nos últimos 7 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">8 novos cadastros hoje</p>
                <p className="text-sm text-gray-600">Beneficiários aguardando aprovação de plano</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

