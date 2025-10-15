const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.Mixed, // Number lub String
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.Mixed, // Number lub String (Firebase UID)
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['wizyta kontrolna', 'recepta', 'konsultacja', 'badania', 'pierwsza wizyta', 'choroba przewlekła']
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:MM
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minuty
  },
  occurred: {
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  details: String
}, {
  timestamps: true
});

// Indeks dla szybkiego wyszukiwania po dacie i lekarzu
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);