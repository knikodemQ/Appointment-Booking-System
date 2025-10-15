const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Availability = require('./models/Availability');
const Absence = require('./models/Absence');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/appointment-booking';

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Availability.deleteMany({});
    await Absence.deleteMany({});
    console.log('Collections cleared');

    // Read JSON data
    const dataPath = path.join(__dirname, '..', 'data', 'data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Migrate Users (with upsert to handle duplicates)
    if (jsonData.users && jsonData.users.length > 0) {
      console.log(`Migrating ${jsonData.users.length} users...`);
      const userOps = jsonData.users.map(user => {
        const { id, ...userWithoutId } = user; // Remove old id
        return {
          updateOne: {
            filter: { uid: user.uid },
            update: userWithoutId,
            upsert: true
          }
        };
      });
      await User.bulkWrite(userOps);
      console.log('Users migrated successfully');
    }

    // Migrate Appointments
    if (jsonData.appointments && jsonData.appointments.length > 0) {
      console.log(`Migrating ${jsonData.appointments.length} appointments...`);
      const appointments = jsonData.appointments.map(appointment => {
        const { id, ...appointmentWithoutId } = appointment; // Remove old id
        return appointmentWithoutId;
      });
      await Appointment.insertMany(appointments);
      console.log('Appointments migrated successfully');
    }

    // Migrate Availability
    if (jsonData.availability && jsonData.availability.length > 0) {
      console.log(`Migrating ${jsonData.availability.length} availability records...`);
      const availability = jsonData.availability.map(avail => {
        const { id, ...availWithoutId } = avail; // Remove old id
        return availWithoutId;
      });
      await Availability.insertMany(availability);
      console.log('Availability migrated successfully');
    }

    // Migrate Absences
    if (jsonData.absences && jsonData.absences.length > 0) {
      console.log(`Migrating ${jsonData.absences.length} absence records...`);
      const absences = jsonData.absences.map(absence => {
        const { id, ...absenceWithoutId } = absence; // Remove old id
        return absenceWithoutId;
      });
      await Absence.insertMany(absences);
      console.log('Absences migrated successfully');
    }

    // Show final statistics
    const userCount = await User.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const availabilityCount = await Availability.countDocuments();
    const absenceCount = await Absence.countDocuments();

    console.log('\n Migration Statistics:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Appointments: ${appointmentCount}`);
    console.log(`- Availability records: ${availabilityCount}`);
    console.log(`- Absence records: ${absenceCount}`);

    console.log('\n Data migration completed successfully!');

  } catch (error) {
    console.error(' Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log(' Database connection closed');
  }
}

// Run migration
migrateData();