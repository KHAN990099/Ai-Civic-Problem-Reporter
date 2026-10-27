# CivicLens Backend

This is the backend for the CivicLens — AI Civic Problem Reporter.

## Tech Stack
- Node.js
- Express
- Google GenAI SDK (Gemini 1.5 Flash / Gemma 4)
- Multer (Image Uploads)
- Zod (Validation)
- JSON File Persistence

## Setup
1. `cd server`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   ```
   PORT=3001
   GEMINI_API_KEY=your_key
   GEMMA_MODEL=gemini-1.5-flash
   FRONTEND_URL=http://localhost:8080
   ```
4. Start the server:
   - Development: `npm run dev`
   - Production: `npm start`

## API Routes
- `POST /api/reports/analyze`: AI analysis of image and description.
- `POST /api/reports`: Create a new report.
- `GET /api/reports`: List all reports (supports search, category, status, priority, sort).
- `GET /api/reports/:id`: Get report details.
- `PATCH /api/reports/:id/status`: Update report status.
- `GET /api/reports/meta/analytics`: Get analytics.
- `POST /api/reports/demo/reset`: Reset data to seed.
