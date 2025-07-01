import React, { useEffect, useState } from 'react';
import { getParcelsByBitmap } from '../services/api';
import { Parcel } from '../types';

interface ParcelsListProps {
  bitmapNumber: number;
}

const ParcelsList: React.FC<ParcelsListProps> = ({ bitmapNumber }) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setParcels([]);
    setPage(1);
    setHasMore(true);
    loadParcels(1);
  }, [bitmapNumber]);

  const loadParcels = async (pageNum: number = page) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getParcelsByBitmap(bitmapNumber, pageNum, 20);
      setParcels(prev => pageNum === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
      if (data.length > 0) {
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error('Error loading parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadParcels();
  };

  return (
    <div className="parcels-list">
      <h3>Parcels for Bitmap #{bitmapNumber}</h3>
      {parcels.length > 0 ? (
        <div className="parcels-grid">
          {parcels.map(parcel => (
            <div key={parcel.inscription_id} className="parcel-item">
              <h4>Parcel #{parcel.parcel_number}</h4>
              <p><strong>Inscription ID:</strong> {parcel.inscription_id}</p>
              <p><strong>Owner:</strong> {parcel.wallet}</p>
              <p><strong>Block Height:</strong> {parcel.block_height}</p>
              <p><strong>Timestamp:</strong> {new Date(parcel.timestamp).toLocaleString()}</p>
              <p><strong>Valid:</strong> {parcel.is_valid ? '✅ Yes' : '❌ No'}</p>
              {parcel.transaction_count && (
                <p><strong>Block TX Count:</strong> {parcel.transaction_count}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No parcels found for this bitmap.</p>
      )}
      
      {!loading && hasMore && parcels.length > 0 && (
        <button onClick={handleLoadMore} className="load-more-btn">
          Load More Parcels
        </button>
      )}
      
      {loading && <p>Loading parcels...</p>}
    </div>
  );
};

export default ParcelsList;
