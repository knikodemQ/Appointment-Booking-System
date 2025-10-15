const express = require('express');
const router = express.Router();
const Absence = require('../models/Absence');

// GET /api/absences - Pobierz wszystkie nieobecności
router.get('/', async (req, res) => {
  try {
    const absences = await Absence.find().populate('doctorId');
    res.json(absences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/absences - Dodaj nową nieobecność
router.post('/', async (req, res) => {
  try {
    const absence = new Absence(req.body);
    const savedAbsence = await absence.save();
    res.status(201).json(savedAbsence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/absences/:id - Pobierz nieobecność po ID
router.get('/:id', async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id).populate('doctorId');
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' });
    }
    res.json(absence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/absences/:id - Aktualizuj nieobecność
router.put('/:id', async (req, res) => {
  try {
    const absence = await Absence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctorId');
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' });
    }
    res.json(absence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/absences/:id - Usuń nieobecność
router.delete('/:id', async (req, res) => {
  try {
    const absence = await Absence.findByIdAndDelete(req.params.id);
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' });
    }
    res.json({ message: 'Absence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;