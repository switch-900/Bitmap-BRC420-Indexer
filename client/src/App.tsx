
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DeployPage from './pages/DeployPage';
import BitmapsPage from './pages/BitmapsPage';
import BitmapDetailsPage from './pages/BitmapDetailsPage';
import ParcelsPage from './pages/ParcelsPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deploy/:id" element={<DeployPage />} />
          <Route path="/bitmaps" element={<BitmapsPage />} />
          <Route path="/bitmap/:bitmapNumber" element={<BitmapDetailsPage />} />
          <Route path="/parcels" element={<ParcelsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;