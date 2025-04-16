import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const UserForm = ({ onSubmit, onCancel, roleToAdd }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        // Basic validation
        if (!username || !email || !password) {
            setError('All fields are required.');
            return;
        }
        // Add more robust validation as needed (e.g., password complexity)
        // Pass data to parent component for API call
        onSubmit({
            username,
            email,
            password, // Send plaintext password to backend for hashing
            role: roleToAdd
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && _jsx("div", { className: "p-3 bg-red-100 text-red-700 rounded-md", children: error }), _jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-1", children: "Username" }), _jsx("input", { type: "text", id: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { className: "pt-2 flex justify-end gap-3 border-t", children: [_jsx("button", { type: "button" // Important: type="button" to prevent form submission
                        , onClick: onCancel, className: "px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700", children: ["Create ", roleToAdd === 'admin' ? 'Admin' : 'User'] })] })] }));
};
export default UserForm;
