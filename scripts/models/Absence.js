const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  doctorId: {
    type: Number,
    required: true
  },
  startDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  endDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  reason: String
}, {
  timestamps: true
});

// Indeks dla szybkiego wyszukiwania
absenceSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Absence', absenceSchema);