import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from repo root, backend, frontend, or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Import Routers
import adminRouter from './routes/admin.routes';
import authRouter from './routes/auth.routes';
import catalogRouter from './routes/catalog.routes';
import competitionsRouter from './routes/competitions.routes';
import creatorsRouter from './routes/creators.routes';
import desiRouter from './routes/desi.routes';
import healthRouter from './routes/health.routes';
import leaderboardsRouter from './routes/leaderboards.routes';
import libraryRouter from './routes/library.routes';
import lyricsRouter from './routes/lyrics.routes';
import mediaRouter from './routes/media.routes';
import playlistsRouter from './routes/playlists.routes';
import recommendationsRouter from './routes/recommendations.routes';
import searchRouter from './routes/search.routes';
import socialRouter from './routes/social.routes';
import telemetryRouter from './routes/telemetry.routes';
import uploadsRouter from './routes/uploads.routes';
import walletRouter from './routes/wallet.routes';
import webhooksRouter from './routes/webhooks.routes';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports, null origin (Postman/Curl), or FRONTEND_URL
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production' && !req.path.startsWith('/api/v1/health')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Root & Health routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Talent5 Backend API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);

// API v1 Routers
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/competitions', competitionsRouter);
app.use('/api/v1/creators', creatorsRouter);
app.use('/api/v1/desi', desiRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/leaderboards', leaderboardsRouter);
app.use('/api/v1/library', libraryRouter);
app.use('/api/v1/lyrics', lyricsRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/playlists', playlistsRouter);
app.use('/api/v1/recommendations', recommendationsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/social', socialRouter);
app.use('/api/v1/telemetry', telemetryRouter);
app.use('/api/v1/uploads', uploadsRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/webhooks', webhooksRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} not found on Talent5 Backend Server.`,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Talent5 Backend Server running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
  console.log(`⚡ Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`===============================================`);
});

export default app;
