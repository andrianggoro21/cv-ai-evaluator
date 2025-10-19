import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CV AI Evaluator API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      upload: 'POST /upload',
      evaluate: 'POST /evaluate',
      result: 'GET /result/:id',
    },
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[App] Error:', err);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
  });
});

export default app;
