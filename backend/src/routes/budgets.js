const express = require('express');
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  recalculateBudgetSpending,
  getBudgetsStats
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// @route   GET /api/budgets/stats
// @desc    Obtener estadísticas de presupuestos
// @access  Private
router.get('/stats', getBudgetsStats);

// @route   GET /api/budgets
// @desc    Obtener todos los presupuestos del usuario
// @access  Private
router.get('/', getBudgets);

// @route   GET /api/budgets/:id
// @desc    Obtener presupuesto específico
// @access  Private
router.get('/:id', getBudgetById);

// @route   POST /api/budgets
// @desc    Crear nuevo presupuesto
// @access  Private
router.post('/', createBudget);

// @route   PUT /api/budgets/:id
// @desc    Actualizar presupuesto
// @access  Private
router.put('/:id', updateBudget);

// @route   PUT /api/budgets/:id/recalculate
// @desc    Recalcular gastos del presupuesto
// @access  Private
router.put('/:id/recalculate', recalculateBudgetSpending);

// @route   DELETE /api/budgets/:id
// @desc    Eliminar presupuesto
// @access  Private
router.delete('/:id', deleteBudget);

module.exports = router;