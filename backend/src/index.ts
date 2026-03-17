import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite DB
initDB();

// Setup Routing
app.use('/', router);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
