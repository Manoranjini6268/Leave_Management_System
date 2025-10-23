const express = require('express');
const {
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getTeamCalendar,
  getTeamMembers,
  updateLeaveBalance,
  getTeamReport
} = require('../controllers/managerController');
const { protect, isManager } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(isManager);

router.get('/pending', getPendingLeaves);
router.put('/approve/:id', approveLeave);
router.put('/reject/:id', rejectLeave);
router.get('/team-calendar', getTeamCalendar);
router.get('/team-members', getTeamMembers);
router.put('/balance/:userId', updateLeaveBalance);
router.get('/report', getTeamReport);

module.exports = router;
