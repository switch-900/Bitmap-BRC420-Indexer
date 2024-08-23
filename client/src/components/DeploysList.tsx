
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDeploys } from '../services/api';
import { Deploy } from '../types';

interface DeploysListProps {
  searchQuery: string;
}

const DeploysList: React.FC<DeploysListProps> = ({ searchQuery }) => {
  const [deploys, setDeploys] = useState<Deploy[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDeploys([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useEffect(() => {
    loadDeploys();
  }, [page, searchQuery]);

  const loadDeploys = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getDeploys(page, 20, searchQuery);
      setDeploys(prev => page === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading deploys:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deploys-list">
      {deploys.map(deploy => (
        <Link key={deploy.id} to={`/deploy/${deploy.id}`} className="deploy-item">
          <h3>{deploy.name}</h3>
          <p>Total Mints: {deploy.total_mints}</p>
          <p>Max Mints: {deploy.max}</p>
        </Link>
      ))}
      {!loading && hasMore && <button onClick={loadDeploys}>Load More</button>}
      {loading && <p>Loading...</p>}
      {!loading && deploys.length === 0 && <p>No deploys found.</p>}
    </div>
  );
};

export default DeploysList;