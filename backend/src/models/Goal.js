const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['saving', 'spending', 'income'],
    required: [true, 'El tipo de meta es obligatorio']
  },
  targetAmount: {
    type: Number,
    required: [true, 'El monto objetivo es obligatorio'],
    min: [0, 'El monto debe ser positivo']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'El monto actual debe ser positivo']
  },
  targetDate: {
    type: Date,
    required: [true, 'La fecha objetivo es obligatoria']
  },
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
goalSchema.index({ user: 1 });
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ targetDate: 1 });

// Virtual para calcular el progreso
goalSchema.virtual('progress').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual para calcular días restantes
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const target = new Date(this.targetDate);
  const timeDiff = target.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Asegurar que los virtuals se incluyan en JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);