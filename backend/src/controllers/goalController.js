const Goal = require('../models/Goal');

// Obtener todas las metas del usuario
const getGoals = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const filter = { user: req.user._id };
    
    if (status && ['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      filter.status = status;
    }
    
    if (type && ['saving', 'spending', 'income'].includes(type)) {
      filter.type = type;
    }
    
    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener una meta específica
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Crear nueva meta
const createGoal = async (req, res) => {
  try {
    const { title, description, type, targetAmount, targetDate, category, priority } = req.body;
    
    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      type,
      targetAmount,
      targetDate,
      category,
      priority
    });
    
    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar meta
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar progreso de meta
const updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número positivo'
      });
    }
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta no encontrada'
      });
    }
    
    goal.currentAmount = amount;
    
    // Auto-completar la meta si se alcanza el objetivo
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar meta
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Meta eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas de metas
const getGoalsStats = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      cancelled: goals.filter(g => g.status === 'cancelled').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress: goals.length > 0 ? 
        goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsStats
};