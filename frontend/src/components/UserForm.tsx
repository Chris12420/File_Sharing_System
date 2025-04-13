import React, { useState } from 'react';

interface UserFormProps {
  onSubmit: (formData: any) => void; // Replace 'any' with a proper type later
  onCancel: () => void;
  roleToAdd: 'user' | 'admin';
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, roleToAdd }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      <div className="pt-2 flex justify-end gap-3 border-t">
        <button 
          type="button" // Important: type="button" to prevent form submission
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Create {roleToAdd === 'admin' ? 'Admin' : 'User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm; 