
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import DeploysList from '../components/DeploysList';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="home-page">
      <h1>Bitmap420</h1>
      <SearchBar onSearch={handleSearch} />
      <DeploysList searchQuery={searchQuery} />
    </div>
  );
};

export default HomePage;