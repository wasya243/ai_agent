require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  description: { type: String }
});

doctorSchema.index({ firstName: 'text', lastName: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);

const bookingSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  notes: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

// ESR
bookingSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

const DOCTORS = [
    {
        firstName: 'Vasyl',
        lastName: 'Kharchenko'
    },
    {
        firstName: 'Vasyl',
        lastName: 'Adamenko'
    },
    {
        firstName: 'Max',
        lastName: 'Ovechkin'
    },
    {
        firstName: 'Vlad',
        lastName: 'Kucherenko'
    },
    {
        firstName: 'Oleg',
        lastName: 'Marchenko'
    }
]

const seedData = async () => {
  try {
    await Doctor.deleteMany({});
    await Booking.deleteMany({});

    const doctors = [];

    for (let i = 0; i < DOCTORS.length; i++) {
      const doctor = await Doctor.create({
        firstName: DOCTORS[i].firstName,
        lastName: DOCTORS[i].lastName,
        description: `Doctor ${i} description`
      });
      doctors.push(doctor);
    }

    const now = new Date();

    // Create 5 bookings per doctor
    for (const doctor of doctors) {
      for (let i = 0; i < 5; i++) {
        const startDate = new Date(now.getTime() + i * 60 * 60 * 1000); // i hours later
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        await Booking.create({
          doctorId: doctor._id,
          notes: `Session ${i + 1} with ${doctor.firstName}`,
          startDate,
          endDate
        });
      }
    }

    console.log('✅ Seed complete');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
  }
};

// Routes

// seedData();

const searchDoctorByName = async (query) => {
  const doctors = await Doctor.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(1); // get most relevant one

  console.log('here-searchDoctorByName', doctors);

  return doctors[0]; // best match
};

const isDoctorAvailable = async (doctorId, desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000);

  const conflictingBooking = await Booking.findOne({
    doctorId,
    startDate: { $lt: desiredEnd },
    endDate: { $gt: desiredStart }
  });

  console.log('conflictingBooking', conflictingBooking);

  return !conflictingBooking; // true if no conflict, false otherwise
};

const isSlotAvailable = async (desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000);

  const conflictingBooking = await Booking.findOne({
    startDate: { $lt: desiredEnd },
    endDate: { $gt: desiredStart }
  });

  console.log('conflictingSlot', conflictingBooking);

  return !conflictingBooking; // true if no conflict, false otherwise
};

app.post('/api/can-make-booking', async (req, res) => {
  const { doctor, time } = req.body;
  const foundDoctor = await searchDoctorByName(doctor);

  let available
  if (foundDoctor) {
    available = await isDoctorAvailable(foundDoctor._id, time);

    console.log('available', available);
  } else {
    available = false;
  }
  res.send({ available: available, doctor: foundDoctor || {} });
});

app.post('/api/check-time', async (req, res) => {
  const { time } = req.body;

  const conflictingSlot = await isSlotAvailable(time);

  res.send({ available: !conflictingSlot });
});

// seedData();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});