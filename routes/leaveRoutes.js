const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getLeave,
  cancelLeave,
  getLeaveStats
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyLeaves)
  .post(applyLeave);

router.get('/stats', getLeaveStats);
router.get('/:id', getLeave);
router.put('/:id/cancel', cancelLeave);

module.exports = router;
