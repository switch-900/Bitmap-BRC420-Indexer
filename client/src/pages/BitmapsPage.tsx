
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import BitmapsList from '../components/BitmapsList';

const BitmapsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="bitmaps-page">
      <h1>Bitmaps</h1>
      <SearchBar onSearch={handleSearch} />
      <BitmapsList searchQuery={searchQuery} />
    </div>
  );
};

export default BitmapsPage;