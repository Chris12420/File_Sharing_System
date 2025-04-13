import React from 'react';
import SideNav from './SideNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Navigation - Now handles its own active state */}
      <SideNav /> 
      
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