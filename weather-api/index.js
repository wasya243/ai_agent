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

const weatherSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

// ESR
weatherSchema.index({ startDate: 1, endDate: 1 });

const Weather = mongoose.model('Weather', weatherSchema);

const seedData = async () => {
  try {
    await Weather.deleteMany({});

    const now = new Date();
    now.setMinutes(0, 0, 0); // set to start of current hour

    const weatherEntries = [];

    for (let i = 0; i < 24; i++) {
      const startDate = new Date(now.getTime() + i * 60 * 60 * 1000); // each hour
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
      const temperature = Math.floor(Math.random() * (35 - 15 + 1)) + 15; // Random 15–35

      weatherEntries.push({ startDate, endDate, temperature });
    }

    await Weather.insertMany(weatherEntries);

    console.log('✅ Weather seed complete');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
  }
};

// Routes
app.post('/api/weather', async (req, res) => {
  const { time } = req.body;
  const passedTime = new Date(time);

  const matchedWeather = await Weather.findOne({
    startDate: { $lte: passedTime },
    endDate: { $gt: passedTime }
  });
  
  res.send({ weather: matchedWeather });
});

// seedData();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});