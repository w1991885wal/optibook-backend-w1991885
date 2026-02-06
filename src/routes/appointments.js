const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAvailableSlots,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAppointments).post(createAppointment);
router.get('/available', getAvailableSlots);
router.route('/:id').put(updateAppointment).delete(cancelAppointment);

module.exports = router;
