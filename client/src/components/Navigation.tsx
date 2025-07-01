import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <Link to="/">Home</Link>
      <Link to="/bitmaps">Bitmaps</Link>
      <Link to="/parcels">Parcels</Link>
    </nav>
  );
};

export default Navigation;