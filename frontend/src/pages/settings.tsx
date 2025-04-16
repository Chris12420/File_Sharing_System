import React, { useState, useEffect } from 'react';
// Remove direct axios import if no longer needed
// import axios from 'axios'; 
import apiClient from '../apiClient'; // Import the centralized client
import { User } from '../components/Layout'; // Import User interface if needed

const SettingsPage: React.FC = () => {
  // State for user data and form inputs
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State for username update feedback
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  // State for email update feedback
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // State for profile update feedback
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // State for password update feedback
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch current user data on mount
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        // Use apiClient
        const response = await apiClient.get('/api/auth/check');
        
        if (isMounted && response.data.authenticated) {
          const userData = response.data.user;
          // Fetch full user details to get email if not in session
          // Assuming /api/users/me or similar endpoint exists, or fetch by ID
          // For simplicity, let's assume /check returns email OR we fetch separately
          // If email is not returned by /check, you need another API call here
          // Example: const profileRes = await apiClient.get('/api/users/' + userData.id)
          // const fullUserData = profileRes.data;
          // setUsername(fullUserData.username || '');
          // setEmail(fullUserData.email || '');

          // For now, assume check returns email or it's added to session data
          setCurrentUser(userData);
          setUsername(userData.username || '');
          // Attempt to get email from session data first
          setEmail(userData.email || ''); // Adjust if email source is different
          
          // If email wasn't in session, fetch it (Placeholder - requires backend endpoint)
          if (!userData.email) {
              console.log("Email not in session, fetching profile...");
              // Use apiClient for potential future fetch
              // const profileRes = await apiClient.get('/api/users/' + userData.id);
              // if (isMounted && profileRes.data) {
              //    setEmail(profileRes.data.email || '');
              // }
          }

        } else if (isMounted) {
          console.warn('User not authenticated on settings page.');
        }
      } catch (error) {
        if (isMounted) console.error('Failed to fetch current user:', error);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };
    fetchCurrentUser();
    return () => { isMounted = false }; // Cleanup function
  }, []);

  // Handler for Username Update
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);
    setEmailError(null); // Clear other form errors
    setEmailSuccess(null);

    try {
      // Use apiClient
      await apiClient.put(
        '/api/settings/profile',
        { username } // Only send username
      );
      setUsernameSuccess('Username updated successfully!');
      window.location.reload(); // Reload to update SideNav
    } catch (err: any) {
      console.error('Error updating username:', err);
      setUsernameError(err.response?.data?.message || 'Failed to update username.');
    } finally {
      setUsernameLoading(false);
    }
  };

  // Handler for Email Update
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    setUsernameError(null); // Clear other form errors
    setUsernameSuccess(null);

    try {
      // Use apiClient
      await apiClient.put(
        '/api/settings/profile',
        { email } // Only send email
      );
      setEmailSuccess('Email updated successfully!');
      // No reload needed for email
    } catch (err: any) {
      console.error('Error updating email:', err);
      setEmailError(err.response?.data?.message || 'Failed to update email.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handler for Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // Use apiClient
      const response = await apiClient.put(
        '/api/settings/profile',
        { username, email } // Send updated username and email
      );
      setProfileSuccess('Profile updated successfully!');
      // Refresh the page to reflect changes (e.g., username in SideNav)
      window.location.reload(); 
      // Optionally update currentUser state if response contains full user object
      // setCurrentUser(response.data); 
      // Or just update the displayed fields if needed
      // setUsername(response.data.username);
      // setEmail(response.data.email);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handler for Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      // Use apiClient
      await apiClient.put(
        '/api/settings/password',
        { currentPassword, newPassword }
      );
      setPasswordSuccess('Password updated successfully!');
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoadingUser) {
    return <div className="p-6">Loading user settings...</div>;
  }

  if (!currentUser) {
      return <div className="p-6">Please log in to view settings.</div>;
  }

  // Main Settings Page JSX
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <form onSubmit={handleUsernameUpdate} className="space-y-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              User Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                required
                disabled={usernameLoading || emailLoading}
              />
              <button
                type="submit"
                disabled={usernameLoading || !username || username === currentUser?.username}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
              >
                {usernameLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
            {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
            {usernameSuccess && <p className="text-green-500 text-xs mt-1">{usernameSuccess}</p>}
          </form>
          
          <form onSubmit={handleEmailUpdate} className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                placeholder="Enter your email"
                required
                disabled={usernameLoading || emailLoading}
              />
              <button
                type="submit"
                disabled={emailLoading || !email || email === currentUser?.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
              >
                {emailLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            {emailSuccess && <p className="text-green-500 text-xs mt-1">{emailSuccess}</p>}
            
          </form>
        </div>
      </div>

      {/* Password Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* Display password feedback */} 
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
              </div>
              
                <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
                  </label>
                  <input 
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
                  />
                </div>

                <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
                  </label>
                  <input 
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                passwordLoading || 
                !currentPassword || 
                !newPassword || 
                !confirmNewPassword ||
                newPassword !== confirmNewPassword
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage; 