import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { StatusCodes } from './utils/httpStatus';
import routes from './routes';

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
      upload: 'POST /api/upload',
      evaluate: 'POST /api/evaluate',
      result: 'GET /api/result/:id',
      listResults: 'GET /api/result',
    },
  });
});

app.use('/api', routes);

app.use((_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: 'Endpoint not found',
    statusCode: StatusCodes.NOT_FOUND,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
