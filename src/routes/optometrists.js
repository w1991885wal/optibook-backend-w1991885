const express = require('express');
const router = express.Router();
const Optometrist = require('../models/Optometrist');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const optometrists = await Optometrist.find().populate('user');
    res.json({ success: true, data: optometrists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const optometrist = await Optometrist.findById(req.params.id).populate('user');
    res.json({ success: true, data: optometrist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
