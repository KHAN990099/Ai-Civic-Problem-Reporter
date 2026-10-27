import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import reportsRouter from './reports.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080'
}));

app.use(express.json());

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/reports', reportsRouter);

// Base analytics route (aliased for convenience if needed)
app.get('/api/analytics', (req, res) => {
  res.redirect(307, '/api/reports/meta/analytics');
});

// Demo reset route (aliased)
app.post('/api/demo/reset', (req, res) => {
  res.redirect(307, '/api/reports/demo/reset');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
