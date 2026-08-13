import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './shared/config/index.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

const app = express();

// ─── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

import knowledgeRouter from './modules/knowledge/index.js';
import attractionsRouter from './modules/attractions/index.js';
import liveDataRouter from './modules/live-data/index.js';
import plannerRouter from './modules/planner/index.js';
import nluRouter from './modules/nlu/index.js';
import feedbackRouter from './modules/feedback/index.js';

// ─── API v1 Routes (will be added per phase) ────────────────────────────────
app.use('/api/v1/knowledge', knowledgeRouter);
app.use('/api/v1/attractions', attractionsRouter);
app.use('/api/v1/live', liveDataRouter);
app.use('/api/v1/planner', plannerRouter);
app.use('/api/v1/nlu', nluRouter);
app.use('/api/v1/feedback', feedbackRouter);
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/users', usersRouter);
// app.use('/api/v1/trips', tripsRouter);
// app.use('/api/v1/nlu', nluRouter);
// app.use('/api/v1/feedback', feedbackRouter);
// app.use('/api/v1/i18n', i18nRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' },
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🚀 Travel Assistant API running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/api/health\n`);
});

export default app;
