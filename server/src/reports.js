import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { loadReports, saveReports, resetReports } from './persistence.js';
import { analyzeIssue } from './analysis.js';
import { AnalyzeRequestSchema, CreateReportSchema, UpdateStatusSchema } from './validators.js';
import { detectDuplicates } from './duplicates.js';
import { calculateAnalytics } from './analytics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const mime = allowed.test(file.mimetype);
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mime && ext) return cb(null, true);
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
  }
});

// AI Analysis
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const data = AnalyzeRequestSchema.parse(req.body);
    const imagePath = req.file ? req.file.path : null;
    
    const analysis = await analyzeIssue({
      ...data,
      imagePath
    });

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Create Report
router.post('/', async (req, res) => {
  try {
    const input = CreateReportSchema.parse(req.body);
    const reports = await loadReports();
    
    // Duplicate Detection
    const duplicates = detectDuplicates(reports, input);
    
    const now = new Date().toISOString();
    const newReport = {
      ...input,
      id: `CL-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`,
      status: "Submitted",
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: "Submitted", at: now, note: "Report submitted by citizen" }],
      isDemo: false,
      analysisMode: input.analysis?.mode || "REAL",
      duplicates: duplicates.length > 0 ? duplicates.map(d => d.id) : []
    };

    reports.push(newReport);
    await saveReports(reports);
    
    res.status(201).json({ ...newReport, possibleDuplicates: duplicates });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// List Reports
router.get('/', async (req, res) => {
  try {
    let reports = await loadReports();
    const { search, category, status, priority, sort } = req.query;

    if (search) {
      const s = search.toLowerCase();
      reports = reports.filter(r => 
        r.description.toLowerCase().includes(s) || 
        r.location.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s)
      );
    }

    if (category) reports = reports.filter(r => r.category === category);
    if (status) reports = reports.filter(r => r.status === status);
    if (priority) reports = reports.filter(r => r.priority === priority);

    if (sort === 'oldest') {
      reports.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Report
router.get('/:id', async (req, res) => {
  try {
    const reports = await loadReports();
    const report = reports.find(r => r.id === req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = UpdateStatusSchema.parse(req.body);
    const reports = await loadReports();
    const index = reports.findIndex(r => r.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: "Report not found" });

    const now = new Date().toISOString();
    reports[index] = {
      ...reports[index],
      status,
      updatedAt: now,
      statusHistory: [
        ...reports[index].statusHistory,
        { status, at: now, note: `Status updated to ${status}` }
      ]
    };

    await saveReports(reports);
    res.json(reports[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analytics
router.get('/meta/analytics', async (req, res) => {
  try {
    const reports = await loadReports();
    const analytics = calculateAnalytics(reports);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Demo Data
router.post('/demo/reset', async (req, res) => {
  try {
    const seeded = await resetReports();
    res.json({ message: "Data reset successful", count: seeded.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
