import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PaymentModal from './components/PaymentModal';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LANDING' | 'AUTH' | 'DASHBOARD' | 'LOCKED'>('LANDING');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Check for existing session - Updated key
    const sessionEmail = localStorage.getItem('skeindock_session_email');
    if (sessionEmail) {
      // Updated key
      const users: User[] = JSON.parse(localStorage.getItem('skeindock_users') || '[]');
      const user = users.find(u => u.email === sessionEmail);
      if (user) {
        checkAccess(user);
      }
    }
  }, []);

  const checkAccess = (user: User) => {
    const now = new Date();
    const joinedAt = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const trialDays = 30;
    
    // Ensure new fields exist for legacy users in localstorage
    if (!user.storageProvider) {
        user.storageProvider = 'DRIVE';
        user.omniCloudPlan = 'FREE';
    }

    const isPremium = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > now : false;

    if (!isPremium && daysPassed > trialDays) {
      setCurrentUser(user);
      setView('LOCKED');
    } else {
      setCurrentUser(user);
      setView('DASHBOARD');
    }
    
    // Updated key
    localStorage.setItem('skeindock_session_email', user.email);
  };

  const handleLogin = (user: User) => {
    checkAccess(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('skeindock_session_email');
    setCurrentUser(null);
    setView('LANDING');
  };

  const handlePaymentSuccess = () => {
    if (!currentUser) return;

    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const updatedUser: User = {
      ...currentUser,
      subscriptionExpiry: oneYearLater.toISOString()
    };

    // Updated key
    const users: User[] = JSON.parse(localStorage.getItem('skeindock_users') || '[]');
    const newUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('skeindock_users', JSON.stringify(newUsers));

    setCurrentUser(updatedUser);
    setShowPayment(false);
    setView('DASHBOARD');
  };

  const getDaysRemaining = (): number => {
    if (!currentUser) return 0;
    const now = new Date();
    const joinedAt = new Date(currentUser.createdAt);
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysPassed);
  };

  return (
    <>
      {view === 'LANDING' && (
        <LandingPage onStartAuth={() => setView('AUTH')} />
      )}

      {view === 'AUTH' && (
        <AuthPage onLogin={handleLogin} onBack={() => setView('LANDING')} />
      )}

      {view === 'DASHBOARD' && currentUser && (
        <Dashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            daysRemaining={getDaysRemaining()} 
        />
      )}

      {view === 'LOCKED' && currentUser && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-md flex items-center justify-center">
            <PaymentModal onSuccess={handlePaymentSuccess} price="$0.99 / ano" />
        </div>
      )}
    </>
  );
};

export default App;