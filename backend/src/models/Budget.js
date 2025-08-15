const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del presupuesto es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },
  limitAmount: {
    type: Number,
    required: [true, 'El límite del presupuesto es obligatorio'],
    min: [0, 'El límite debe ser positivo']
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: [0, 'El monto gastado debe ser positivo']
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'exceeded'],
    default: 'active'
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: [0, 'El umbral de alerta debe ser positivo'],
    max: [100, 'El umbral de alerta no puede ser mayor a 100']
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
budgetSchema.index({ user: 1 });
budgetSchema.index({ user: 1, status: 1 });
budgetSchema.index({ category: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });

// Virtual para calcular el porcentaje usado
budgetSchema.virtual('usagePercentage').get(function() {
  if (this.limitAmount === 0) return 0;
  return Math.min((this.spentAmount / this.limitAmount) * 100, 100);
});

// Virtual para calcular el monto restante
budgetSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.limitAmount - this.spentAmount, 0);
});

// Virtual para verificar si está en alerta
budgetSchema.virtual('isInAlert').get(function() {
  return this.usagePercentage >= this.alertThreshold;
});

// Virtual para verificar si está excedido
budgetSchema.virtual('isExceeded').get(function() {
  return this.spentAmount > this.limitAmount;
});

// Virtual para calcular días restantes en el período
budgetSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const timeDiff = end.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(daysDiff, 0);
});

// Asegurar que los virtuals se incluyan en JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);