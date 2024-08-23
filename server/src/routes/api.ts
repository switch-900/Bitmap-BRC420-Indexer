import express from 'express';
import { getDeploys, getDeployById, getDeployMints, getBitmaps, getBitmapByNumber, getWalletHistory } from '../db/database';

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

export default router;