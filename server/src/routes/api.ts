import express from 'express';
import { getDeploys, getDeployById, getDeployMints, getBitmaps, getBitmapByNumber, getWalletHistory, getParcels, getParcelsByBitmap, getParcelByInscriptionId } from '../db/database';

const router = express.Router();

router.get('/deploys', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const deploys = await getDeploys(Number(page), Number(limit), String(search));
    res.json(deploys);
  } catch (error) {
    next(error);
  }
});

// Add the with-mints endpoint that the client expects
router.get('/deploys/with-mints', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const deploys = await getDeploys(Number(page), Number(limit), String(search));
    
    // Add mint count to each deploy
    const deploysWithMints = await Promise.all(deploys.map(async (deploy) => {
      // The current_mint_count should already be in the deploy object from database
      return {
        ...deploy,
        total_mints: deploy.current_mint_count || 0
      };
    }));
    
    res.json(deploysWithMints);
  } catch (error) {
    next(error);
  }
});

router.get('/deploy/:deploy_id', async (req, res, next) => {
  try {
    const { deploy_id } = req.params;
    const deploy = await getDeployById(deploy_id);
    if (!deploy) {
      return res.status(404).json({ error: 'Deploy not found' });
    }
    res.json(deploy);
  } catch (error) {
    next(error);
  }
});

// Add deploy summary endpoint
router.get('/deploy/:deploy_id/summary', async (req, res, next) => {
  try {
    const { deploy_id } = req.params;
    const deploy = await getDeployById(deploy_id);
    if (!deploy) {
      return res.status(404).json({ error: 'Deploy not found' });
    }
    
    // Format for client compatibility
    const summary = {
      id: deploy.id,
      name: deploy.name,
      max: deploy.max,
      price: deploy.price,
      deployer_address: deploy.deployer_address,
      total_mints: deploy.current_mint_count,
      block_height: deploy.block_height,
      timestamp: deploy.timestamp,
      source_id: deploy.source_id,
      wallet: deploy.current_wallet
    };
    
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/deploy/:deploy_id/mints', async (req, res, next) => {
  try {
    const { deploy_id } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const mints = await getDeployMints(deploy_id, Number(page), Number(limit));
    res.json(mints);
  } catch (error) {
    next(error);
  }
});

router.get('/bitmaps', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const bitmaps = await getBitmaps(Number(page), Number(limit), String(search));
    res.json(bitmaps);
  } catch (error) {
    next(error);
  }
});

router.get('/bitmap/:bitmap_number', async (req, res, next) => {
  try {
    const { bitmap_number } = req.params;
    const bitmap = await getBitmapByNumber(Number(bitmap_number));
    if (!bitmap) {
      return res.status(404).json({ error: 'Bitmap not found' });
    }
    res.json(bitmap);
  } catch (error) {
    next(error);
  }
});

router.get('/wallet/:inscription_id/history', async (req, res, next) => {
  try {
    const { inscription_id } = req.params;
    const history = await getWalletHistory(inscription_id);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Parcel routes
router.get('/parcels', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const parcels = await getParcels(Number(page), Number(limit), String(search));
    res.json(parcels);
  } catch (error) {
    next(error);
  }
});

router.get('/parcel/:inscription_id', async (req, res, next) => {
  try {
    const { inscription_id } = req.params;
    const parcel = await getParcelByInscriptionId(inscription_id);
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    res.json(parcel);
  } catch (error) {
    next(error);
  }
});

router.get('/bitmap/:bitmap_number/parcels', async (req, res, next) => {
  try {
    const { bitmap_number } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const parcels = await getParcelsByBitmap(Number(bitmap_number), Number(page), Number(limit));
    res.json(parcels);
  } catch (error) {
    next(error);
  }
});

export default router;