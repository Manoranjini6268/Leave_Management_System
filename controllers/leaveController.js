const Leave = require('../models/Leave');
const User = require('../models/User');
const moment = require('moment');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot apply for past dates' });
    }

    // Calculate number of days
    const diffTime = Math.abs(end - start);
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const user = await User.findById(req.user.id);
    if (leaveType !== 'unpaid' && user.leaveBalances[leaveType] < numberOfDays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalances[leaveType]} days` 
      });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employee: req.user.id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have an overlapping leave request' 
      });
    }

    // Create leave request
    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason
    });

    const populatedLeave = await Leave.findById(leave._id).populate('employee', 'firstName lastName employeeId email');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populatedLeave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's leave requests
// @route   GET /api/leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const { status, year } = req.query;
    
    let query = { employee: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single leave request
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email department')
      .populate('approvedBy', 'firstName lastName email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Check if user is authorized to view this leave
    if (leave.employee._id.toString() !== req.user.id && 
        !['team_leader', 'team_manager', 'general_manager'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this leave request' });
    }

    res.status(200).json({
      success: true,
      leave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel leave request
// @route   PUT /api/leaves/:id/cancel
// @access  Private
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Check if user owns this leave request
    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this leave request' });
    }

    // Can only cancel pending or approved leaves
    if (!['pending', 'approved'].includes(leave.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this leave request' });
    }

    // If leave was approved, restore the balance
    if (leave.status === 'approved' && leave.leaveType !== 'unpaid') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { [`leaveBalances.${leave.leaveType}`]: leave.numberOfDays }
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
exports.getLeaveStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const leaves = await Leave.find({
      employee: req.user.id,
      startDate: { $gte: startOfYear, $lte: endOfYear }
    });

    const stats = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      cancelled: leaves.filter(l => l.status === 'cancelled').length,
      byType: {
        casual: leaves.filter(l => l.leaveType === 'casual' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        medical: leaves.filter(l => l.leaveType === 'medical' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        earned: leaves.filter(l => l.leaveType === 'earned' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        unpaid: leaves.filter(l => l.leaveType === 'unpaid' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0)
      }
    };

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      stats,
      balances: user.leaveBalances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
