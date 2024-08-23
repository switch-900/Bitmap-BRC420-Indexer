import axios from 'axios';
import {
    insertDeploy, insertMint, insertBitmap, getDeployById, getMintCount, getBitmapByNumber, 
    getCurrentWallet, updateInscriptionWallet, insertTransfer, getDeployBySourceInscription, 
    incrementMintCount, setupDatabase
} from '../db/database';
import { validateDeploy, validateMint, validateBitmap } from './validation';
import { Deploy, Mint, Bitmap, Transfer } from '../types';
import logger from './logger';

const API_URL = process.env.API_URL || 'http://192.168.1.66:4000';
const API_WALLET_URL = process.env.API_WALLET_URL || 'http://192.168.1.66:3006/api';


let databaseInitialized = false;

const initializeDatabase = async () => {
    if (!databaseInitialized) {
        await setupDatabase();
        databaseInitialized = true;
    }
};



const fetchBlockData = async (blockHeight: number) => {
    try {
        const response = await axios.get(`${API_URL}/block/${blockHeight}`, {
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    } catch (error) {
        logger.error(`Error fetching block data for block ${blockHeight}:`, { message: (error as any).message });
        throw error;
    }
};

const fetchInscriptionContent = async (inscriptionId: string) => {
    try {
        const response = await axios.get(`${API_URL}/content/${inscriptionId}`, {
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    } catch (error) {
        logger.error(`Error fetching inscription content for ID ${inscriptionId}:`, { error, inscriptionId });
        throw error;
    }
};

const getWalletInfo = async (inscriptionId: string) => {
    const txId = inscriptionId.replace(/i\d+$/, '');
    try {
        const response = await axios.get(`${API_URL}/output/${txId}:0`, {
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    } catch (error) {
        logger.error(`Error fetching wallet info for inscription ID ${inscriptionId}:`, { error, inscriptionId });
        throw error;
    }
};

const handleTransfer = async (inscriptionId: string, newWallet: string, blockHeight: number) => {
    const currentWallet = await getCurrentWallet(inscriptionId);
    if (currentWallet && currentWallet !== newWallet) {
        const transfer: Transfer = {
            inscription_id: inscriptionId,
            from_wallet: currentWallet,
            to_wallet: newWallet,
            block_height: blockHeight,
            timestamp: Date.now()
        };
        await insertTransfer(transfer);
        await updateInscriptionWallet(inscriptionId, newWallet);
        logger.info(`Processed transfer of inscription ${inscriptionId} from ${currentWallet} to ${newWallet}`);
    }
};

const validateMintPayment = async (mintInscriptionId: string, deploy: Deploy): Promise<boolean> => {
    try {
        const txId = mintInscriptionId.replace(/i\d+$/, '');
        const response = await axios.get(`${API_WALLET_URL}/tx/${txId}`);
        const tx = response.data;

        let totalPaid = 0;
        for (const output of tx.vout) {
            if (output.scriptpubkey_address === deploy.deployer_address) {
                totalPaid += output.value;
            }
        }

        return totalPaid >= deploy.price;
    } catch (error) {
        logger.error(`Error validating payment for mint ${mintInscriptionId}:`, { error, mintInscriptionId});
        return false;
    }
};


export const processBlock = async (blockHeight: number) => {
    await initializeDatabase(); // Ensure database is initialized before processing

    logger.info(`Starting to process block ${blockHeight}`);
    try {
        const blockData = await fetchBlockData(blockHeight);
        logger.info(`Fetched data for block ${blockHeight}, found ${blockData.inscriptions.length} inscriptions`);

        let deployCount = 0, mintCount = 0, bitmapCount = 0;

        for (const [index, inscriptionId] of blockData.inscriptions.entries()) {
            try {
                const content = await fetchInscriptionContent(inscriptionId);
                logger.debug(`Fetched content for inscription ${inscriptionId}`);

                const walletInfo = await getWalletInfo(inscriptionId);

                if (typeof content === 'object' && content.p === 'brc-420') {
                    if (content.op === 'deploy') {
                        const deploy = await processDeploy(content, inscriptionId, blockHeight, index, walletInfo.address);
                        if (deploy) deployCount++;
                    } else if (content.op === 'mint') {
                        const mint = await processMint(content, inscriptionId, blockHeight, index, walletInfo.address);
                        if (mint) mintCount++;
                    }
                } else if (typeof content === 'string') {
                    if (content.startsWith('/content/')) {
                        const mint = await processMint({ id: content.split('/')[2] }, inscriptionId, blockHeight, index, walletInfo.address);
                        if (mint) mintCount++;
                    } else if (content.endsWith('.bitmap')) {
                        const bitmap = await processBitmap(content, inscriptionId, blockHeight, index, walletInfo.address);
                        if (bitmap) bitmapCount++;
                    }
                }

                await handleTransfer(inscriptionId, walletInfo.address, blockHeight);
            } catch (error) {
                logger.error(`Error processing inscription ${inscriptionId} in block ${blockHeight}:`, error);
            }
        }

        logger.info(`Finished processing block ${blockHeight}. Deploys: ${deployCount}, Mints: ${mintCount}, Bitmaps: ${bitmapCount}`);
    } catch (error) {
        logger.error(`Error processing block ${blockHeight}:`, error);
        throw error;
    }
};

const processDeploy = async (content: any, inscriptionId: string, blockHeight: number, index: number, wallet: string): Promise<boolean> => {
    const deploy: Deploy = {
        p: 'brc-420',
        op: 'deploy',
        id: inscriptionId,
        source_id: content.id,
        name: content.name,
        max: parseInt(content.max),
        price: parseFloat(content.price),
        block_height: blockHeight,
        inscription_index: index,
        timestamp: Date.now(),
        current_wallet: wallet,
        deployer_address: wallet,
        current_mint_count: 0
    };

    const { error } = validateDeploy(deploy);
    if (error) {
        logger.error(`Invalid deploy in block ${blockHeight}:`, { error, inscriptionId });
        return false;
    }

    const existingDeploy = await getDeployById(deploy.source_id);
    if (existingDeploy) {
        logger.warn(`Duplicate deploy attempt for source id ${deploy.source_id} in block ${blockHeight}`);
        return false;
    }

    await insertDeploy(deploy);
    logger.info(`Inserted deploy: ${deploy.id}`);
    return true;
};

const processMint = async (content: any, inscriptionId: string, blockHeight: number, index: number, wallet: string): Promise<boolean> => {
    const deployId = content.id;
    const mint: Mint = {
        id: inscriptionId,
        deploy_id: deployId,
        block_height: blockHeight,
        inscription_index: index,
        timestamp: Date.now(),
        current_wallet: wallet
    };

    const { error } = validateMint(mint);
    if (error) {
        logger.error(`Invalid mint in block ${blockHeight}:`, { error, inscriptionId });
        return false;
    }

    const deploy = await getDeployBySourceInscription(mint.deploy_id);
    if (!deploy) {
        logger.warn(`Mint attempt for non-existent deploy with source inscription ${mint.deploy_id} in block ${blockHeight}`);
        return false;
    }

    const currentMintCount = await getMintCount(deploy.id);
    if (currentMintCount >= deploy.max) {
        logger.warn(`Mint attempt exceeds max supply for ${deploy.name} in block ${blockHeight}`);
        return false;
    }

    if (!await validateMintPayment(inscriptionId, deploy)) {
        logger.warn(`Invalid payment for mint ${inscriptionId} in block ${blockHeight}`);
        return false;
    }

    if (!await validateMintContentType(inscriptionId, mint.deploy_id)) {
        logger.warn(`Invalid content type for mint ${inscriptionId} in block ${blockHeight}`);
        return false;
    }

    await insertMint(mint);
    await incrementMintCount(deploy.id);
    logger.info(`Inserted mint: ${mint.id}`);
    return true;
};

const validateMintContentType = async (mintInscriptionId: string, sourceInscriptionId: string): Promise<boolean> => {
    const mintContentType = await getInscriptionContentType(mintInscriptionId);
    const sourceContentType = await getInscriptionContentType(sourceInscriptionId);
    return mintContentType === sourceContentType;
};

const getInscriptionContentType = async (inscriptionId: string): Promise<string> => {
    const response = await axios.get(`${API_URL}/content/${inscriptionId}`, {
        headers: { 'Accept': 'application/json' }
    });
    return response.headers['content-type'];
};

const processBitmap = async (content: string, inscriptionId: string, blockHeight: number, index: number, wallet: string): Promise<boolean> => {
    const bitmap: Bitmap = {
        inscription_id: inscriptionId,
        bitmap_number: parseInt(content.split('.')[0]),
        content: content,
        block_height: blockHeight,
        inscription_index: index,
        timestamp: Date.now(),
        current_wallet: wallet
    };

    const { error } = validateBitmap(bitmap);
    if (error) {
        logger.error(`Invalid bitmap in block ${blockHeight}:`, { error, inscriptionId });
        return false;
    }

    if (bitmap.bitmap_number > blockHeight) {
        logger.warn(`Bitmap number ${bitmap.bitmap_number} is greater than current block ${blockHeight}`);
        return false;
    }

    const existingBitmap = await getBitmapByNumber(bitmap.bitmap_number);
    if (existingBitmap) {
        if (existingBitmap.block_height < blockHeight || 
            (existingBitmap.block_height === blockHeight && existingBitmap.inscription_index < index)) {
            logger.warn(`Duplicate bitmap number ${bitmap.bitmap_number} in block ${blockHeight}`);
            return false;
        }
    }

    await insertBitmap(bitmap);
    logger.info(`Inserted bitmap: ${bitmap.inscription_id}`);
    return true;
};