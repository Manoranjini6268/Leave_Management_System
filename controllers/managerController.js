const Leave = require('../models/Leave');
const User = require('../models/User');
const moment = require('moment');

// ─── Shared Helper ───────────────────────────────────────────────────────────

/**
 * Returns the array of employee ObjectIds that the given manager is allowed
 * to oversee. Returns null for general_manager (meaning "no filter – see all").
 */
async function getTeamMemberIds(managerUser) {
  if (managerUser.role === 'general_manager') return null;

  if (managerUser.role === 'team_manager') {
    const members = await User.find({ department: managerUser.department }).select('_id');
    return members.map(m => m._id);
  }

  if (managerUser.role === 'team_leader') {
    const members = await User.find({ manager: managerUser.id }).select('_id');
    return members.map(m => m._id);
  }

  return [];
}

/**
 * Returns true when the given manager is authorised to action a leave
 * belonging to the given employee.
 */
async function checkManagerAuthorization(manager, employee) {
  if (manager.role === 'general_manager') return true;

  if (manager.role === 'team_manager') {
    return (
      employee.department &&
      employee.department.toString() === manager.department.toString()
    );
  }

  if (manager.role === 'team_leader') {
    return (
      employee.manager &&
      employee.manager.toString() === manager._id.toString()
    );
  }

  return false;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Get pending leave requests for team
// @route   GET /api/manager/pending
// @access  Private (Manager+)
exports.getPendingLeaves = async (req, res) => {
  try {
    const teamIds = await getTeamMemberIds(req.user);
    const query = { status: 'pending' };
    if (teamIds !== null) query.employee = { $in: teamIds };

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId email department')
      .sort({ appliedAt: 1 });

    res.status(200).json({ success: true, count: leaves.length, leaves });
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

    const canApprove = await checkManagerAuthorization(req.user, leave.employee);
    if (!canApprove) {
      return res.status(403).json({ success: false, message: 'Not authorised to approve this leave request' });
    }

    // Atomic balance deduction with a conditional update to prevent race conditions
    if (leave.leaveType !== 'unpaid') {
      const balanceField = `leaveBalances.${leave.leaveType}`;
      const updated = await User.findOneAndUpdate(
        { _id: leave.employee._id, [balanceField]: { $gte: leave.numberOfDays } },
        { $inc: { [balanceField]: -leave.numberOfDays } },
        { new: true }
      );

      if (!updated) {
        return res.status(400).json({ success: false, message: 'Insufficient leave balance' });
      }
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvedAt = Date.now();
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName');

    res.status(200).json({ success: true, message: 'Leave request approved successfully', leave: updatedLeave });
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

    const canReject = await checkManagerAuthorization(req.user, leave.employee);
    if (!canReject) {
      return res.status(403).json({ success: false, message: 'Not authorised to reject this leave request' });
    }

    leave.status = 'rejected';
    leave.rejectedBy = req.user.id;    // semantically correct field name
    leave.approvedBy = undefined;       // ensure approved fields remain clean
    leave.approvedAt = undefined;
    leave.rejectedAt = Date.now();
    leave.rejectionReason = reason || 'No reason provided';
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('rejectedBy', 'firstName lastName');

    res.status(200).json({ success: true, message: 'Leave request rejected', leave: updatedLeave });
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
    const currentYear  = year  ? parseInt(year)  : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate   = new Date(currentYear, currentMonth + 1, 0);

    const teamIds = await getTeamMemberIds(req.user);
    let employeeQuery = teamIds !== null
      ? { employee: { $in: teamIds } }
      : {};

    const leaves = await Leave.find({
      ...employeeQuery,
      status: 'approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate:   { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    })
      .populate('employee', 'firstName lastName employeeId email')
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team members
// @route   GET /api/manager/team-members
// @access  Private (Manager+)
exports.getTeamMembers = async (req, res) => {
  try {
    const teamIds = await getTeamMemberIds(req.user);
    const filter = teamIds !== null ? { _id: { $in: teamIds } } : { role: { $ne: 'general_manager' } };

    const teamMembers = await User.find(filter)
      .populate('department')
      .select('-password')
      .sort({ firstName: 1 });

    res.status(200).json({ success: true, count: teamMembers.length, teamMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team member leave balance
// @route   PUT /api/manager/balance/:userId
// @access  Private (Manager+)
exports.updateLeaveBalance = async (req, res) => {
  try {
    const { leaveType, balance } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const canUpdate = await checkManagerAuthorization(req.user, user);
    if (!canUpdate) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this user' });
    }

    if (!['casual', 'medical', 'earned', 'unpaid'].includes(leaveType)) {
      return res.status(400).json({ success: false, message: 'Invalid leave type' });
    }

    user.leaveBalances[leaveType] = balance;
    await user.save();

    res.status(200).json({ success: true, message: 'Leave balance updated successfully', leaveBalances: user.leaveBalances });
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
    const endOfYear   = new Date(currentYear, 11, 31);

    const teamIds = await getTeamMemberIds(req.user);
    const employeeFilter = teamIds !== null ? { employee: { $in: teamIds } } : {};

    const leaves = await Leave.find({
      ...employeeFilter,
      startDate: { $gte: startOfYear, $lte: endOfYear }
    }).populate('employee', 'firstName lastName employeeId');

    res.status(200).json({
      success: true,
      report: {
        year: currentYear,
        totalLeaves: leaves.length,
        approved:  leaves.filter(l => l.status === 'approved').length,
        pending:   leaves.filter(l => l.status === 'pending').length,
        rejected:  leaves.filter(l => l.status === 'rejected').length,
        cancelled: leaves.filter(l => l.status === 'cancelled').length,
        byType: computeLeaveTypeStats(leaves),
        leaves
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Shared Stats Helper ─────────────────────────────────────────────────────

/**
 * Sums approved leave days per leave type from an array of leave documents.
 */
function computeLeaveTypeStats(leaves) {
  const types = ['casual', 'medical', 'earned', 'unpaid'];
  return types.reduce((acc, type) => {
    acc[type] = leaves
      .filter(l => l.leaveType === type && l.status === 'approved')
      .reduce((sum, l) => sum + l.numberOfDays, 0);
    return acc;
  }, {});
}

module.exports.computeLeaveTypeStats = computeLeaveTypeStats;
