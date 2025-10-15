const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// GET /api/appointments - Pobierz wszystkie wizyty
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctorId patientId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/appointments/:id - Pobierz wizytę po ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId patientId');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/appointments - Dodaj nową wizytę
router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/appointments/:id - Aktualizuj wizytę
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/appointments/:id - Usuń wizytę
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;