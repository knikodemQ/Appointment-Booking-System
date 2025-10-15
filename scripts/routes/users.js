const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - Pobierz wszystkich użytkowników
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:uid - Pobierz użytkownika po UID
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Stwórz nowego użytkownika
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:uid - Zaktualizuj użytkownika
router.put('/:uid', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users/:uid - Usuń użytkownika
router.delete('/:uid', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;