import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../apiClient'; // Import apiClient
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!username || !email || !password) {
            setError("Username, email, and password are required");
            return;
        }
        setIsLoading(true);
        try {
            // Use apiClient instead of fetch
            // Remove baseUrl and apiUrl definitions
            const response = await apiClient.post('/api/auth/register', { username, email, password });
            // Access data via response.data
            const data = response.data;
            // Axios throws on non-2xx, but backend might still return error message in data
            // Consider checking response.data structure if backend sends { success: false, message: '...' } on 200 OK
            // if (!data.success) { 
            //   throw new Error(data.message || 'Registration failed according to response');
            // }
            // Registration successful, redirect to login page
            console.log('Registration successful:', data);
            navigate('/login', { state: { registered: true } });
        }
        catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'An error occurred during registration.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-lg shadow-md", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Create your account" }) }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [error && (_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", role: "alert", children: [_jsx("strong", { className: "font-bold", children: "Error: " }), _jsx("span", { className: "block sm:inline", children: error })] })), _jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "sr-only", children: "Username" }), _jsx("input", { id: "username", name: "username", type: "text", autoComplete: "username", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Username", value: username, onChange: (e) => setUsername(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email-address", className: "sr-only", children: "Email address" }), _jsx("input", { id: "email-address", name: "email", type: "email", autoComplete: "email", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Email address", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "sr-only", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "new-password", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirm-password", className: "sr-only", children: "Confirm Password" }), _jsx("input", { id: "confirm-password", name: "confirmPassword", type: "password", autoComplete: "new-password", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Confirm Password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: `group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`, children: isLoading ? 'Registering...' : 'Sign up' }) })] }), _jsx("div", { className: "text-sm text-center", children: _jsx(Link, { to: "/login", children: _jsx("div", { className: "font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer", children: "Already have an account? Sign in" }) }) })] }) }));
};
export default RegisterPage;
