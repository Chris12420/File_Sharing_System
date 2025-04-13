import React from 'react';

const SettingsView: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium">General Settings</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-4">Profile</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white mr-4">
                  <span className="text-lg font-bold">JD</span>
                </div>
                <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">
                  Change Profile Picture
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    defaultValue="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    defaultValue="john.doe@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
      
      {/* Add other settings sections here (e.g., Security, Notifications) */}
    </div>
  );
};

export default SettingsView; 