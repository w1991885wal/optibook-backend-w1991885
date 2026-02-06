const express = require('express');
const router = express.Router();
const { addToWaitlist, getWaitlist, removeFromWaitlist } = require('../controllers/waitlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getWaitlist).post(addToWaitlist);
router.delete('/:id', removeFromWaitlist);

module.exports = router;
