const User = require('../models/User');
const Department = require('../models/Department');
const LeavePolicy = require('../models/LeavePolicy');
const Leave = require('../models/Leave');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('department')
      .populate('manager', 'firstName lastName email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, employeeId, role, department, manager, leaveBalances } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const employeeExists = await User.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      role,
      department,
      manager,
      leaveBalances: leaveBalances || undefined
    });

    const createdUser = await User.findById(user._id)
      .populate('department')
      .populate('manager', 'firstName lastName email')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, department, manager, leaveBalances, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (manager) user.manager = manager;
    if (leaveBalances) user.leaveBalances = leaveBalances;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('department')
      .populate('manager', 'firstName lastName email')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'firstName lastName email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, manager, description } = req.body;

    const departmentExists = await Department.findOne({ $or: [{ name }, { code }] });
    if (departmentExists) {
      return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }

    const department = await Department.create({
      name,
      code,
      manager,
      description
    });

    const createdDepartment = await Department.findById(department._id)
      .populate('manager', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: createdDepartment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave policies
// @route   GET /api/admin/policies
// @access  Private (Admin)
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await LeavePolicy.find().sort({ leaveType: 1 });

    res.status(200).json({
      success: true,
      count: policies.length,
      policies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create leave policy
// @route   POST /api/admin/policies
// @access  Private (Admin)
exports.createPolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Leave policy created successfully',
      policy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update leave policy
// @route   PUT /api/admin/policies/:id
// @access  Private (Admin)
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      policy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete leave policy
// @route   DELETE /api/admin/policies/:id
// @access  Private (Admin)
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get organization-wide reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getOrganizationReport = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const totalUsers = await User.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments({ isActive: true });

    const leaves = await Leave.find({
      startDate: { $gte: startOfYear, $lte: endOfYear }
    }).populate('employee', 'firstName lastName employeeId department');

    const report = {
      year: currentYear,
      totalEmployees: totalUsers,
      totalDepartments: totalDepartments,
      leaveStatistics: {
        total: leaves.length,
        approved: leaves.filter(l => l.status === 'approved').length,
        pending: leaves.filter(l => l.status === 'pending').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        cancelled: leaves.filter(l => l.status === 'cancelled').length,
        byType: {
          casual: leaves.filter(l => l.leaveType === 'casual' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
          medical: leaves.filter(l => l.leaveType === 'medical' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
          earned: leaves.filter(l => l.leaveType === 'earned' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0),
          unpaid: leaves.filter(l => l.leaveType === 'unpaid' && l.status === 'approved').reduce((sum, l) => sum + l.numberOfDays, 0)
        }
      },
      recentLeaves: leaves.slice(0, 10)
    };

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset all leave balances (yearly reset)
// @route   POST /api/admin/reset-balances
// @access  Private (Admin)
exports.resetLeaveBalances = async (req, res) => {
  try {
    const { casual, medical, earned } = req.body;

    await User.updateMany(
      { isActive: true },
      {
        $set: {
          'leaveBalances.casual': casual || 12,
          'leaveBalances.medical': medical || 12,
          'leaveBalances.earned': earned || 15
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Leave balances reset successfully for all users'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
