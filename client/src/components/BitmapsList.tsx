
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBitmaps } from '../services/api';
import { Bitmap } from '../types';

interface BitmapsListProps {
  searchQuery: string;
}

const BitmapsList: React.FC<BitmapsListProps> = ({ searchQuery }) => {
  const [bitmaps, setBitmaps] = useState<Bitmap[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setBitmaps([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useEffect(() => {
    loadBitmaps();
  }, [page, searchQuery]);

  const loadBitmaps = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getBitmaps(page, 20, searchQuery);
      setBitmaps(prev => page === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading bitmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bitmaps-list">
      {bitmaps.map(bitmap => (
        <Link key={bitmap.inscription_id} to={`/bitmap/${bitmap.bitmap_number}`} className="bitmap-item">
          <h3>Bitmap #{bitmap.bitmap_number}</h3>
          <p>Inscription ID: {bitmap.inscription_id}</p>
          <p>Address: {bitmap.address}</p>
          <p>Current Owner: {bitmap.wallet}</p>
          <p>Timestamp: {new Date(bitmap.timestamp).toLocaleString()}</p>
        </Link>
      ))}
      {!loading && hasMore && <button onClick={loadBitmaps}>Load More</button>}
      {loading && <p>Loading...</p>}
      {!loading && bitmaps.length === 0 && <p>No bitmaps found.</p>}
    </div>
  );
};

export default BitmapsList;