import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Users, Settings, File, FolderKanban } from 'lucide-react';

const SideNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Personal File', icon: <Home size={20} />, href: '/' },
    { name: 'Group Files', icon: <FolderKanban size={20} />, href: '/groups' },
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'Users', icon: <Users size={20} />, href: '/users' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];
  
  return (
    <div className="w-64 fixed h-full bg-gray-800 text-white z-40">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center">
          <File className="mr-2" size={24} />
          FileShare
        </h1>
      </div>
      
      <div className="py-4">
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
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
            <span className="text-sm font-bold">JD</span>
          </div>
          <div>
            <p className="text-sm">John Doe</p>
            <p className="text-xs text-gray-400">john.doe@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav; 