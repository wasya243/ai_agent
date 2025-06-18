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

const meetingSchema = new mongoose.Schema({
  notes: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

// ESR
meetingSchema.index({ startDate: 1, endDate: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

const seedData = async () => {
  try {
    await Meeting.deleteMany({});

    const now = new Date();

    for (let i = 0; i < 5; i++) {
        const startDate = new Date(now.getTime() + i * 60 * 60 * 1000); // i hours later
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        await Meeting.create({
          notes: `Session ${i + 1}`,
          startDate,
          endDate
        });
    }

    console.log('✅ Seed complete');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
  }
};

// Routes

const searchDoctorByName = async (query) => {
  const doctors = await Doctor.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(1); // get most relevant one

  console.log('here-searchDoctorByName', doctors);

  return doctors[0]; // best match
};

const isMeetingPresent = async (time) => {
  const desiredStart = new Date(time);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000);

  const conflictingMeeting = await Meeting.findOne({
    startDate: { $lt: desiredEnd },
    endDate: { $gt: desiredStart }
  });

  console.log('conflictingMeeting', conflictingMeeting);

  return conflictingMeeting;
};

app.post('/api/meeting-is-present', async (req, res) => {
  const { time } = req.body;

  const isPresent = await isMeetingPresent(time);
  
  res.send({ present: !!isPresent });
});

// seedData();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});