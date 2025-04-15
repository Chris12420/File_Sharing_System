import React, { useState } from 'react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (identifier: string) => void; // Takes username or email
  isLoading: boolean;
  error: string | null;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}) => {
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    onSubmit(identifier.trim());
    // Don't close automatically, wait for onSubmit to potentially succeed/fail
    // setIdentifier(''); // Keep identifier in case of error
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-medium mb-4">Add Member to Group</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userIdentifier" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              id="userIdentifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter username or email..."
              required
              disabled={isLoading}
            />
          </div>

          {error && (
             <p className="text-red-500 text-sm mb-3">Error: {error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal; 