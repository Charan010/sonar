require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const { connectDB } = require('./services/user.service');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/auth', authRoutes);

async function startServer() {
  try {
    //await connectDB();
    console.log('MongoDB is successfully connected.');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();