import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('=================================');
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
