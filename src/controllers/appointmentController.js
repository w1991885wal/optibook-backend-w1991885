const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Optometrist = require("../models/Optometrist");
const Waitlist = require("../models/Waitlist");
const moment = require("moment");

exports.createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      optometristId,
      date,
      startTime,
      appointmentType,
      specialRequirements,
    } = req.body;

    const existingAppt = await Appointment.findOne({
      optometrist: optometristId,
      date,
      startTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppt) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot not available" });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      optometrist: optometristId,
      date,
      startTime,
      appointmentType,
      specialRequirements,
      createdBy: req.user._id,
    });

    await appointment.populate("patient optometrist");

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports.getAppointments = async (req, res) => {
//   try {
//     let query = {};

//     console.log(req.user._id, req.user.role);

//     if (req.user.role === "patient") {
//       const patient = await Patient.findOne({ user: req.user._id });
//       query.patient = patient._id;
//     } else if (req.user.role === "optometrist") {
//       const optometrist = await Optometrist.findOne({ user: req.user._id });
//       query.optometrist = optometrist._id;
//     }

//     const appointments = await Appointment.find(query)
//       .populate("patient optometrist")
//       .sort({ date: 1, startTime: 1 });

//     res.json({ success: true, count: appointments.length, data: appointments });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "patient") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "optometrist") {
      const optometrist = await Optometrist.findOne({ user: req.user._id });
      if (!optometrist) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query.optometrist = optometrist._id;
    }

    const appointments = await Appointment.find(query)
      .populate("patient optometrist")
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { optometristId, date } = req.query;

    const optometrist = await Optometrist.findById(optometristId);
    const dayOfWeek = moment(date).format("dddd").toLowerCase();
    const workingHours = optometrist.workingHours[dayOfWeek];

    if (!workingHours.working) {
      return res.json({ success: true, data: [] });
    }

    const bookedSlots = await Appointment.find({
      optometrist: optometristId,
      date: new Date(date),
      status: { $ne: "cancelled" },
    }).select("startTime duration");

    const allSlots = generateTimeSlots(
      workingHours.start,
      workingHours.end,
      optometrist.defaultAppointmentDuration,
      optometrist.lunchBreak,
    );

    const availableSlots = allSlots.filter((slot) => {
      return !bookedSlots.some((booked) => booked.startTime === slot);
    });

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function generateTimeSlots(start, end, duration, lunchBreak) {
  const slots = [];
  let current = moment(start, "HH:mm");
  const endTime = moment(end, "HH:mm");
  const lunchStart = moment(lunchBreak.start, "HH:mm");
  const lunchEnd = moment(lunchBreak.end, "HH:mm");

  while (current.isBefore(endTime)) {
    if (current.isBetween(lunchStart, lunchEnd, null, "[)")) {
      current = lunchEnd.clone();
      continue;
    }
    slots.push(current.format("HH:mm"));
    current.add(duration, "minutes");
  }

  return slots;
}

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate("patient optometrist");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    );

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const waitlistPatient = await Waitlist.findOne({
      optometrist: appointment.optometrist,
      status: "active",
    }).sort({ priority: -1, addedDate: 1 });

    if (waitlistPatient) {
      // Auto-fill logic here
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
