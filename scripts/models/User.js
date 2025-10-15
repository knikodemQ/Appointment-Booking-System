const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isDoctor: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  age: Number,
  specialization: String, // Tylko dla lekarzy
}, {
  timestamps: true // Automatyczne createdAt i updatedAt
});

module.exports = mongoose.model('User', userSchema);