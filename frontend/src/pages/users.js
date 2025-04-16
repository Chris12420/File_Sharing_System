import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import EditUserForm from '../components/EditUserForm';
import apiClient from '../apiClient'; // Import apiClient
const UsersView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [roleToAdd, setRoleToAdd] = useState('user');
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [userToEdit, setUserToEdit] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    // Extract fetchUsers function to reuse it
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            // Replace fetch with apiClient
            // Remove baseUrl and apiUrl definitions
            const response = await apiClient.get('/api/users');
            console.log('Fetched users:', response.data); // Access data via response.data
            setUsers(response.data);
        }
        catch (error) { // Axios errors have response property
            console.error('Error fetching users:', error);
            setApiError(error.response?.data?.message || error.message || 'Failed to load users');
        }
        finally {
            setIsLoadingUsers(false);
        }
    };
    // Fetch users when component mounts
    useEffect(() => {
        fetchUsers();
    }, []);
    const handleAddUser = () => {
        setRoleToAdd('user');
        setApiError(null);
        setIsModalOpen(true);
    };
    const handleAddAdmin = () => {
        setRoleToAdd('admin');
        setApiError(null);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleEditUser = (user) => {
        setUserToEdit(user);
        setApiError(null);
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    };
    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
    };
    const handleConfirmDelete = async () => {
        if (!userToDelete)
            return;
        setLoading(true);
        setApiError(null);
        try {
            // Replace fetch with apiClient
            // Remove baseUrl and apiUrl definitions
            await apiClient.delete(`/api/users/${userToDelete._id}`);
            // Refresh user list
            fetchUsers();
            handleCloseDeleteModal();
        }
        catch (error) {
            console.error('Failed to delete user:', error);
            setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateUser = async (formData) => {
        setLoading(true);
        setApiError(null);
        console.log('Submitting user data:', formData);
        try {
            // Replace fetch with apiClient
            // Remove baseUrl and apiUrl definitions
            const response = await apiClient.post('/api/users', formData);
            const newUser = response.data; // Access data via response.data
            console.log('User created successfully:', newUser);
            // Refresh the user list from the server to get the latest data
            fetchUsers();
            handleCloseModal();
        }
        catch (error) {
            console.error('Failed to create user:', error);
            setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdateUser = async (formData) => {
        if (!userToEdit)
            return;
        setLoading(true);
        setApiError(null);
        try {
            // Replace fetch with apiClient
            // Remove baseUrl and apiUrl definitions
            await apiClient.put(`/api/users/${userToEdit._id}`, formData);
            // Refresh user list
            fetchUsers();
            handleCloseEditModal();
        }
        catch (error) {
            console.error('Failed to update user:', error);
            setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
        }
        finally {
            setLoading(false);
        }
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'user':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Users Management" }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleAddUser, className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2", children: _jsx("span", { children: "Add User" }) }), _jsx("button", { onClick: handleAddAdmin, className: "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2", children: _jsx("span", { children: "Add Admin" }) })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search users...", className: "border rounded-lg py-2 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-500" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 absolute left-2.5 top-3 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 text-gray-600 text-sm", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4 text-left", children: "User" }), _jsx("th", { className: "py-3 px-4 text-left", children: "Role" }), _jsx("th", { className: "py-3 px-4 text-left", children: "Last Active" }), _jsx("th", { className: "py-3 px-4 text-left", children: "Status" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: isLoadingUsers ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "py-4 text-center text-gray-500", children: "Loading users..." }) })) : users.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "py-4 text-center text-gray-500", children: "No users found" }) })) : (users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white", children: _jsx("span", { className: "text-sm font-bold", children: user.username.charAt(0).toUpperCase() }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: user.username }), _jsx("p", { className: "text-sm text-gray-500", children: user.email })] })] }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`, children: user.role.charAt(0).toUpperCase() + user.role.slice(1) }) }), _jsx("td", { className: "py-3 px-4 text-gray-500", children: "-" }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "Active" }) }), _jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => handleEditUser(user), className: "p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }) }), _jsx("button", { onClick: () => handleDeleteUser(user), className: "p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] }) })] }, user._id)))) })] }) }), _jsxs(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: roleToAdd === 'admin' ? 'Add New Admin' : 'Add New User', children: [apiError && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-md", children: apiError }), _jsx(UserForm, { onSubmit: handleCreateUser, onCancel: handleCloseModal, roleToAdd: roleToAdd }), loading && _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center", children: "Loading..." })] }), _jsxs(Modal, { isOpen: isEditModalOpen, onClose: handleCloseEditModal, title: "Edit User", children: [apiError && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-md", children: apiError }), userToEdit && (_jsx(EditUserForm, { user: userToEdit, onSubmit: handleUpdateUser, onCancel: handleCloseEditModal })), loading && _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center", children: "Loading..." })] }), _jsxs(Modal, { isOpen: deleteConfirmOpen, onClose: handleCloseDeleteModal, title: "Confirm Delete", children: [apiError && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-md", children: apiError }), _jsxs("div", { className: "p-4", children: [_jsxs("p", { className: "mb-4", children: ["Are you sure you want to delete the user \"", userToDelete?.username, "\"? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: handleCloseDeleteModal, className: "px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50", children: "Cancel" }), _jsx("button", { onClick: handleConfirmDelete, className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700", children: "Delete" })] })] }), loading && _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center", children: "Loading..." })] })] }));
};
export default UsersView;
