import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import SideNav from './SideNav';
import axios from 'axios';
const Layout = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
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
            }
            catch (error) {
                console.error('Auth check failed:', error);
                setCurrentUser(null); // Ensure user is null on error
            }
            finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuthStatus();
    }, []); // Run only on mount
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(SideNav, { currentUser: currentUser, isLoading: isLoadingAuth }), _jsxs("div", { className: "flex flex-col flex-1 ml-64", children: [_jsx("main", { className: "flex-1 overflow-auto", children: children }), _jsx("footer", { className: "bg-gray-100 py-4 border-t", children: _jsx("div", { className: "px-6 text-center text-gray-500 text-sm", children: "COMP3421-25-P1 Interactive Web-based File Sharing System" }) })] })] }));
};
export default Layout;
