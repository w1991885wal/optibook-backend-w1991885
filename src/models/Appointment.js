const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    optometrist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Optometrist",
      required: true,
    },
    appointmentType: {
      type: String,
      enum: [
        "Comprehensive Eye Exam",
        "Contact Lens Fitting",
        "Follow-up Consultation",
        "Prescription Update",
        "Eye Emergency",
        "Children's Eye Exam",
        "Standard Eye Test",
        "Contact Lens Fitting",
        "Contact Lens Follow-up",
        "PCO Test",
        "Other",
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    specialRequirements: {
      type: String,
    },
    smartAllocated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    visitRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitRecord",
    },
  },
  {
    timestamps: true,
  },
);

// Index for checking availability
appointmentSchema.index(
  { optometrist: 1, date: 1, startTime: 1 },
  { unique: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
