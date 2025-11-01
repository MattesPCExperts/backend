import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './middleware/auth.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import authRoutes from './routes/auth.routes';
import postsRoutes from './routes/posts.routes';
import socialRoutes from './routes/social.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { isHttpError } from './utils/http-error';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/posts', postsRoutes);
app.use('/social', socialRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isHttpError(error)) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error('Unhandled error', error);
  res.status(500).json({ message: 'Internal server error' });
});

async function start(): Promise<void> {
  try {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
      console.log(`API server listening on port ${env.PORT}`);
    });

    const shutdown = async () => {
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

if (env.NODE_ENV !== 'test') {
  start().catch((error) => {
    console.error('Startup error', error);
    process.exit(1);
  });
}

export default app;

