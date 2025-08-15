import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { healthCheck, transactionsAPI } from '../utils/api'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [serverStatus, setServerStatus] = useState('checking')
  const [stats, setStats] = useState({})
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      navigate('/login')
      return
    }
    
    setUser(JSON.parse(userData))
    
    const fetchData = async () => {
      try {
        const [healthResponse, statsResponse, transactionsResponse] = await Promise.all([
          healthCheck(),
          transactionsAPI.getStats(),
          transactionsAPI.getAll({ limit: 5 })
        ])
        
        setServerStatus('online')
        setStats(statsResponse.data.data)
        setRecentTransactions(transactionsResponse.data.data)
      } catch (error) {
        setServerStatus('offline')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [navigate])


  if (!user) {
    return <div>Cargando...</div>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ¡Bienvenido, {user.name}!
                </h1>
                <p className="text-gray-600 mt-2">¡Controla tus finanzas de manera inteligente!</p>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  serverStatus === 'online' ? 'bg-green-500' : 
                  serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {serverStatus === 'online' ? 'Sistema conectado' : 
                   serverStatus === 'offline' ? 'Sistema desconectado' : 'Verificando...'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Ingresos</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : formatCurrency(stats.income || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Gastos</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : formatCurrency(stats.expense || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📉</span>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${(stats.balance || 0) >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} rounded-2xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Balance Total</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : formatCurrency(stats.balance || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions & Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transacciones Recientes</h2>
                <Link 
                  to="/transactions" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todas →
                </Link>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map(transaction => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          <span className="text-sm font-medium">
                            {transaction.type === 'income' ? '+' : '-'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay transacciones recientes</p>
                  <Link 
                    to="/transactions" 
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Crear tu primera transacción →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              
              <div className="space-y-4">
                <Link 
                  to="/transactions" 
                  className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestionar Transacciones</h3>
                    <p className="text-blue-100 text-sm">Ver, crear y editar tus movimientos financieros</p>
                  </div>
                </Link>

                <div className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl opacity-50 cursor-not-allowed">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Reportes y Análisis</h3>
                    <p className="text-purple-100 text-sm">Próximamente - Análisis detallado de tus finanzas</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl opacity-50 cursor-not-allowed">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Metas y Presupuestos</h3>
                    <p className="text-green-100 text-sm">Próximamente - Define metas y controla presupuestos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard