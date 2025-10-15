import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Users, FileText, Package, Activity, Home, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { useState } from 'react'
import './App.css'

// Páginas
import Dashboard from './pages/Dashboard'
import BeneficiariesPage from './pages/Beneficiaries'
import PlansPage from './pages/Plans'
import AuditLogsPage from './pages/AuditLogs'
import ConsultationsPage from './pages/Consultations'

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/beneficiaries', icon: Users, label: 'Beneficiários' },
    { path: '/plans', icon: Package, label: 'Planos' },
    { path: '/consultations', icon: Activity, label: 'Consultas' },
    { path: '/audit-logs', icon: FileText, label: 'Logs de Auditoria' },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#00B4DB] to-[#0083B0]
        text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">AiLun Saude</h1>
                <p className="text-sm text-white/80 mt-1">Painel Administrativo</p>
              </div>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-[#00B4DB] shadow-lg' 
                      : 'hover:bg-white/10 text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <p className="text-xs text-white/60 text-center">
              © 2025 AiLun Tecnologia
              <br />
              CNPJ: 60.740.536/0001-75
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">AiLun Saude</h2>
            <div className="w-10" /> {/* Spacer para centralizar o título */}
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/beneficiaries" element={<BeneficiariesPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App

