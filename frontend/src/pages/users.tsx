import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import EditUserForm from '../components/EditUserForm';
import apiClient from '../apiClient'; // Import apiClient

const UsersView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Extract fetchUsers function to reuse it
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Replace fetch with apiClient
      // Remove baseUrl and apiUrl definitions
      const response = await apiClient.get('/api/users');
      console.log('Fetched users:', response.data); // Access data via response.data
      setUsers(response.data);
    } catch (error: any) { // Axios errors have response property
      console.error('Error fetching users:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to load users');
    } finally {
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

  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setApiError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      // Replace fetch with apiClient
      // Remove baseUrl and apiUrl definitions
      await apiClient.delete(`/api/users/${userToDelete._id}`);
      
      // Refresh user list
      fetchUsers();
      handleCloseDeleteModal();
      
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (formData: any) => {
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

    } catch (error: any) {
      console.error('Failed to create user:', error);
      setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (formData: any) => {
    if (!userToEdit) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      // Replace fetch with apiClient
      // Remove baseUrl and apiUrl definitions
      await apiClient.put(`/api/users/${userToEdit._id}`, formData);
      
      // Refresh user list
      fetchUsers();
      handleCloseEditModal();
      
    } catch (error: any) {
      console.error('Failed to update user:', error);
      setApiError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button 
            onClick={handleAddUser} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>Add User</span>
          </button>
          <button 
            onClick={handleAddAdmin}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
           >
            <span>Add Admin</span>
          </button>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="border rounded-lg py-2 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Last Active</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingUsers ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">-</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding User */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={roleToAdd === 'admin' ? 'Add New Admin' : 'Add New User'}
      >
        {apiError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{apiError}</div>}
        
        <UserForm 
          onSubmit={handleCreateUser} 
          onCancel={handleCloseModal}
          roleToAdd={roleToAdd}
        />

        {loading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">Loading...</div>}
      </Modal>

      {/* Modal for Editing User */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        title="Edit User"
      >
        {apiError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{apiError}</div>}
        
        {userToEdit && (
          <EditUserForm 
            user={userToEdit}
            onSubmit={handleUpdateUser} 
            onCancel={handleCloseEditModal}
          />
        )}

        {loading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">Loading...</div>}
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={handleCloseDeleteModal} 
        title="Confirm Delete"
      >
        {apiError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{apiError}</div>}
        
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete the user "{userToDelete?.username}"? This action cannot be undone.</p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleCloseDeleteModal}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {loading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">Loading...</div>}
      </Modal>
    </div>
  );
};

export default UsersView; 