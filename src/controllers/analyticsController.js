const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Optometrist = require('../models/Optometrist');
const moment = require('moment');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const monthStart = moment().startOf('month');
    
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });
    
    const monthlyAppointments = await Appointment.countDocuments({
      date: { $gte: monthStart.toDate() }
    });
    
    const completedAppointments = await Appointment.countDocuments({
      date: { $gte: monthStart.toDate() },
      status: 'completed'
    });
    
    const noShowCount = await Appointment.countDocuments({
      date: { $gte: monthStart.toDate() },
      status: 'no-show'
    });
    
    const totalPatients = await Patient.countDocuments();
    const totalOptometrists = await Optometrist.countDocuments({ isActive: true });
    
    const noShowRate = monthlyAppointments > 0 ? ((noShowCount / monthlyAppointments) * 100).toFixed(2) : 0;
    const revenue = completedAppointments * 75; // £75 per appointment avg
    
    res.json({
      success: true,
      data: {
        todayAppointments,
        monthlyAppointments,
        completedAppointments,
        noShowCount,
        noShowRate,
        totalPatients,
        totalOptometrists,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOptometristStats = async (req, res) => {
  try {
    const optometrists = await Optometrist.find({ isActive: true });
    const today = moment().startOf('day');
    
    const stats = await Promise.all(optometrists.map(async (optom) => {
      const todayCount = await Appointment.countDocuments({
        optometrist: optom._id,
        date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
      });
      
      const weekCount = await Appointment.countDocuments({
        optometrist: optom._id,
        date: { $gte: moment().startOf('week').toDate() }
      });
      
      const utilization = ((todayCount / optom.maxAppointmentsPerDay) * 100).toFixed(0);
      
      return {
        id: optom._id,
        name: `${optom.firstName} ${optom.lastName}`,
        specialty: optom.specialty,
        room: optom.roomNumber,
        todayAppointments: todayCount,
        weekAppointments: weekCount,
        utilization
      };
    }));
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
