import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';
import { Deploy, Mint, Bitmap, Transfer, Parcel, BlockStats } from '../types';
import logger from '../utils/logger';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../brc-420.db');

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const setupDatabase = async (): Promise<void> => {
  if (db) {
      logger.info('Database is already initialized');
      return;
  }

  db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS deploys (
      id TEXT PRIMARY KEY,
      source_id TEXT,
      name TEXT,
      max INTEGER,
      price REAL,
      block_height INTEGER,
      inscription_index INTEGER,
      timestamp INTEGER,
      current_wallet TEXT,
      deployer_address TEXT,
      current_mint_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mints (
      id TEXT PRIMARY KEY,
      deploy_id TEXT,
      block_height INTEGER,
      inscription_index INTEGER,
      timestamp INTEGER,
      current_wallet TEXT,
      FOREIGN KEY (deploy_id) REFERENCES deploys(id)
    );

    CREATE TABLE IF NOT EXISTS bitmaps (
      inscription_id TEXT PRIMARY KEY,
      bitmap_number INTEGER,
      content TEXT,
      block_height INTEGER,
      inscription_index INTEGER,
      timestamp INTEGER,
      current_wallet TEXT
    );

    CREATE TABLE IF NOT EXISTS parcels (
      inscription_id TEXT PRIMARY KEY,
      parcel_number INTEGER,
      bitmap_number INTEGER,
      bitmap_inscription_id TEXT,
      content TEXT,
      address TEXT,
      block_height INTEGER,
      timestamp INTEGER,
      transaction_count INTEGER,
      is_valid INTEGER DEFAULT 1,
      wallet TEXT,
      FOREIGN KEY (bitmap_inscription_id) REFERENCES bitmaps(inscription_id)
    );

    CREATE TABLE IF NOT EXISTS block_stats (
      block_height INTEGER PRIMARY KEY,
      total_transactions INTEGER,
      total_inscriptions INTEGER,
      deploys_count INTEGER DEFAULT 0,
      mints_count INTEGER DEFAULT 0,
      bitmaps_count INTEGER DEFAULT 0,
      parcels_count INTEGER DEFAULT 0,
      processed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inscription_id TEXT,
      from_wallet TEXT,
      to_wallet TEXT,
      block_height INTEGER,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS processed_blocks (
      block_height INTEGER PRIMARY KEY,
      processed INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_deploy_name ON deploys(name);
    CREATE INDEX IF NOT EXISTS idx_bitmap_number ON bitmaps(bitmap_number);
    CREATE INDEX IF NOT EXISTS idx_parcel_bitmap ON parcels(bitmap_number);
    CREATE INDEX IF NOT EXISTS idx_parcel_number ON parcels(parcel_number, bitmap_number);
    CREATE INDEX IF NOT EXISTS idx_transfers_inscription_id ON transfers(inscription_id);
    CREATE INDEX IF NOT EXISTS idx_block_stats_height ON block_stats(block_height);
  `);

  logger.info('Database setup completed successfully.');
};


export const getDeployById = async (id: string): Promise<Deploy | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<Deploy>('SELECT * FROM deploys WHERE id = ?', [id]);
};

export const getDeployBySourceInscription = async (sourceInscriptionId: string): Promise<Deploy | null> => {
  if (!db) throw new Error('Database not initialized');
  const deploy = await db.get<Deploy>('SELECT * FROM deploys WHERE source_id = ?', [sourceInscriptionId]);
  return deploy || null;
};

export const getMintCount = async (deployId: string): Promise<number> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM mints WHERE deploy_id = ?', [deployId]);
  return result?.count || 0;
};

export const getBitmapByNumber = async (bitmapNumber: number): Promise<Bitmap | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<Bitmap>('SELECT * FROM bitmaps WHERE bitmap_number = ?', [bitmapNumber]);
};

export const incrementMintCount = async (deployId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run('UPDATE deploys SET current_mint_count = current_mint_count + 1 WHERE id = ?', [deployId]);
};

export const insertDeploy = async (deploy: Deploy): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    'INSERT INTO deploys (id, source_id, name, max, price, block_height, inscription_index, timestamp, current_wallet, deployer_address, current_mint_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      deploy.id,
      deploy.source_id,
      deploy.name,
      deploy.max,
      deploy.price,
      deploy.block_height,
      deploy.inscription_index,
      deploy.timestamp,
      deploy.current_wallet,
      deploy.deployer_address,
      deploy.current_mint_count,
    ]
  );
};

export const insertMint = async (mint: Mint): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    'INSERT INTO mints (id, deploy_id, block_height, inscription_index, timestamp, current_wallet) VALUES (?, ?, ?, ?, ?, ?)',
    [mint.id, mint.deploy_id, mint.block_height, mint.inscription_index, mint.timestamp, mint.current_wallet]
  );
};

export const insertBitmap = async (bitmap: Bitmap): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    'INSERT INTO bitmaps (inscription_id, bitmap_number, content, block_height, inscription_index, timestamp, current_wallet) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      bitmap.inscription_id,
      bitmap.bitmap_number,
      bitmap.content,
      bitmap.block_height,
      bitmap.inscription_index,
      bitmap.timestamp,
      bitmap.current_wallet,
    ]
  );
};

export const insertTransfer = async (transfer: Transfer): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    'INSERT INTO transfers (inscription_id, from_wallet, to_wallet, block_height, timestamp) VALUES (?, ?, ?, ?, ?)',
    [transfer.inscription_id, transfer.from_wallet, transfer.to_wallet, transfer.block_height, transfer.timestamp]
  );
};

export const getWalletHistory = async (inscriptionId: string): Promise<Transfer[]> => {
  if (!db) throw new Error('Database not initialized');
  return db.all<Transfer[]>('SELECT * FROM transfers WHERE inscription_id = ? ORDER BY block_height ASC', [inscriptionId]);
};

export const getCurrentWallet = async (inscriptionId: string): Promise<string | null> => {
  if (!db) throw new Error('Database not initialized');
  const deploy = await db.get<{ current_wallet: string }>('SELECT current_wallet FROM deploys WHERE id = ?', [inscriptionId]);
  if (deploy) return deploy.current_wallet;

  const mint = await db.get<{ current_wallet: string }>('SELECT current_wallet FROM mints WHERE id = ?', [inscriptionId]);
  if (mint) return mint.current_wallet;

  const bitmap = await db.get<{ current_wallet: string }>('SELECT current_wallet FROM bitmaps WHERE inscription_id = ?', [inscriptionId]);
  if (bitmap) return bitmap.current_wallet;

  const parcel = await db.get<{ wallet: string }>('SELECT wallet FROM parcels WHERE inscription_id = ?', [inscriptionId]);
  if (parcel) return parcel.wallet;

  return null;
};

export const getDeploys = async (page: number, limit: number, search: string): Promise<Deploy[]> => {
  if (!db) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  return db.all<Deploy[]>(
    `
    SELECT * FROM deploys
    WHERE name LIKE ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `,
    [`%${search}%`, limit, offset]
  );
};

export const getDeployMints = async (deployId: string, page: number, limit: number): Promise<Mint[]> => {
  if (!db) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  return db.all<Mint[]>(
    `
    SELECT * FROM mints
    WHERE deploy_id = ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `,
    [deployId, limit, offset]
  );
};

export const getBitmaps = async (page: number, limit: number, search: string): Promise<Bitmap[]> => {
  if (!db) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  return db.all<Bitmap[]>(
    `
    SELECT * FROM bitmaps
    WHERE bitmap_number LIKE ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `,
    [`%${search}%`, limit, offset]
  );
};

export const getLatestProcessedBlock = async (): Promise<number> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.get<{ latest_block: number }>('SELECT MAX(block_height) as latest_block FROM processed_blocks');
  return result?.latest_block || 0;
};

export const markBlocksAsProcessed = async (blockHeights: number[]): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  const placeholders = blockHeights.map(() => '(?)').join(',');
  await db.run(`INSERT OR IGNORE INTO processed_blocks (block_height) VALUES ${placeholders}`, blockHeights);
};

export const getUnprocessedBlockRange = async (start: number, end: number): Promise<number[]> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.all<{ x: number }[]>(
    `
    WITH RECURSIVE
    range(x) AS (
      SELECT ? 
      UNION ALL 
      SELECT x+1 FROM range WHERE x < ?
    )
    SELECT x FROM range
    WHERE x NOT IN (SELECT block_height FROM processed_blocks)
    ORDER BY x
  `,
    [start, end - 1]
  );
  return result.map((row) => row.x);
};

// Parcel-related functions
export const insertParcel = async (parcel: Parcel): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    `INSERT INTO parcels (inscription_id, parcel_number, bitmap_number, bitmap_inscription_id, content, address, block_height, timestamp, transaction_count, is_valid, wallet) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      parcel.inscription_id,
      parcel.parcel_number,
      parcel.bitmap_number,
      parcel.bitmap_inscription_id,
      parcel.content,
      parcel.address,
      parcel.block_height,
      parcel.timestamp,
      parcel.transaction_count || null,
      parcel.is_valid ? 1 : 0,
      parcel.wallet,
    ]
  );
};

export const getParcelsByBitmap = async (bitmapNumber: number, page: number = 1, limit: number = 20): Promise<Parcel[]> => {
  if (!db) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  return db.all<Parcel[]>(
    `SELECT * FROM parcels WHERE bitmap_number = ? AND is_valid = 1 ORDER BY parcel_number ASC LIMIT ? OFFSET ?`,
    [bitmapNumber, limit, offset]
  );
};

export const getParcels = async (page: number = 1, limit: number = 20, search: string = ''): Promise<Parcel[]> => {
  if (!db) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  return db.all<Parcel[]>(
    `SELECT * FROM parcels WHERE (parcel_number LIKE ? OR bitmap_number LIKE ?) AND is_valid = 1 ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    [`%${search}%`, `%${search}%`, limit, offset]
  );
};

export const getParcelByInscriptionId = async (inscriptionId: string): Promise<Parcel | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<Parcel>('SELECT * FROM parcels WHERE inscription_id = ?', [inscriptionId]);
};

export const getExistingParcel = async (parcelNumber: number, bitmapNumber: number): Promise<Parcel | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<Parcel>(
    'SELECT * FROM parcels WHERE parcel_number = ? AND bitmap_number = ? ORDER BY block_height ASC, inscription_id ASC LIMIT 1',
    [parcelNumber, bitmapNumber]
  );
};

export const replaceParcel = async (oldInscriptionId: string, newParcel: Parcel): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run('DELETE FROM parcels WHERE inscription_id = ?', [oldInscriptionId]);
  await insertParcel(newParcel);
};

export const getBitmapInscriptionId = async (bitmapNumber: number): Promise<string | null> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.get<{ inscription_id: string }>('SELECT inscription_id FROM bitmaps WHERE bitmap_number = ?', [bitmapNumber]);
  return result?.inscription_id || null;
};

// Block stats functions
export const insertBlockStats = async (stats: BlockStats): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(
    `INSERT OR REPLACE INTO block_stats (block_height, total_transactions, total_inscriptions, deploys_count, mints_count, bitmaps_count, parcels_count, processed_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      stats.block_height,
      stats.total_transactions,
      stats.total_inscriptions,
      stats.deploys_count,
      stats.mints_count,
      stats.bitmaps_count,
      stats.parcels_count,
      stats.processed_at,
    ]
  );
};

export const getBlockStats = async (blockHeight: number): Promise<BlockStats | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<BlockStats>('SELECT * FROM block_stats WHERE block_height = ?', [blockHeight]);
};

export const updateInscriptionWallet = async (inscriptionId: string, newWallet: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run('UPDATE deploys SET current_wallet = ? WHERE id = ?', [newWallet, inscriptionId]);
  await db.run('UPDATE mints SET current_wallet = ? WHERE id = ?', [newWallet, inscriptionId]);
  await db.run('UPDATE bitmaps SET current_wallet = ? WHERE inscription_id = ?', [newWallet, inscriptionId]);
  await db.run('UPDATE parcels SET wallet = ? WHERE inscription_id = ?', [newWallet, inscriptionId]);
};

export { db };