const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Obtener todos los presupuestos del usuario
const getBudgets = async (req, res) => {
  try {
    const { status, category, period } = req.query;
    
    const filter = { user: req.user._id };
    
    if (status && ['active', 'inactive', 'exceeded'].includes(status)) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (period && ['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      filter.period = period;
    }
    
    const budgets = await Budget.find(filter)
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({
      success: true,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener un presupuesto específico
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Crear nuevo presupuesto
const createBudget = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      limitAmount, 
      period, 
      startDate, 
      endDate, 
      alertThreshold 
    } = req.body;
    
    const budget = await Budget.create({
      user: req.user._id,
      name,
      description,
      category,
      limitAmount,
      period,
      startDate,
      endDate,
      alertThreshold
    });
    
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar presupuesto
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar presupuesto
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar gasto de presupuesto (se llamará automáticamente cuando se creen transacciones)
const updateBudgetSpending = async (userId, category, amount, transactionDate) => {
  try {
    const budgets = await Budget.find({
      user: userId,
      category: category,
      status: 'active',
      startDate: { $lte: transactionDate },
      endDate: { $gte: transactionDate }
    });
    
    for (const budget of budgets) {
      budget.spentAmount += amount;
      
      // Actualizar estado si se excede
      if (budget.spentAmount > budget.limitAmount) {
        budget.status = 'exceeded';
      }
      
      await budget.save();
    }
  } catch (error) {
    console.error('Error actualizando gastos del presupuesto:', error);
  }
};

// Recalcular gastos de presupuesto basado en transacciones reales
const recalculateBudgetSpending = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // Calcular gastos reales desde las transacciones
    const transactions = await Transaction.find({
      user: req.user._id,
      category: budget.category,
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate
      }
    });
    
    const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    budget.spentAmount = totalSpent;
    
    // Actualizar estado
    if (budget.spentAmount > budget.limitAmount) {
      budget.status = 'exceeded';
    } else {
      budget.status = 'active';
    }
    
    await budget.save();
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas de presupuestos
const getBudgetsStats = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    
    const stats = {
      total: budgets.length,
      active: budgets.filter(b => b.status === 'active').length,
      exceeded: budgets.filter(b => b.status === 'exceeded').length,
      inactive: budgets.filter(b => b.status === 'inactive').length,
      totalLimitAmount: budgets.reduce((sum, b) => sum + b.limitAmount, 0),
      totalSpentAmount: budgets.reduce((sum, b) => sum + b.spentAmount, 0),
      averageUsage: budgets.length > 0 ? 
        budgets.reduce((sum, b) => sum + b.usagePercentage, 0) / budgets.length : 0,
      inAlert: budgets.filter(b => b.isInAlert).length
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
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  updateBudgetSpending,
  recalculateBudgetSpending,
  getBudgetsStats
};