import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { processBlock } from '../utils/blockProcessor';
import { getLatestProcessedBlock, markBlocksAsProcessed, getUnprocessedBlockRange } from '../db/database';
import logger from '../utils/logger';

const BATCH_SIZE = 100; // Process 100 blocks at a time
const MAX_WORKERS = 4; // Use 4 workers for parallel processing
const RETRY_DELAY = 5000; // 5 seconds delay before retrying

export const startBlockProcessing = async () => {
  logger.info('Starting block processing');
  const startBlock = await getLatestProcessedBlock() || parseInt(process.env.START_BLOCK || '792435', 10);
  let currentBlock = startBlock;

  const processNextBatch = async () => {
    const endBlock = currentBlock + BATCH_SIZE;
    logger.info(`Processing blocks from ${currentBlock} to ${endBlock}`);
    const unprocessedBlocks = await getUnprocessedBlockRange(currentBlock, endBlock);

    if (unprocessedBlocks.length === 0) {
      logger.info(`All blocks up to ${endBlock} have been processed.`);
      currentBlock = endBlock;
      setTimeout(processNextBatch, 1000); // Wait 1 second before checking for new blocks
      return;
    }

    const workerPromises = [];
    for (let i = 0; i < MAX_WORKERS; i++) {
      const workerBlocks = unprocessedBlocks.filter((_: number, index: number) => index % MAX_WORKERS === i);
      if (workerBlocks.length > 0) {
        workerPromises.push(createWorker(workerBlocks));
      }
    }

    try {
      const results = await Promise.all(workerPromises);
      await markBlocksAsProcessed(unprocessedBlocks);
      currentBlock = Math.max(...unprocessedBlocks) + 1;

      // Aggregate and log results
      const totalInscriptions = results.reduce((sum, r) => sum + r.inscriptions, 0);
      const totalBitmaps = results.reduce((sum, r) => sum + r.bitmaps, 0);
      const totalDeploys = results.reduce((sum, r) => sum + r.deploys, 0);
      const totalMints = results.reduce((sum, r) => sum + r.mints, 0);
      const totalParcels = results.reduce((sum, r) => sum + r.parcels, 0);

      logger.info(`Batch processed. Blocks: ${unprocessedBlocks.length}, Total Inscriptions: ${totalInscriptions}, Bitmaps: ${totalBitmaps}, Deploys: ${totalDeploys}, Mints: ${totalMints}, Parcels: ${totalParcels}`);

      processNextBatch();
    } catch (error) {
      logger.error('Error processing batch:', error);
      setTimeout(processNextBatch, RETRY_DELAY); // Retry after delay
    }
  };

  processNextBatch();
};

const createWorker = (blocks: number[]): Promise<{ inscriptions: number, bitmaps: number, deploys: number, mints: number, parcels: number }> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { blocks } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

if (!isMainThread) {
  const { blocks } = workerData;
  Promise.all(blocks.map(processBlock))
    .then((results) => {
      const aggregatedResults = results.reduce((acc, result) => {
        acc.inscriptions += result.inscriptions;
        acc.bitmaps += result.bitmaps;
        acc.deploys += result.deploys;
        acc.mints += result.mints;
        acc.parcels += result.parcels;
        return acc;
      }, { inscriptions: 0, bitmaps: 0, deploys: 0, mints: 0, parcels: 0 });
      parentPort?.postMessage(aggregatedResults);
    })
    .catch((error) => parentPort?.postMessage({ success: false, error: error.message }));
}