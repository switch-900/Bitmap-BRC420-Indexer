import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = '/mnt/c/Users/crowh/bitmap420/db/brc-420.db'; // fix this later get path 

function checkPermissions() {
  const dbDir = path.dirname(DB_PATH);
  
  console.log('Checking permissions...');
  console.log('DB_PATH:', DB_PATH);
  console.log('Database directory:', dbDir);

  try {
    if (!fs.existsSync(dbDir)) {
      console.log('Database directory does not exist. Attempting to create...');
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Database directory created successfully.');
    }

    fs.accessSync(dbDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Read and write permissions are available for the database directory.');

    if (fs.existsSync(DB_PATH)) {
      fs.accessSync(DB_PATH, fs.constants.R_OK | fs.constants.W_OK);
      console.log('Read and write permissions are available for the database file.');
    } else {
      console.log('Database file does not exist yet. It will be created when running setup-db.');
    }

    console.log('Permission check completed successfully.');
  } catch (error) {
    console.error('Permission error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

checkPermissions();
