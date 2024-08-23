import { setupDatabase } from './db/database';
import logger from './utils/logger';

async function setup() {
  try {
    await setupDatabase();
    logger.info('Database setup completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Error setting up database:', error);
    if (error instanceof Error) {
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

setup();