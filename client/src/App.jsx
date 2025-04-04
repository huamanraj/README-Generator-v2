// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratedReadmePage from './pages/GeneratedReadmePage';
import DetailsPage from './pages/DetailsPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/details" element={<DetailsPage />} />
          <Route path="/generated" element={<GeneratedReadmePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;