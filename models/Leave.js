const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'medical', 'earned', 'unpaid'],
    required: [true, 'Please specify leave type']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for leave'],
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  documents: [{
    filename: String,
    url: String
  }]
});

// Recalculate number of days only when dates change (avoids redundant work on status updates)
leaveSchema.pre('save', function(next) {
  if ((this.isNew || this.isModified('startDate') || this.isModified('endDate')) &&
      this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end   = new Date(this.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(end - start);
    this.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
