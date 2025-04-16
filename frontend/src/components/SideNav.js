import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Users, Settings, File, FolderKanban, LogOut } from 'lucide-react';
import axios from 'axios'; // Needed for logout
const SideNav = ({ currentUser, isLoading }) => {
    const location = useLocation();
    // Define all possible nav items
    const allNavItems = [
        { name: 'Personal File', icon: _jsx(Home, { size: 20 }), href: '/', adminOnly: false },
        { name: 'Group Files', icon: _jsx(FolderKanban, { size: 20 }), href: '/groups', adminOnly: false },
        { name: 'Dashboard', icon: _jsx(LayoutDashboard, { size: 20 }), href: '/dashboard', adminOnly: true }, // Mark as admin only
        { name: 'Users', icon: _jsx(Users, { size: 20 }), href: '/users', adminOnly: true }, // Mark as admin only
        { name: 'Settings', icon: _jsx(Settings, { size: 20 }), href: '/settings', adminOnly: false },
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
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
            // Reload the page to clear state and redirect (simple approach)
            window.location.href = '/login';
        }
        catch (error) {
            console.error('Logout failed:', error);
            // Optionally show an error message to the user
        }
    };
    // Helper to generate initials
    const getInitials = (name) => {
        if (!name)
            return '?';
        const names = name.split(' ');
        if (names.length === 1)
            return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };
    return (_jsxs("div", { className: "w-64 fixed h-full bg-gray-800 text-white z-40 flex flex-col", children: [_jsx("div", { className: "p-4 border-b border-gray-700", children: _jsxs("h1", { className: "text-xl font-bold flex items-center", children: [_jsx(File, { className: "mr-2", size: 24 }), "FileShare"] }) }), _jsx("div", { className: "flex-grow py-4 overflow-y-auto", children: _jsx("ul", { children: navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (_jsx("li", { children: _jsxs(Link, { to: item.href, className: `
                    w-full flex items-center px-6 py-3 hover:bg-gray-700 transition-colors
                    ${isActive ? 'bg-gray-700 border-l-4 border-purple-500' : ''}
                  `, children: [_jsx("span", { className: "mr-3", children: item.icon }), _jsx("span", { children: item.name })] }) }, item.name));
                    }) }) }), _jsx("div", { className: "p-4 border-t border-gray-700 mt-auto flex-shrink-0", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center h-10", children: _jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }) })) : currentUser ? (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center overflow-hidden mr-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2 flex-shrink-0", children: _jsx("span", { className: "text-sm font-bold", children: getInitials(currentUser.username) }) }), _jsx("div", { className: "overflow-hidden", children: _jsx("p", { className: "text-sm font-medium truncate", children: currentUser.username }) })] }), _jsx("button", { onClick: handleLogout, title: "Logout", className: "p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex-shrink-0", children: _jsx(LogOut, { size: 18 }) })] })) : (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Link, { to: "/login", className: "px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm", children: "Login" }), _jsx(Link, { to: "/register", className: "px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm", children: "Register" })] })) })] }));
};
export default SideNav;
