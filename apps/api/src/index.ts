import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logger';
import { metricsMiddleware } from './middlewares/metrics';
import { register } from './lib/metrics';
import { logger } from './lib/logger';
import authRoutes from './routes/authRoutes';
import monitorRoutes from './routes/monitorRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Security and parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Observability middleware
app.use(requestLogger);
app.use(metricsMiddleware);

// Health and metrics endpoints
app.use(healthRoutes);
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/', (_, res) => {
  res.json({ status: 'API IS RUNNING' });
});

// API routes
app.use('/auth', authRoutes);
app.use('/monitors', monitorRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(
    { port: PORT },
    `API service started on http://localhost:${PORT}`
  );
});
