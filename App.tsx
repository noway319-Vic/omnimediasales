import React, { useState } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RequestForm from './components/RequestForm';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'apply': return <RequestForm />;
      case 'admin': return <AdminPanel />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;