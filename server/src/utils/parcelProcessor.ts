import axios from 'axios';
import { Parcel } from '../types';
import { getBitmapInscriptionId, getExistingParcel, insertParcel, replaceParcel, getBlockStats, insertBlockStats } from '../db/database';
import logger from './logger';

// Load Umbrel configuration
let umbrelConfig: any;
try {
    umbrelConfig = require('../config/umbrel.js');
} catch (error) {
    logger.debug('Umbrel config not found, using environment variables');
}

const API_URL = umbrelConfig?.getApiUrl() || process.env.API_URL || 'http://ordinals_web_1:4000';

export interface ParcelData {
  parcelNumber: number;
  bitmapNumber: number;
}

export const parseParcelContent = (content: string): ParcelData | null => {
  const parts = content.trim().split('.');
  if (parts.length !== 3 || parts[2] !== 'bitmap') {
    return null;
  }
  
  const parcelNumber = parseInt(parts[0], 10);
  const bitmapNumber = parseInt(parts[1], 10);
  
  if (isNaN(parcelNumber) || isNaN(bitmapNumber) || parcelNumber < 0 || bitmapNumber < 0) {
    return null;
  }
  
  return { parcelNumber, bitmapNumber };
};

export const validateParcelProvenance = async (parcelInscriptionId: string, bitmapInscriptionId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/children/${bitmapInscriptionId}`, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });

    const children = response.data.ids || [];
    const isValidChild = children.includes(parcelInscriptionId);
    
    logger.info(`Parcel provenance validation for ${parcelInscriptionId}: ${isValidChild ? 'VALID' : 'INVALID'} (parent: ${bitmapInscriptionId})`);
    return isValidChild;

  } catch (error) {
    logger.error(`Error validating parcel provenance for ${parcelInscriptionId}:`, { message: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};

export const getBlockTransactionCount = async (blockHeight: number): Promise<number | null> => {
  try {
    // First check if we have it cached in our database
    const cachedStats = await getBlockStats(blockHeight);
    if (cachedStats) {
      logger.debug(`Using cached transaction count for block ${blockHeight}: ${cachedStats.total_transactions}`);
      return cachedStats.total_transactions;
    }

    // Use Umbrel internal mempool service for block info
    const config = require('../config/umbrel');
    const mempoolApiUrl = config.getMempoolApiUrl();
    
    try {
      const hashResponse = await axios.get(`${mempoolApiUrl}/block-height/${blockHeight}`, { 
        timeout: config.API_TIMEOUT 
      });
      const blockHash = hashResponse.data;

      const blockResponse = await axios.get(`${mempoolApiUrl}/block/${blockHash}`, { 
        timeout: config.API_TIMEOUT 
      });
      const transactionCount = blockResponse.data.tx_count;

      // Cache the result
      await insertBlockStats({
        block_height: blockHeight,
        total_transactions: transactionCount,
        total_inscriptions: 0,
        deploys_count: 0,
        mints_count: 0,
        bitmaps_count: 0,
        parcels_count: 0,
        processed_at: Date.now()
      });

      return transactionCount;
    } catch (error) {
      logger.error(`Error fetching block info for height ${blockHeight} from Umbrel mempool service:`, { message: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
    return null;
  } catch (error) {
    logger.error(`Error getting transaction count for block ${blockHeight}:`, { message: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
};

export const processParcel = async (
  inscriptionId: string,
  content: string,
  address: string,
  blockHeight: number,
  timestamp: number
): Promise<boolean> => {
  try {
    // Parse parcel content
    const parcelData = parseParcelContent(content);
    if (!parcelData) {
      logger.debug(`Invalid parcel content format: ${content}`);
      return false;
    }

    // Check if referenced bitmap exists
    const bitmapInscriptionId = await getBitmapInscriptionId(parcelData.bitmapNumber);
    if (!bitmapInscriptionId) {
      logger.debug(`Referenced bitmap ${parcelData.bitmapNumber} not found for parcel ${inscriptionId}`);
      return false;
    }

    // Validate parcel provenance
    const isValidChild = await validateParcelProvenance(inscriptionId, bitmapInscriptionId);
    if (!isValidChild) {
      logger.debug(`Parcel ${inscriptionId} is not a valid child of bitmap ${bitmapInscriptionId}`);
      return false;
    }

    // Get transaction count for validation (optional)
    const transactionCount = await getBlockTransactionCount(blockHeight);

    // Check for existing parcel with same number
    const existingParcel = await getExistingParcel(parcelData.parcelNumber, parcelData.bitmapNumber);
    
    const newParcel: Parcel = {
      inscription_id: inscriptionId,
      parcel_number: parcelData.parcelNumber,
      bitmap_number: parcelData.bitmapNumber,
      bitmap_inscription_id: bitmapInscriptionId,
      content,
      address,
      block_height: blockHeight,
      timestamp,
      transaction_count: transactionCount || undefined,
      is_valid: true,
      wallet: address
    };

    if (existingParcel) {
      // Apply tie-breaker rules
      const shouldReplace = 
        blockHeight < existingParcel.block_height || 
        (blockHeight === existingParcel.block_height && inscriptionId < existingParcel.inscription_id);
      
      if (shouldReplace) {
        logger.info(`Replacing parcel ${existingParcel.inscription_id} with ${inscriptionId} for parcel ${parcelData.parcelNumber} of bitmap ${parcelData.bitmapNumber}`);
        await replaceParcel(existingParcel.inscription_id, newParcel);
      } else {
        logger.info(`Parcel ${inscriptionId} loses tie-breaker to existing parcel ${existingParcel.inscription_id} for parcel ${parcelData.parcelNumber} of bitmap ${parcelData.bitmapNumber}`);
        // Still insert as invalid for tracking purposes
        newParcel.is_valid = false;
        await insertParcel(newParcel);
      }
    } else {
      // No existing parcel, insert as valid
      await insertParcel(newParcel);
      logger.info(`Parcel ${inscriptionId} saved as valid parcel ${parcelData.parcelNumber} for bitmap ${parcelData.bitmapNumber}`);
    }

    return true;
  } catch (error) {
    logger.error(`Error processing parcel ${inscriptionId}:`, { message: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};
