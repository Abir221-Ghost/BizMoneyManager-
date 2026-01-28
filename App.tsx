import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User } from './types';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Account } from './components/Account';
import { History } from './components/History';
import { Parties } from './components/Parties';
import { Tools } from './components/Tools';
import { Inventory } from './components/Inventory';
import { Staff } from './components/Staff';
import { GoalManager } from './components/GoalManager';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} currentView={currentView} setView={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard user={user} />}
      {currentView === 'history' && <History user={user} />}
      {currentView === 'parties' && <Parties user={user} />}
      {currentView === 'reports' && <Reports user={user} />}
      {currentView === 'tools' && <Tools user={user} />}
      {currentView === 'account' && <Account user={user} onUserUpdate={setUser} />}
      {currentView === 'inventory' && <Inventory user={user} />}
      {currentView === 'staff' && <Staff user={user} />}
      {currentView === 'goals' && <GoalManager user={user} />}
    </Layout>
  );
};

export default App;