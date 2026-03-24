require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createConnection } = require('./db');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const login = require('./Routes/login');

app.use('/api/v1', login);

const startServer = async () => {
  try {
    await createConnection();
    
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log('🚀 Backend ready with DB connection!');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
