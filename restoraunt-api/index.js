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

const tableSchema = new mongoose.Schema({
  people: { type: Number, required: true },
  notes: { type: String, required: true },
});

tableSchema.index({ people: 1 });

const Table = mongoose.model('Table', tableSchema);

const bookingSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  notes: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

// ESR
bookingSchema.index({ tableId: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

const TABLES = [
    {
        people: 1
    },
    {
        people: 2
    },
    {
        people: 3
    },
    {
        people: 4
    }
];

const seedData = async () => {
  try {
    await Table.deleteMany({});
    await Booking.deleteMany({});

    const tables = [];

    for (let i = 0; i < TABLES.length; i++) {
      const trainer = await Table.create({
        people: TABLES[i].people,
        notes: `Table ${i} notes`
      });
      tables.push(trainer);
    }

    const now = new Date();

    // Create 5 bookings per table
    for (const table of tables) {
      for (let i = 0; i < 5; i++) {
        const startDate = new Date(now.getTime() + i * 60 * 60 * 1000); // i hours later
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        await Booking.create({
          tableId: table._id,
          notes: `Table booked`,
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

const getTableById = (id) => {
  return Table.findById(id).exec();
}

const isBooked = async (id, desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000); // 1-hour slot

  const conflict = await Booking.findOne({
      tableId: id,
      startDate: { $lt: desiredEnd },
      endDate: { $gt: desiredStart }
  });

  return conflict ? true : false;
}

const getAvailableTable = async (people, desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000); // 1-hour slot

  // Step 1: Find tables that can accommodate the number of people
  const suitableTables = await Table.find({ people: { $gte: people } });

  for (const table of suitableTables) {
    // Step 2: Check for conflicting booking
    const conflict = await Booking.findOne({
      tableId: table._id,
      startDate: { $lt: desiredEnd },
      endDate: { $gt: desiredStart }
    });

    if (!conflict) {
      return table; // Available table found
    }
  }

  return null; // No available tables
};

const bookTable = async (id, desiredStartTime) => {
  const desiredStart = new Date(desiredStartTime);
  const desiredEnd = new Date(desiredStart.getTime() + 60 * 60 * 1000); // 1-hour slot


  const booking = await Booking.create({
    tableId: id,
    startDate: desiredStart,
    endDate: desiredEnd
  });

  return booking;
}

app.post('/api/can-book-table', async (req, res) => {
  const { people, time } = req.body;
  const matchedTable = getAvailableTable(people, time);

  res.send({ table: matchedTable });
});

app.post('/api/book-table', async (req, res) => {
  const { tableId, time } = req.body;

  const table = await getTableById(tableId);

  if (!table) {
    return res.status(404).send({ message: `Table is not found by id ${tableId}` });
  }

  const isTableBooked = await isBooked(tableId, time);

  if (isTableBooked) {
    return res.status(400).send({ message: `Table ${tableId} is booked for requested time ${time}` });
  }

  const booking = await bookTable(tableId, time);

  res.send({ booking });
})

// seedData();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});