import Joi from 'joi';
import { Deploy, Mint, Bitmap, Parcel } from '../types';

export const deploySchema = Joi.object<Deploy>({
  p: Joi.string().valid('brc-420').required(),
  op: Joi.string().valid('deploy').required(),
  id: Joi.string().required(),
  source_id: Joi.string().required(),
  name: Joi.string().max(128).required(),
  max: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0.00000420).required(),
  block_height: Joi.number().integer().min(0).required(),
  inscription_index: Joi.number().integer().min(0).required(),
  timestamp: Joi.number().integer().min(0).required(),
  current_wallet: Joi.string().required(),
  deployer_address: Joi.string().required(),
  current_mint_count: Joi.number().integer().min(0).default(0)
});

export const mintSchema = Joi.object<Mint>({
  id: Joi.string().required(),
  deploy_id: Joi.string().required(),
  block_height: Joi.number().integer().min(0).required(),
  inscription_index: Joi.number().integer().min(0).required(),
  timestamp: Joi.number().integer().min(0).required(),
  current_wallet: Joi.string().required()
});

export const bitmapSchema = Joi.object<Bitmap>({
  inscription_id: Joi.string().required(),
  bitmap_number: Joi.number().integer().min(0).required(),
  content: Joi.string().pattern(/^\d+\.bitmap$/).required(),
  block_height: Joi.number().integer().min(0).required(),
  inscription_index: Joi.number().integer().min(0).required(),
  timestamp: Joi.number().integer().min(0).required(),
  current_wallet: Joi.string().required()
});

export const parcelSchema = Joi.object<Parcel>({
  inscription_id: Joi.string().required(),
  parcel_number: Joi.number().integer().min(0).required(),
  bitmap_number: Joi.number().integer().min(0).required(),
  bitmap_inscription_id: Joi.string().required(),
  content: Joi.string().pattern(/^\d+\.\d+\.bitmap$/).required(),
  address: Joi.string().required(),
  block_height: Joi.number().integer().min(0).required(),
  timestamp: Joi.number().integer().min(0).required(),
  transaction_count: Joi.number().integer().min(0).optional(),
  is_valid: Joi.boolean().required(),
  wallet: Joi.string().required()
});

export const validateDeploy = (data: any) => deploySchema.validate(data);
export const validateMint = (data: any) => mintSchema.validate(data);
export const validateBitmap = (data: any) => bitmapSchema.validate(data);
export const validateParcel = (data: any) => parcelSchema.validate(data);