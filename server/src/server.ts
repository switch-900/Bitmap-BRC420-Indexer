import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { setupDatabase } from './db/database';
import { startBlockProcessing } from './workers/processBlocks';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await setupDatabase();
    logger.info('Database setup completed successfully.');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      
      // Start block processing after the server is listening
      startBlockProcessing().catch(error => {
        logger.error("Error in main processing loop:", error);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();