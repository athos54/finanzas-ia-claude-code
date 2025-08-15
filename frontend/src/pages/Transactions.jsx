import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import FinancialSummary from '../components/FinancialSummary'
import { transactionsAPI } from '../utils/api'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
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
      const [transactionsResponse, statsResponse] = await Promise.all([
        transactionsAPI.getAll(),
        transactionsAPI.getStats()
      ])
      
      setTransactions(transactionsResponse.data.data)
      setStats(statsResponse.data.data)
    } catch (error) {
      setError('Error al cargar los datos')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar transacciones cuando cambia el filtro activo
  useEffect(() => {
    if (!activeFilter || activeFilter === 'balance') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(transaction => transaction.type === activeFilter))
    }
  }, [transactions, activeFilter])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  const handleCreateTransaction = async (transactionData) => {
    try {
      await transactionsAPI.create(transactionData)
      setShowForm(false)
      fetchData()
    } catch (error) {
      setError('Error al crear la transacción')
      console.error('Error creating transaction:', error)
    }
  }

  const handleUpdateTransaction = async (transactionData) => {
    try {
      await transactionsAPI.update(editingTransaction._id, transactionData)
      setEditingTransaction(null)
      setShowForm(false)
      fetchData()
    } catch (error) {
      setError('Error al actualizar la transacción')
      console.error('Error updating transaction:', error)
    }
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await transactionsAPI.delete(transactionId)
        fetchData()
      } catch (error) {
        setError('Error al eliminar la transacción')
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Finanzas</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Nueva Transacción
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <FinancialSummary 
          stats={stats} 
          loading={loading} 
          onFilterChange={handleFilterChange}
          activeFilter={activeFilter}
        />

        {activeFilter && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                Mostrando: {activeFilter === 'income' ? 'Solo Ingresos' : activeFilter === 'expense' ? 'Solo Gastos' : 'Todas las transacciones'}
                <span className="ml-2 text-blue-600">({filteredTransactions.length} transacciones)</span>
              </span>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar filtro ✕
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
              onCancel={handleCancel}
              initialData={editingTransaction || {}}
            />
          </div>
        )}

        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default Transactions