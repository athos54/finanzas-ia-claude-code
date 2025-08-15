import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { goalsAPI, budgetsAPI } from '../utils/api'

const Goals = () => {
  const [activeTab, setActiveTab] = useState('goals')
  const [goals, setGoals] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goalsStats, setGoalsStats] = useState({})
  const [budgetsStats, setBudgetsStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [editingBudget, setEditingBudget] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [goalsResponse, budgetsResponse, goalsStatsResponse, budgetsStatsResponse] = await Promise.all([
        goalsAPI.getAll(),
        budgetsAPI.getAll(),
        goalsAPI.getStats(),
        budgetsAPI.getStats()
      ])
      
      setGoals(goalsResponse.data.data)
      setBudgets(budgetsResponse.data.data)
      setGoalsStats(goalsStatsResponse.data.data)
      setBudgetsStats(budgetsStatsResponse.data.data)
    } catch (error) {
      setError('Error al cargar los datos')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'exceeded':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activa'
      case 'completed':
        return 'Completada'
      case 'paused':
        return 'Pausada'
      case 'cancelled':
        return 'Cancelada'
      case 'exceeded':
        return 'Excedido'
      case 'inactive':
        return 'Inactivo'
      default:
        return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
      try {
        await goalsAPI.delete(goalId)
        fetchData()
      } catch (error) {
        setError('Error al eliminar la meta')
        console.error('Error deleting goal:', error)
      }
    }
  }

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await budgetsAPI.delete(budgetId)
        fetchData()
      } catch (error) {
        setError('Error al eliminar el presupuesto')
        console.error('Error deleting budget:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
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
                  🎯 Metas y Presupuestos
                </h1>
                <p className="text-gray-600 mt-2">Planifica y controla tus objetivos financieros</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('goals')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'goals'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🎯 Metas ({goals.length})
              </button>
              <button
                onClick={() => setActiveTab('budgets')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'budgets'
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Presupuestos ({budgets.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'goals' ? (
                <div>
                  {/* Goals Stats */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-blue-100 text-sm">Total Metas</p>
                        <p className="text-xl font-bold">{goalsStats.total || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-green-100 text-sm">Completadas</p>
                        <p className="text-xl font-bold">{goalsStats.completed || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-yellow-100 text-sm">Activas</p>
                        <p className="text-xl font-bold">{goalsStats.active || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-purple-100 text-sm">Progreso Promedio</p>
                        <p className="text-xl font-bold">{Math.round(goalsStats.averageProgress || 0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Goals Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mis Metas</h2>
                    <button
                      onClick={() => setShowGoalForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      + Nueva Meta
                    </button>
                  </div>

                  {/* Goals List */}
                  {goals.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goals.map(goal => (
                        <div key={goal._id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                              <p className="text-sm text-gray-500">{goal.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {getStatusText(goal.status)}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progreso</span>
                              <span>{Math.round(goal.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(goal.progress, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Actual:</span>
                              <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Objetivo:</span>
                              <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fecha límite:</span>
                              <span className="font-medium">{formatDate(goal.targetDate)}</span>
                            </div>
                            {goal.daysRemaining !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Días restantes:</span>
                                <span className={`font-medium ${goal.daysRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {goal.daysRemaining < 0 ? 'Vencida' : `${goal.daysRemaining} días`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <span className={`text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                              Prioridad: {goal.priority}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingGoal(goal)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal._id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes metas aún</h3>
                      <p className="text-gray-500 mb-4">Crea tu primera meta para empezar a planificar tu futuro financiero</p>
                      <button
                        onClick={() => setShowGoalForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Crear Primera Meta
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Budgets Stats */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-purple-100 text-sm">Total Presupuestos</p>
                        <p className="text-xl font-bold">{budgetsStats.total || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-green-100 text-sm">Activos</p>
                        <p className="text-xl font-bold">{budgetsStats.active || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-red-100 text-sm">Excedidos</p>
                        <p className="text-xl font-bold">{budgetsStats.exceeded || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-4 text-white">
                      <div className="text-center">
                        <p className="text-yellow-100 text-sm">Uso Promedio</p>
                        <p className="text-xl font-bold">{Math.round(budgetsStats.averageUsage || 0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Budgets Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mis Presupuestos</h2>
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      + Nuevo Presupuesto
                    </button>
                  </div>

                  {/* Budgets List */}
                  {budgets.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {budgets.map(budget => (
                        <div key={budget._id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                              <p className="text-sm text-gray-500">{budget.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                              {getStatusText(budget.status)}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Usado</span>
                              <span>{Math.round(budget.usagePercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  budget.usagePercentage > 100 ? 'bg-red-500' : 
                                  budget.usagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gastado:</span>
                              <span className="font-medium">{formatCurrency(budget.spentAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Límite:</span>
                              <span className="font-medium">{formatCurrency(budget.limitAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Restante:</span>
                              <span className={`font-medium ${budget.remainingAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(budget.remainingAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Período:</span>
                              <span className="font-medium">{budget.period}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <span className="text-xs text-gray-500">
                              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingBudget(budget)}
                                className="text-purple-600 hover:text-purple-800 text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteBudget(budget._id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes presupuestos aún</h3>
                      <p className="text-gray-500 mb-4">Crea tu primer presupuesto para controlar tus gastos</p>
                      <button
                        onClick={() => setShowBudgetForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Crear Primer Presupuesto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Goals