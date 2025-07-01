
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDeployDetails, getDeployMints } from '../services/api';
import { Deploy, Mint } from '../types';

const DeployDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [mints, setMints] = useState<Mint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadDeployDetails();
    loadDeployMints();
  }, [id]);

  const loadDeployDetails = async () => {
    if (!id) return;
    try {
      const data = await getDeployDetails(id);
      setDeploy(data);
    } catch (error) {
      console.error('Error loading deploy details:', error);
    }
  };

  const loadDeployMints = async () => {
    if (!hasMore || !id) return;
    setLoading(true);
    try {
      const data = await getDeployMints(id, page);
      setMints(prev => [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading deploy mints:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!id) return <div>Invalid deploy ID</div>;

  if (!deploy) return <div>Loading...</div>;

  return (
    <div className="deploy-details">
      <h2>{deploy.name}</h2>
      <p>ID: {deploy.id}</p>
      <p>Max Mints: {deploy.max}</p>
      <p>Price: {deploy.price}</p>
      <p>Deployer Address: {deploy.deployer_address}</p>
      <p>Total Mints: {deploy.total_mints}</p>
      <h3>Mints</h3>
      <ul className="mints-list">
        {mints.map(mint => (
          <li key={mint.id}>
            <p>Mint ID: {mint.id}</p>
            <p>Mint Address: {mint.mint_address}</p>
            <p>Timestamp: {new Date(mint.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {!loading && hasMore && <button onClick={loadDeployMints}>Load More Mints</button>}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default DeployDetails;