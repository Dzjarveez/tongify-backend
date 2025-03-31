import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; 
import connectDB from '@/config/database';
import routes from '@/routes';
import { errorHandler } from '@/middlewares/errorHandler';
import { PORT } from '@/config/env';
import 'tsconfig-paths/register';

const app: Application = express();

app.use(cors());

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
      });

      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
