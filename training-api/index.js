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

const trainerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  description: { type: String }
});

trainerSchema.index({ firstName: 'text', lastName: 'text' });

const Trainer = mongoose.model('Trainer', trainerSchema);

const bookingSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  notes: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

// ESR
bookingSchema.index({ trainerId: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

const TRAINERS = [
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
    await Trainer.deleteMany({});
    await Booking.deleteMany({});

    const trainers = [];

    for (let i = 0; i < TRAINERS.length; i++) {
      const trainer = await Trainer.create({
        firstName: TRAINERS[i].firstName,
        lastName: TRAINERS[i].lastName,
        description: `Trainer ${i} description`
      });
      trainers.push(trainer);
    }

    const now = new Date();

    // Create 5 bookings per trainer
    for (const trainer of trainers) {
      for (let i = 0; i < 5; i++) {
        const startDate = new Date(now.getTime() + i * 60 * 60 * 1000); // i hours later
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        await Booking.create({
          trainerId: trainer._id,
          notes: `Session ${i + 1} with ${trainer.firstName}`,
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

const searchTrainerByName = async (query) => {
  const trainers = await Trainer.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(1); // get most relevant one

  console.log('here-searchTrainerByName', trainers);

  return trainers[0]; // best match
};

const isTrainerAvailable = async (trainerId, desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000);

  const conflictingBooking = await Booking.findOne({
    trainerId,
    startDate: { $lt: desiredEnd },
    endDate: { $gt: desiredStart }
  });

  console.log('conflictingBooking', conflictingBooking);

  return !conflictingBooking; // true if no conflict, false otherwise
};

const checkSlot = async (desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000);

  const conflictingBooking = await Booking.findOne({
    startDate: { $lt: desiredEnd },
    endDate: { $gt: desiredStart }
  });

  console.log('checkSlot-conflictingBooking', conflictingBooking);

  return !conflictingBooking; // true if no conflict, false otherwise
}

app.post('/api/can-make-booking', async (req, res) => {
  const { trainer, time } = req.body;
  const foundTrainer = await searchTrainerByName(trainer);

  let available
  if (foundTrainer) {
    available = await isTrainerAvailable(foundTrainer._id, time);

    console.log('available', available);
  } else {
    available = false;
  }
  res.send({ available: available, trainer: foundTrainer || {} });
});

app.post('/api/check-time', async (req, res) => {
  const { time } = req.body;

  const conflictingSlot = await checkSlot(time);

  res.send({ available: !conflictingSlot });
})

// seedData();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});