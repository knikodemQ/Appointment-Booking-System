const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['cykliczne', 'jednorazowe'],
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
  days: [{
    type: String // np. "poniedziałek", "wtorek", etc.
  }],
  timeSlots: [{
    from: {
      type: String, // Format: HH:MM lub H:MM
      required: true
    },
    to: {
      type: String, // Format: HH:MM lub H:MM  
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indeks dla szybkiego wyszukiwania
availabilitySchema.index({ doctorId: 1, startDate: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);