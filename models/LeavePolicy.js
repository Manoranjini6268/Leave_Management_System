const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide policy name'],
    trim: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'medical', 'earned', 'unpaid'],
    required: true
  },
  annualQuota: {
    type: Number,
    required: [true, 'Please provide annual quota'],
    min: 0
  },
  maxConsecutiveDays: {
    type: Number,
    default: null
  },
  carryForward: {
    allowed: { type: Boolean, default: false },
    maxDays: { type: Number, default: 0 }
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  minimumNotice: {
    type: Number,
    default: 0,
    comment: 'Days of notice required before leave start date'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

leavePolicySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
