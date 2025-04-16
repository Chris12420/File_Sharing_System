import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Assuming Layout component exists
import HomePage from './pages/index';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import FilesPage from './pages/files';
import SettingsPage from './pages/settings';
import UsersPage from './pages/users';
import GroupFiles from './pages/GroupFiles'; // Import the new component
import apiClient from './apiClient'; // Import apiClient
import './styles/globals.css';

function App() {
  useEffect(() => {
    const incrementPageView = async () => {
      try {
        await apiClient.post('/api/analytics/page-view');
        console.log('Page view incremented');
      } catch (error) {
        console.error('Error incrementing page view:', error);
      }
    };

    incrementPageView();
  }, []);
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/groups" element={<GroupFiles />} />
        {/* Add other routes as needed */}
      </Routes>
    </Layout>
  );
}

export default App; 