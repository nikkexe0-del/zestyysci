import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScienceAndFun from './components/ScienceAndFun';
import Leaderboard from './components/Leaderboard';
import AdminDashboard from './components/AdminDashboard';
import TelegramPopup from './components/TelegramPopup';

// ============================================
// ZESTYYSCI - NO LOGIN REQUIRED
// All course data from configurable API Base URL
// ============================================

const App = () => {
  const [activeSection, setActiveSection] = useState('scienceandfun');
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);

  // Show Telegram popup once per session
  useEffect(() => {
    const telegramShown = sessionStorage.getItem('telegramPopupShown');
    if (!telegramShown) {
      setTimeout(() => {
        setShowTelegramPopup(true);
      }, 2000);
    }
  }, []);

  const handleTelegramPopupClose = () => {
    setShowTelegramPopup(false);
    sessionStorage.setItem('telegramPopupShown', 'true');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'scienceandfun':
        return <ScienceAndFun />;
      case 'leaderboard':
        return <Leaderboard currentUser={null} userData={null} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <ScienceAndFun />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {renderContent()}

      {/* Telegram Popup */}
      {showTelegramPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99998,
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <TelegramPopup onClose={handleTelegramPopupClose} />
        </div>
      )}
    </div>
  );
};

export default App;
