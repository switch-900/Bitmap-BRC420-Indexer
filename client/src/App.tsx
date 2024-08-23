
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DeployPage from './pages/DeployPage';
import BitmapsPage from './pages/BitmapsPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deploy/:id" element={<DeployPage />} />
          <Route path="/bitmaps" element={<BitmapsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;