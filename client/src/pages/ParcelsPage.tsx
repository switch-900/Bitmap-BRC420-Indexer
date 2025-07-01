import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import AllParcelsList from '../components/AllParcelsList';

const ParcelsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="parcels-page">
      <h1>All Parcels</h1>
      <SearchBar onSearch={handleSearch} />
      <AllParcelsList searchQuery={searchQuery} />
    </div>
  );
};

export default ParcelsPage;
