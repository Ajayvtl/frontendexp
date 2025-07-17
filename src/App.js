import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Blocks from './pages/Blocks';
import BlockDetails from './pages/BlockDetails';
import Transactions from './pages/Transactions';
import TransactionDetails from './pages/TransactionDetails';
import Tokens from './pages/Tokens'; // Import Tokens component
import AccountDetails from './pages/AccountDetails'; // Import AccountDetails component
import Swap from './pages/Swap'; // Import Swap component
import './App.css'; // For general app layout and styling
import './utils/i18n'; // Import i18n configuration
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

function App() {
  const { i18n } = useTranslation(); // Initialize useTranslation

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <div className="app-container">
        <Header changeLanguage={changeLanguage} currentLanguage={i18n.language} />
        <div className="main-content">
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/blocks" element={<Blocks />} />
              <Route path="/block/:id" element={<BlockDetails />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/tx/:hash" element={<TransactionDetails />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/address/:address" element={<AccountDetails />} /> {/* Route for account details */}
              {/* Add routes for accounts, etc. later */}
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
