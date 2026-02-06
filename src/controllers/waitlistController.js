const Waitlist = require('../models/Waitlist');
const Patient = require('../models/Patient');

exports.addToWaitlist = async (req, res) => {
  try {
    const { patientId, optometristId, appointmentType, priority } = req.body;
    
    const waitlistEntry = await Waitlist.create({
      patient: patientId,
      optometrist: optometristId,
      appointmentType,
      priority
    });
    
    await waitlistEntry.populate('patient optometrist');
    
    res.status(201).json({ success: true, data: waitlistEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.find({ status: 'active' })
      .populate('patient optometrist')
      .sort({ priority: -1, addedDate: 1 });
    
    res.json({ success: true, count: waitlist.length, data: waitlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWaitlist = async (req, res) => {
  try {
    const waitlistEntry = await Waitlist.findByIdAndUpdate(
      req.params.id,
      { status: 'removed' },
      { new: true }
    );
    
    res.json({ success: true, data: waitlistEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
