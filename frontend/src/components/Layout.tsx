import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import axios from 'axios';

interface LayoutProps {
  children: React.ReactNode;
}

export interface User {
  id: string;
  username: string;
  role: string;
  email?: string; // Add optional email field
  // Add email if needed later
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check`, {
          withCredentials: true,
        });
        if (response.data.authenticated) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null); // Ensure user is null on error
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []); // Run only on mount

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Navigation - Now handles its own active state */}
      <SideNav currentUser={currentUser} isLoading={isLoadingAuth} /> 
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-64">
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-100 py-4 border-t">
          <div className="px-6 text-center text-gray-500 text-sm">
            COMP3421-25-P1 Interactive Web-based File Sharing System
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 