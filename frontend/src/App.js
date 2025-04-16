import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
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
            }
            catch (error) {
                console.error('Error incrementing page view:', error);
            }
        };
        incrementPageView();
    }, []);
    return (_jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/files", element: _jsx(FilesPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/users", element: _jsx(UsersPage, {}) }), _jsx(Route, { path: "/groups", element: _jsx(GroupFiles, {}) })] }) }));
}
export default App;
