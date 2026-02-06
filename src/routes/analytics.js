const express = require('express');
const router = express.Router();
const { getDashboardStats, getOptometristStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', authorize('admin', 'optometrist'), getDashboardStats);
router.get('/optometrists', authorize('admin'), getOptometristStats);

module.exports = router;
