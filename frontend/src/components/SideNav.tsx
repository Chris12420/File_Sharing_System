import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Users, Settings, File, FolderKanban, LogOut } from 'lucide-react';
import { User } from './Layout'; // Import User interface from Layout
import axios from 'axios'; // Needed for logout

interface SideNavProps {
  currentUser: User | null;
  isLoading: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ currentUser, isLoading }) => {
  const location = useLocation();

  // Define all possible nav items
  const allNavItems = [
    { name: 'Personal File', icon: <Home size={20} />, href: '/', adminOnly: false },
    { name: 'Group Files', icon: <FolderKanban size={20} />, href: '/groups', adminOnly: false },
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard', adminOnly: true }, // Mark as admin only
    { name: 'Users', icon: <Users size={20} />, href: '/users', adminOnly: true }, // Mark as admin only
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings', adminOnly: false },
  ];

  // Filter items based on user role
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) {
        // Only show admin items if user exists and has admin role
        return currentUser?.role === 'admin';
    }
    // Show non-admin items always (assuming logged in, or handled by route protection later)
    return true; 
  });

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {},
         { withCredentials: true }
      );
      // Reload the page to clear state and redirect (simple approach)
      window.location.href = '/login'; 
    } catch (error) {
        console.error('Logout failed:', error);
        // Optionally show an error message to the user
    }
  };
  
  // Helper to generate initials
  const getInitials = (name: string | undefined): string => {
      if (!name) return '?';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };


  return (
    <div className="w-64 fixed h-full bg-gray-800 text-white z-40 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center">
          <File className="mr-2" size={24} />
          FileShare
        </h1>
      </div>
      
      <div className="flex-grow py-4 overflow-y-auto">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  to={item.href}
                  className={`
                    w-full flex items-center px-6 py-3 hover:bg-gray-700 transition-colors
                    ${isActive ? 'bg-gray-700 border-l-4 border-purple-500' : ''}
                  `}
                 >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* User Info / Loading / Login */}
      <div className="p-4 border-t border-gray-700 mt-auto flex-shrink-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-10">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        ) : currentUser ? (
          <div className="flex items-center justify-between">
             <div className="flex items-center overflow-hidden mr-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2 flex-shrink-0">
                  {/* Display initials from username */}
                  <span className="text-sm font-bold">{getInitials(currentUser.username)}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {currentUser.username}
                  </p>
                </div>
             </div>
             <button
               onClick={handleLogout}
               title="Logout"
               className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex-shrink-0"
             >
               <LogOut size={18} />
             </button>
          </div>
        ) : (
          <div className="text-center">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideNav; 