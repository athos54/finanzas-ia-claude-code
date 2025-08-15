const express = require('express');
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsStats
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// @route   GET /api/goals/stats
// @desc    Obtener estadísticas de metas
// @access  Private
router.get('/stats', getGoalsStats);

// @route   GET /api/goals
// @desc    Obtener todas las metas del usuario
// @access  Private
router.get('/', getGoals);

// @route   GET /api/goals/:id
// @desc    Obtener meta específica
// @access  Private
router.get('/:id', getGoalById);

// @route   POST /api/goals
// @desc    Crear nueva meta
// @access  Private
router.post('/', createGoal);

// @route   PUT /api/goals/:id
// @desc    Actualizar meta
// @access  Private
router.put('/:id', updateGoal);

// @route   PUT /api/goals/:id/progress
// @desc    Actualizar progreso de meta
// @access  Private
router.put('/:id/progress', updateGoalProgress);

// @route   DELETE /api/goals/:id
// @desc    Eliminar meta
// @access  Private
router.delete('/:id', deleteGoal);

module.exports = router;