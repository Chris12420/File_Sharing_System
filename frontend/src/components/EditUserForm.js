import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const EditUserForm = ({ user, onSubmit, onCancel }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState(null);
    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setPassword(''); // Don't set password from user object
            setRole(user.role || 'user');
        }
    }, [user]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        // Basic validation
        if (!username || !email) {
            setError('Username and email are required.');
            return;
        }
        // Add more robust validation as needed
        // Pass data to parent component for API call
        onSubmit({
            username,
            email,
            password: password ? password : undefined, // Only send password if it's changed
            role
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && _jsx("div", { className: "p-3 bg-red-100 text-red-700 rounded-md", children: error }), _jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-1", children: "Username" }), _jsx("input", { type: "text", id: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password (Leave blank to keep current password)" }), _jsx("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "role", className: "block text-sm font-medium text-gray-700 mb-1", children: "Role" }), _jsxs("select", { id: "role", value: role, onChange: (e) => setRole(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "pt-2 flex justify-end gap-3 border-t", children: [_jsx("button", { type: "button", onClick: onCancel, className: "px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700", children: "Save Changes" })] })] }));
};
export default EditUserForm;
