const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getOrganizationReport,
  resetLeaveBalances
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(isAdmin);

// User management
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Department management
router.route('/departments')
  .get(getAllDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .put(updateDepartment);

// Leave policy management
router.route('/policies')
  .get(getAllPolicies)
  .post(createPolicy);

router.route('/policies/:id')
  .put(updatePolicy)
  .delete(deletePolicy);

// Reports and utilities
router.get('/reports', getOrganizationReport);
router.post('/reset-balances', resetLeaveBalances);

module.exports = router;
