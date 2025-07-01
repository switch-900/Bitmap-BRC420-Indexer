import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import { setupDatabase } from './db/database';
import { startBlockProcessing } from './workers/processBlocks';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Load Umbrel configuration if available
try {
  const umbrelConfig = require('./config/umbrel.js');
  if (umbrelConfig.isUmbrelEnvironment()) {
    logger.info('Running in Umbrel environment');
    logger.info(`Using Ordinals API: ${umbrelConfig.getApiUrl()}`);
    logger.info(`Using Mempool API: ${umbrelConfig.getMempoolApiUrl()}`);
  }
} catch (error) {
  logger.debug('Umbrel config not found, using default configuration');
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEB_PORT = process.env.WEB_PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.UMBREL_APP ? 'umbrel' : 'standalone'
  });
});

// API routes
app.use('/api', apiRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuildPath));
  
  // Handle React routing - send all non-API requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use(errorHandler);

const startServer = async () => {
  try {
    await setupDatabase();
    logger.info('Database setup completed successfully.');

    // Start the combined server (API + Web)
    app.listen(WEB_PORT, () => {
      logger.info(`Server running on http://localhost:${WEB_PORT}`);
      logger.info(`API accessible at http://localhost:${WEB_PORT}/api`);
      
      // Start block processing after the server is listening
      if (process.env.RUN_INDEXER !== 'false') {
        startBlockProcessing().catch(error => {
          logger.error("Error in main processing loop:", error);
        });
      } else {
        logger.info('Block processing disabled via RUN_INDEXER=false');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();