const Leave = require('../models/Leave');
const User = require('../models/User');
const moment = require('moment');

// @desc    Get pending leave requests for team
// @route   GET /api/manager/pending
// @access  Private (Manager+)
exports.getPendingLeaves = async (req, res) => {
  try {
    let query = { status: 'pending' };

    // Team leaders see their direct reports
    // Team managers see their department
    // General managers see all
    if (req.user.role === 'team_leader') {
      const teamMembers = await User.find({ manager: req.user.id });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employee = { $in: teamMemberIds };
    } else if (req.user.role === 'team_manager') {
      const teamMembers = await User.find({ department: req.user.department });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employee = { $in: teamMemberIds };
    }
    // General manager sees all pending leaves (no additional filter)

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId email department')
      .populate('employee.department')
      .sort({ appliedAt: 1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve leave request
// @route   PUT /api/manager/approve/:id
// @access  Private (Manager+)
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave request is not pending' });
    }

    // Check authorization
    const canApprove = await checkManagerAuthorization(req.user, leave.employee);
    if (!canApprove) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this leave request' });
    }

    // Deduct leave balance
    if (leave.leaveType !== 'unpaid') {
      const user = await User.findById(leave.employee._id);
      if (user.leaveBalances[leave.leaveType] < leave.numberOfDays) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient leave balance' 
        });
      }

      user.leaveBalances[leave.leaveType] -= leave.numberOfDays;
      await user.save();
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvedAt = Date.now();
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      leave: updatedLeave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject leave request
// @route   PUT /api/manager/reject/:id
// @access  Private (Manager+)
exports.rejectLeave = async (req, res) => {
  try {
    const { reason } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave request is not pending' });
    }

    // Check authorization
    const canReject = await checkManagerAuthorization(req.user, leave.employee);
    if (!canReject) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this leave request' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    leave.approvedAt = Date.now();
    leave.rejectionReason = reason || 'No reason provided';
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      leave: updatedLeave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team leave calendar
// @route   GET /api/manager/team-calendar
// @access  Private (Manager+)
exports.getTeamCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    let teamMemberIds = [];

    if (req.user.role === 'team_leader') {
      const teamMembers = await User.find({ manager: req.user.id });
      teamMemberIds = teamMembers.map(member => member._id);
    } else if (req.user.role === 'team_manager') {
      const teamMembers = await User.find({ department: req.user.department });
      teamMemberIds = teamMembers.map(member => member._id);
    } else if (req.user.role === 'general_manager') {
      const allUsers = await User.find({ role: { $ne: 'general_manager' } });
      teamMemberIds = allUsers.map(user => user._id);
    }

    const leaves = await Leave.find({
      employee: { $in: teamMemberIds },
      status: 'approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    })
    .populate('employee', 'firstName lastName employeeId email')
    .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team members
// @route   GET /api/manager/team-members
// @access  Private (Manager+)
exports.getTeamMembers = async (req, res) => {
  try {
    let teamMembers = [];

    if (req.user.role === 'team_leader') {
      teamMembers = await User.find({ manager: req.user.id })
        .populate('department')
        .select('-password');
    } else if (req.user.role === 'team_manager') {
      teamMembers = await User.find({ department: req.user.department })
        .populate('department')
        .select('-password');
    } else if (req.user.role === 'general_manager') {
      teamMembers = await User.find({ role: { $ne: 'general_manager' } })
        .populate('department')
        .select('-password');
    }

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team member leave balance (Admin override)
// @route   PUT /api/manager/balance/:userId
// @access  Private (Manager+)
exports.updateLeaveBalance = async (req, res) => {
  try {
    const { leaveType, balance } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check authorization
    const canUpdate = await checkManagerAuthorization(req.user, user);
    if (!canUpdate) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    if (!['casual', 'medical', 'earned', 'unpaid'].includes(leaveType)) {
      return res.status(400).json({ success: false, message: 'Invalid leave type' });
    }

    user.leaveBalances[leaveType] = balance;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Leave balance updated successfully',
      leaveBalances: user.leaveBalances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team leave report
// @route   GET /api/manager/report
// @access  Private (Manager+)
exports.getTeamReport = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    let teamMemberIds = [];

    if (req.user.role === 'team_leader') {
      const teamMembers = await User.find({ manager: req.user.id });
      teamMemberIds = teamMembers.map(member => member._id);
    } else if (req.user.role === 'team_manager') {
      const teamMembers = await User.find({ department: req.user.department });
      teamMemberIds = teamMembers.map(member => member._id);
    } else if (req.user.role === 'general_manager') {
      const allUsers = await User.find({ role: { $ne: 'general_manager' } });
      teamMemberIds = allUsers.map(user => user._id);
    }

    const leaves = await Leave.find({
      employee: { $in: teamMemberIds },
      startDate: { $gte: startOfYear, $lte: endOfYear }
    }).populate('employee', 'firstName lastName employeeId');

    const report = {
      totalLeaves: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      pending: leaves.filter(l => l.status === 'pending').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      byType: {
        casual: leaves.filter(l => l.leaveType === 'casual' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        medical: leaves.filter(l => l.leaveType === 'medical' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        earned: leaves.filter(l => l.leaveType === 'earned' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
        unpaid: leaves.filter(l => l.leaveType === 'unpaid' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0)
      },
      leaves
    };

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to check manager authorization
async function checkManagerAuthorization(manager, employee) {
  if (manager.role === 'general_manager') {
    return true;
  }
  
  if (manager.role === 'team_manager') {
    return employee.department && employee.department.toString() === manager.department.toString();
  }
  
  if (manager.role === 'team_leader') {
    return employee.manager && employee.manager.toString() === manager._id.toString();
  }
  
  return false;
}
