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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    fetchData()
  }, [navigate])

  const fetchData = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true)
      const [transactionsResponse, statsResponse] = await Promise.all([
        transactionsAPI.getAll({ page, limit }),
        transactionsAPI.getStats()
      ])
      
      setTransactions(transactionsResponse.data.data)
      setPagination(transactionsResponse.data.pagination)
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchData(newPage, pagination.limit)
    }
  }

  const handleLimitChange = (newLimit) => {
    fetchData(1, newLimit)
  }

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

        {/* Controles de paginación */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-md">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.total}</span> transacciones
                </p>
                
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
              
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          pageNum === pagination.page
                            ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions