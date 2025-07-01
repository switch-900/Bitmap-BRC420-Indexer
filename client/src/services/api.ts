import axios from 'axios';
import { Deploy, Mint, Bitmap, Parcel } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getDeploys = async (page: number = 1, limit: number = 20, search: string = ''): Promise<Deploy[]> => {
  const response = await axios.get(`${API_BASE_URL}/deploys/with-mints`, {
    params: { page, limit, search }
  });
  return response.data;
};

export const getDeployDetails = async (deployId: string): Promise<Deploy> => {
  const response = await axios.get(`${API_BASE_URL}/deploy/${deployId}/summary`);
  return response.data;
};

export const getDeployMints = async (deployId: string, page: number = 1, limit: number = 20): Promise<Mint[]> => {
  const response = await axios.get(`${API_BASE_URL}/deploy/${deployId}/mints`, {
    params: { page, limit }
  });
  return response.data;
};

export const getBitmaps = async (page: number = 1, limit: number = 20, search: string = ''): Promise<Bitmap[]> => {
  const response = await axios.get(`${API_BASE_URL}/bitmaps`, {
    params: { page, limit, search }
  });
  return response.data;
};

export const getParcels = async (page: number = 1, limit: number = 20, search: string = ''): Promise<Parcel[]> => {
  const response = await axios.get(`${API_BASE_URL}/parcels`, {
    params: { page, limit, search }
  });
  return response.data;
};

export const getParcelsByBitmap = async (bitmapNumber: number, page: number = 1, limit: number = 20): Promise<Parcel[]> => {
  const response = await axios.get(`${API_BASE_URL}/bitmap/${bitmapNumber}/parcels`, {
    params: { page, limit }
  });
  return response.data;
};

export const getParcelDetails = async (inscriptionId: string): Promise<Parcel> => {
  const response = await axios.get(`${API_BASE_URL}/parcel/${inscriptionId}`);
  return response.data;
};