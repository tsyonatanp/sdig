import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import CompleteProfile from './components/CompleteProfile';
import MainApp from './components/MainApp';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('check');
  const [buildingId, setBuildingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = () => {
    const storedBuildingId = localStorage.getItem('building_id');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (storedBuildingId) {
      setBuildingId(storedBuildingId);
      setIsAdmin(storedIsAdmin);
      setCurrentStep('main');
    } else {
      setCurrentStep('registration');
    }
  };

  const handleRegistrationComplete = (newBuildingId, adminStatus) => {
    setBuildingId(newBuildingId);
    setIsAdmin(adminStatus);
    setCurrentStep('profile');
  };

  const handleProfileComplete = () => {
    setCurrentStep('main');
  };

  const handleLogout = () => {
    localStorage.clear();
    setBuildingId(null);
    setIsAdmin(false);
    setCurrentStep('registration');
  };

  // אם המשתמש לא רשום עדיין
  if (currentStep === 'registration') {
    return <Registration onComplete={handleRegistrationComplete} />;
  }

  // אם המשתמש רשום אבל לא השלים את הפרופיל
  if (currentStep === 'profile') {
    return <CompleteProfile buildingId={buildingId} onComplete={handleProfileComplete} />;
  }

  // אם המשתמש רשום והשלים את הפרופיל - הצג את האפליקציה הראשית עם רוטינג
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <MainApp 
                buildingId={buildingId} 
                isAdmin={isAdmin}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
