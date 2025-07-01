import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getParcels } from '../services/api';
import { Parcel } from '../types';

interface AllParcelsListProps {
  searchQuery: string;
}

const AllParcelsList: React.FC<AllParcelsListProps> = ({ searchQuery }) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setParcels([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useEffect(() => {
    loadParcels();
  }, [page, searchQuery]);

  const loadParcels = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getParcels(page, 20, searchQuery);
      setParcels(prev => page === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-parcels-list">
      <div className="parcels-grid">
        {parcels.map(parcel => (
          <div key={parcel.inscription_id} className="parcel-item">
            <h3>
              <Link to={`/bitmap/${parcel.bitmap_number}`}>
                Parcel #{parcel.parcel_number} of Bitmap #{parcel.bitmap_number}
              </Link>
            </h3>
            <p><strong>Inscription ID:</strong> {parcel.inscription_id}</p>
            <p><strong>Current Owner:</strong> {parcel.wallet}</p>
            <p><strong>Block Height:</strong> {parcel.block_height}</p>
            <p><strong>Timestamp:</strong> {new Date(parcel.timestamp).toLocaleString()}</p>
            <p><strong>Status:</strong> {parcel.is_valid ? '✅ Valid' : '❌ Invalid'}</p>
            {parcel.transaction_count && (
              <p><strong>Block TX Count:</strong> {parcel.transaction_count}</p>
            )}
          </div>
        ))}
      </div>
      
      {!loading && hasMore && (
        <button onClick={loadParcels} className="load-more-btn">
          Load More
        </button>
      )}
      
      {loading && <p>Loading...</p>}
      {!loading && parcels.length === 0 && <p>No parcels found.</p>}
    </div>
  );
};

export default AllParcelsList;
