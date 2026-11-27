import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiters.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';
import instructorPanelRoutes from './routes/instructorPanelRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
if (env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api', generalLimiter);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/instructor', instructorPanelRoutes);
if (env.NODE_ENV === 'production') {
  const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
  app.use(express.static(clientDist, {
    index: false,
    setHeaders(res, filePath) {
      const relativePath = path.relative(clientDist, filePath).replace(/\\/g, '/');
      if (relativePath.startsWith('assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (relativePath === 'robots.txt') {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
app.use(notFound);
app.use(errorHandler);

export default app;
