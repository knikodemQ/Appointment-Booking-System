const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');

// GET /api/availability - Pobierz wszystkie dostępności
router.get('/', async (req, res) => {
  try {
    const availabilities = await Availability.find().populate('doctorId');
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/availability - Dodaj nową dostępność
router.post('/', async (req, res) => {
  try {
    const availability = new Availability(req.body);
    const savedAvailability = await availability.save();
    res.status(201).json(savedAvailability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/availability/:id - Pobierz dostępność po ID
router.get('/:id', async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id).populate('doctorId');
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/availability/:id - Aktualizuj dostępność
router.put('/:id', async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctorId');
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    res.json(availability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/availability/:id - Usuń dostępność
router.delete('/:id', async (req, res) => {
  try {
    const availability = await Availability.findByIdAndDelete(req.params.id);
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;