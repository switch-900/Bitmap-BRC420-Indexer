import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBitmaps } from '../services/api';
import { Bitmap } from '../types';
import ParcelsList from './ParcelsList';

const BitmapDetails: React.FC = () => {
  const { bitmapNumber } = useParams<{ bitmapNumber: string }>();
  const [bitmap, setBitmap] = useState<Bitmap | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'parcels'>('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBitmapDetails();
  }, [bitmapNumber]);

  const loadBitmapDetails = async () => {
    if (!bitmapNumber) return;
    
    setLoading(true);
    try {
      // Search for the bitmap by number
      const bitmaps = await getBitmaps(1, 1, bitmapNumber);
      if (bitmaps.length > 0) {
        setBitmap(bitmaps[0]);
      }
    } catch (error) {
      console.error('Error loading bitmap details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading bitmap details...</div>;
  if (!bitmap) return <div>Bitmap not found.</div>;

  return (
    <div className="bitmap-details">
      <h2>Bitmap #{bitmap.bitmap_number}</h2>
      
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'parcels' ? 'active' : ''}`}
          onClick={() => setActiveTab('parcels')}
        >
          Parcels
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'details' && (
          <div className="bitmap-info">
            <div className="info-section">
              <h3>Bitmap Information</h3>
              <p><strong>Inscription ID:</strong> {bitmap.inscription_id}</p>
              <p><strong>Content:</strong> {bitmap.content}</p>
              <p><strong>Current Owner:</strong> {bitmap.wallet}</p>
              <p><strong>Original Address:</strong> {bitmap.address}</p>
              <p><strong>Block Height:</strong> {bitmap.block_height}</p>
              <p><strong>Timestamp:</strong> {new Date(bitmap.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'parcels' && (
          <ParcelsList bitmapNumber={bitmap.bitmap_number} />
        )}
      </div>
    </div>
  );
};

export default BitmapDetails;
