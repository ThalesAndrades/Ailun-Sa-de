import { useState, useEffect } from 'react'
import { Package, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          name: 'Clínico 24h',
          serviceType: 'G',
          price: 49.90,
          features: {
            clinical: true,
            specialists: false,
            psychology: false,
            nutrition: false
          },
          activeSubscriptions: 320,
          description: 'Acesso ilimitado a médicos generalistas 24/7'
        },
        {
          id: '2',
          name: 'Clínico + Psicologia',
          serviceType: 'GP',
          price: 89.90,
          features: {
            clinical: true,
            specialists: false,
            psychology: true,
            nutrition: false
          },
          activeSubscriptions: 245,
          description: 'Médicos generalistas + 2 consultas de psicologia por mês'
        },
        {
          id: '3',
          name: 'Clínico + Especialistas',
          serviceType: 'GS',
          price: 79.90,
          features: {
            clinical: true,
            specialists: true,
            psychology: false,
            nutrition: false
          },
          activeSubscriptions: 189,
          description: 'Médicos generalistas + acesso a especialistas'
        },
        {
          id: '4',
          name: 'Completo',
          serviceType: 'GSP',
          price: 119.90,
          features: {
            clinical: true,
            specialists: true,
            psychology: true,
            nutrition: false
          },
          activeSubscriptions: 138,
          description: 'Acesso completo a todos os serviços'
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const FeatureIcon = ({ included }) => (
    included ? (
      <Check className="h-5 w-5 text-green-600" />
    ) : (
      <X className="h-5 w-5 text-gray-300" />
    )
  )

  const PlanCard = ({ plan }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-[#00B4DB]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="mt-2">{plan.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preço */}
        <div className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Valor Mensal</div>
          <div className="text-3xl font-bold mt-1">
            R$ {plan.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Recursos */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Recursos Inclusos:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FeatureIcon included={plan.features.clinical} />
              <span className="text-sm">Médico Clínico 24h</span>
            </div>
            <div className="flex items-center gap-3">
              <FeatureIcon included={plan.features.specialists} />
              <span className="text-sm">Especialistas</span>
            </div>
            <div className="flex items-center gap-3">
              <FeatureIcon included={plan.features.psychology} />
              <span className="text-sm">Psicologia</span>
            </div>
            <div className="flex items-center gap-3">
              <FeatureIcon included={plan.features.nutrition} />
              <span className="text-sm">Nutrição</span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assinaturas Ativas</span>
            <span className="font-semibold text-gray-900">{plan.activeSubscriptions}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Receita Mensal</span>
            <span className="font-semibold text-green-600">
              R$ {(plan.activeSubscriptions * plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
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

  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.activeSubscriptions * plan.price), 0)
  const totalSubscriptions = plans.reduce((sum, plan) => sum + plan.activeSubscriptions, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura</h1>
          <p className="text-gray-600 mt-1">Gerenciar planos e preços</p>
        </div>
        <Button className="gap-2 bg-[#00B4DB] hover:bg-[#0083B0]">
          <Plus size={16} />
          Novo Plano
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Planos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assinaturas Ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receita Mensal Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}

