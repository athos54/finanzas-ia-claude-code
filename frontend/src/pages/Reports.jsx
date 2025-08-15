import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionsAPI } from '../utils/api'

const Reports = () => {
  const [stats, setStats] = useState({})
  const [categoryStats, setCategoryStats] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    fetchReportData()
  }, [navigate])

  const fetchReportData = async (filters = {}) => {
    try {
      setLoading(true)
      const [statsResponse, transactionsResponse] = await Promise.all([
        transactionsAPI.getStats(filters),
        transactionsAPI.getAll({ ...filters, limit: 1000 })
      ])
      
      setStats(statsResponse.data.data)
      
      // Procesar datos por categorías
      const transactions = transactionsResponse.data.data
      const categoryBreakdown = processTransactionsByCategory(transactions)
      setCategoryStats(categoryBreakdown)
      
      // Procesar datos mensuales
      const monthlyBreakdown = processTransactionsByMonth(transactions)
      setMonthlyData(monthlyBreakdown)
      
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTransactionsByCategory = (transactions) => {
    const categories = {}
    
    transactions.forEach(transaction => {
      const { category, type, amount } = transaction
      if (!categories[category]) {
        categories[category] = { income: 0, expense: 0, total: 0 }
      }
      
      categories[category][type] += amount
      categories[category].total += type === 'income' ? amount : -amount
    })
    
    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
  }

  const processTransactionsByMonth = (transactions) => {
    const months = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0, balance: 0 }
      }
      
      months[monthKey][transaction.type] += transaction.amount
    })
    
    // Calcular balance y ordenar
    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Últimos 6 meses
  }

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target
    const newFilter = { ...dateFilter, [name]: value }
    setDateFilter(newFilter)
    
    // Aplicar filtro si ambas fechas están completas
    if (newFilter.startDate && newFilter.endDate) {
      fetchReportData(newFilter)
    } else if (!newFilter.startDate && !newFilter.endDate) {
      fetchReportData()
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    return new Date(year, month - 1).toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getPercentage = (value, total) => {
    if (total === 0) return 0
    return ((Math.abs(value) / Math.abs(total)) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  📊 Reportes y Análisis
                </h1>
                <p className="text-gray-600 mt-2">Análisis detallado de tus finanzas</p>
              </div>
              
              {/* Filtros de fecha */}
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateFilter.startDate}
                    onChange={handleDateFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateFilter.endDate}
                    onChange={handleDateFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Financial */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Ingresos</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.income || 0)}</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(stats.expense || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📉</span>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${(stats.balance || 0) >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} rounded-2xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Balance Neto</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.balance || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Análisis por Categorías y Tendencia Mensual */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Análisis por Categorías */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Análisis por Categorías</h2>
              
              {categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {categoryStats.map((category, index) => (
                    <div key={category.category} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{category.category}</h3>
                        <span className={`text-sm font-medium ${
                          category.total >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(category.total)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-green-600">+ Ingresos:</span>
                          <span className="font-medium">{formatCurrency(category.income)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-red-600">- Gastos:</span>
                          <span className="font-medium">{formatCurrency(category.expense)}</span>
                        </div>
                      </div>
                      
                      {/* Barra de progreso visual */}
                      <div className="mt-3 flex h-2 bg-gray-200 rounded-full overflow-hidden">
                        {category.income > 0 && (
                          <div 
                            className="bg-green-500" 
                            style={{ 
                              width: `${getPercentage(category.income, category.income + category.expense)}%` 
                            }}
                          ></div>
                        )}
                        {category.expense > 0 && (
                          <div 
                            className="bg-red-500" 
                            style={{ 
                              width: `${getPercentage(category.expense, category.income + category.expense)}%` 
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
              )}
            </div>

            {/* Tendencia Mensual */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Tendencia Mensual (Últimos 6 meses)</h2>
              
              {monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {formatMonth(month.month)}
                        </h3>
                        <span className={`text-sm font-medium ${
                          month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(month.balance)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-green-600">Ingresos:</span>
                          <span className="font-medium">{formatCurrency(month.income)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-red-600">Gastos:</span>
                          <span className="font-medium">{formatCurrency(month.expense)}</span>
                        </div>
                      </div>
                      
                      {/* Barra de progreso del balance */}
                      <div className="mt-3">
                        <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`${month.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ 
                              width: `${Math.abs(month.balance) / Math.max(...monthlyData.map(m => Math.abs(m.balance))) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports