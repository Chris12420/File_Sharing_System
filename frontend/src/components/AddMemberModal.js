import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const AddMemberModal = ({ isOpen, onClose, onSubmit, isLoading, error, }) => {
    const [identifier, setIdentifier] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!identifier.trim())
            return;
        onSubmit(identifier.trim());
        // Don't close automatically, wait for onSubmit to potentially succeed/fail
        // setIdentifier(''); // Keep identifier in case of error
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-sm w-full p-6", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Add Member to Group" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "userIdentifier", className: "block text-sm font-medium text-gray-700 mb-1", children: "Username or Email" }), _jsx("input", { type: "text", id: "userIdentifier", value: identifier, onChange: (e) => setIdentifier(e.target.value), className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500", placeholder: "Enter username or email...", required: true, disabled: isLoading })] }), error && (_jsxs("p", { className: "text-red-500 text-sm mb-3", children: ["Error: ", error] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isLoading, className: "px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? 'Adding...' : 'Add Member' })] })] })] }) }));
};
export default AddMemberModal;
