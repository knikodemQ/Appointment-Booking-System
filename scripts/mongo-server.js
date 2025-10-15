const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // Port 3001 żeby nie kolidować z JSON Server (3000)

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(' MongoDB connected successfully!'))
.catch(err => console.error(' MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🚀 MongoDB Express Server is running!',
    database: 'appointment-booking',
    timestamp: new Date().toISOString()
  });
});

// Import routes (będziemy je tworzyć)
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const availabilityRoutes = require('./routes/availability');
const absenceRoutes = require('./routes/absences');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/absences', absenceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(' Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(` MongoDB Express Server running on http://localhost:${PORT}`);
  console.log(` API endpoints available at http://localhost:${PORT}/api/`);
});

module.exports = app;