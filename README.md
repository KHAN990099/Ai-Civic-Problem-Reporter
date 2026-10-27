# Pixel Perfect Replica

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-replica-9298.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c465b384-4d8c-4f44-bcd0-e0b5bb3bd682).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

### Backend
1. Go to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Set up environment: `cp .env.example .env` and add your `GEMINI_API_KEY`.
4. Run: `npm run dev`

### Frontend
1. Install dependencies: `npm install`
2. Set up environment: `cp .env.example .env` and set `VITE_API_BASE_URL=http://localhost:3001`.
3. Run: `npm run dev`

The backend runs on http://localhost:3001 and the frontend on http://localhost:8080.
