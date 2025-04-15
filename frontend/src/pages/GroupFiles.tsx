import React, { useState, useEffect } from 'react';
import { Users, FolderPlus, File, Image, FileText, Music, Video, Upload, UserPlus, Trash2 } from 'lucide-react';
import axios from 'axios';
import AddMemberModal from '../components/AddMemberModal';

// --- Interfaces (Keep these) ---
interface Group {
  id: string; // Will be _id from backend
  name: string;
  // Add other potential fields from backend if needed (e.g., owner)
}

interface Member {
  // Assuming backend sends populated user objects
  user: { _id: string; username: string; };
  role: 'admin' | 'member';
}

interface GroupFile {
  id: string; // Will be _id from backend
  name: string;
  size: string; // Consider fetching raw size and formatting on frontend
  type: string; 
  uploadDate: string;
  uploadedBy: string; // Assuming backend sends populated owner username
}

// --- Reusable Components (Simplified for this page) ---

const FileIcon: React.FC<{ fileType: string }> = ({ fileType }) => {
  switch (fileType) {
    case 'image': return <Image size={18} className="text-gray-500" />;
    case 'video': return <Video size={18} className="text-gray-500" />;
    case 'audio': return <Music size={18} className="text-gray-500" />;
    default: return <FileText size={18} className="text-gray-500" />;
  }
};

// --- Group Files Page Component ---

const GroupFiles: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'idle' | 'create' | 'details'>('idle');
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for fetched details
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [currentFiles, setCurrentFiles] = useState<GroupFile[]>([]);
  // State for Add Member Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Fetch user's groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/groups`, {
          withCredentials: true, // Send cookies
        });
        // Map backend response (_id to id)
        const fetchedGroups = response.data.map((group: any) => ({ 
            id: group._id, 
            name: group.name 
            // Map other fields if needed
        }));
        setGroups(fetchedGroups);
      } catch (err: any) { // Catch specific axios error if needed
        console.error('Error fetching groups:', err);
        setError(err.response?.data?.message || 'Failed to load groups.');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []); // Empty dependency array means run once on mount

  // Fetch group details when a group is selected
  const handleSelectGroup = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setViewMode('details');
    setIsLoadingDetails(true);
    setError(null);
    setCurrentMembers([]); // Clear previous details
    setCurrentFiles([]);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/groups/${groupId}`, {
        withCredentials: true,
      });
      
      // Extract data from response
      const { group: groupDetails, files: groupFiles } = response.data;

      // Update members state
      setCurrentMembers(groupDetails.members.map((m: any) => ({
        user: {
          _id: m.user?._id || 'unknown', // Handle potential missing user data
          username: m.user?.username || 'Unknown User'
        },
        role: m.role
      })));

      // Update files state
      setCurrentFiles(groupFiles.map((f: any) => ({
        id: f._id,
        name: f.originalName || f.filename, // Use appropriate field from backend model
        size: formatSize(f.size || 0), // Use helper and handle missing size
        type: f.mimeType?.split('/')[0] || 'document', // Basic type extraction
        uploadDate: formatDate(f.createdAt || Date.now()), // Use helper and handle missing date
        uploadedBy: f.ownerId?.username || 'Unknown' // Use populated owner username
      })));

    } catch (err: any) {
      console.error(`Error fetching details for group ${groupId}:`, err);
      setError(err.response?.data?.message || 'Failed to load group details.');
      setViewMode('idle'); // Revert view if details fail
      setSelectedGroupId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleShowCreateForm = () => {
    setSelectedGroupId(null);
    setViewMode('create');
    setNewGroupName('');
    setError(null); // Clear errors when switching view
  };

  // Update create group handler to use API
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setError(null);
    // Add loading state if needed
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/groups`, 
        { name: newGroupName.trim() }, 
        { withCredentials: true }
      );
      const newGroup = { id: response.data._id, name: response.data.name }; // Adjust based on API response
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      setViewMode('details');
      setNewGroupName('');
      // Fetch details for the newly created group
      await handleSelectGroup(newGroup.id);
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group.');
    }
  };

  // Placeholder: Add API calls for delete, add member, upload
  const handleDeleteFile = (fileId: string) => {
    console.log(`TODO: API call to delete file ${fileId} from group ${selectedGroupId}`);
  };

  // Open the Add Member modal
  const handleAddMember = () => {
      if (!selectedGroupId) return;
      setAddMemberError(null); // Clear previous errors
      setIsAddMemberModalOpen(true);
  };

  // Handle the submission from the modal
  const handleConfirmAddMember = async (identifier: string) => {
    if (!selectedGroupId) return;
    setAddMemberLoading(true);
    setAddMemberError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/groups/${selectedGroupId}/members`,
        { identifier }, // Send identifier (username or email)
        { withCredentials: true }
      );
      // Update the members list with the response from the server
      setCurrentMembers(response.data.map((m: any) => ({ 
          user: { _id: m.user._id, username: m.user.username }, 
          role: m.role 
      })));
      setIsAddMemberModalOpen(false); // Close modal on success
    } catch (err: any) {
      console.error('Error adding member:', err);
      setAddMemberError(err.response?.data?.message || 'Failed to add member.');
      // Keep modal open on error
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleUploadFile = () => {
      console.log(`TODO: Open modal/trigger input and API call to upload file to group ${selectedGroupId}`);
  };

  // Helper function (example)
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString();
  };

  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;

  return (
    <div className="p-6 flex gap-6 h-full">
      
      {/* Left Column: Group List */}
      <div className="w-1/4 bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Your Groups</h2>
        <button 
          onClick={handleShowCreateForm}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <FolderPlus size={18} />
          <span>Create New Group</span>
        </button>
        <div className="flex-grow space-y-1 overflow-y-auto">
          {isLoadingGroups ? (
            <p className="text-gray-500 text-center py-4">Loading groups...</p>
          ) : error && groups.length === 0 ? (
             <p className="text-red-500 text-center py-4">Error: {error}</p>
          ) : groups.length === 0 ? (
             <p className="text-gray-500 text-center py-4">No groups found. Create one!</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <button 
                    onClick={() => handleSelectGroup(group.id)}
                    disabled={isLoadingDetails && selectedGroupId === group.id} // Disable button while its details are loading
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                      selectedGroupId === group.id 
                        ? 'bg-purple-100 text-purple-800 font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    } ${
                       (isLoadingDetails && selectedGroupId === group.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Users size={18} />
                    <span className="truncate">{group.name}</span>
                    {isLoadingDetails && selectedGroupId === group.id && (
                        <span className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div className="w-3/4 bg-white rounded-lg shadow p-6 flex flex-col">
        {/* Display general errors here */}
        {error && viewMode !== 'details' && (
             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">Error: {error}</div>
        )}

        {viewMode === 'idle' && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
            <FolderPlus size={48} className="mb-4" />
            <p>Select a group from the list or create a new one.</p>
          </div>
        )}

        {viewMode === 'create' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input 
                  type="text" 
                  id="groupName" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group name..."
                  required
                />
              </div>
              <button 
                type="submit" 
                // Add disabled state while creating
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {viewMode === 'details' && isLoadingDetails && (
           <div className="flex-grow flex items-center justify-center text-gray-500">Loading group details...</div>
        )}

        {viewMode === 'details' && !isLoadingDetails && selectedGroup && (
          <div className="flex flex-col h-full">
            {/* Group Header */}
            <div className="border-b pb-4 mb-4">
               {/* Display detail-specific errors */}
               {error && (
                  <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">Error loading details: {error}</div>
               )}
              <h2 className="text-2xl font-semibold mb-2">{selectedGroup.name}</h2>
              {/* Group Actions */} 
              <div className="flex justify-between items-center">
                 <button onClick={handleAddMember} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1">
                    <UserPlus size={16} /> Add Member
                 </button>
                 <button onClick={handleUploadFile} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                   <Upload size={16} /> Upload File
                 </button>
              </div>
            </div>
            
            {/* Content Area */} 
            <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
              {/* Members Section */}
              <div className="w-full md:w-1/3 border-r pr-6 flex flex-col">
                 <h3 className="text-lg font-semibold mb-3">Members ({currentMembers.length})</h3>
                 <ul className="space-y-2 overflow-y-auto flex-grow">
                    {currentMembers.length === 0 ? (
                        <li className="text-gray-400">No members yet.</li>
                    ) : (
                        currentMembers.map(member => (
                          <li key={member.user._id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                             <div>
                                <span className="font-medium">{member.user.username}</span>
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {member.role}
                                </span>
                             </div>
                          </li>
                        ))
                    )}
                 </ul>
              </div>

              {/* Files Section */}
              <div className="w-full md:w-2/3 flex flex-col">
                 <h3 className="text-lg font-semibold mb-3">Group Files ({currentFiles.length})</h3>
                 <div className="overflow-y-auto flex-grow">
                    {currentFiles.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center text-gray-400">
                            No files in this group yet.
                        </div>
                    ) : (
                       <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                               <th className="text-left py-2 px-3">Name</th>
                               <th className="text-left py-2 px-3">Size</th>
                               <th className="text-left py-2 px-3">Uploaded By</th>
                               <th className="text-left py-2 px-3">Date</th>
                               <th className="text-right py-2 px-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentFiles.map(file => (
                               <tr key={file.id} className="hover:bg-gray-50">
                                 <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                       <FileIcon fileType={file.type} />
                                       <span className="truncate max-w-xs">{file.name}</span>
                                    </div>
                                 </td>
                                 <td className="py-2 px-3 text-gray-500">{file.size}</td>
                                 <td className="py-2 px-3 text-gray-500">{file.uploadedBy}</td>
                                 <td className="py-2 px-3 text-gray-500">{file.uploadDate}</td>
                                 <td className="py-2 px-3">
                                    <div className="flex justify-end gap-1">
                                       <button 
                                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                          title="Delete"
                                          onClick={() => handleDeleteFile(file.id)}
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </td>
                               </tr>
                            ))}
                          </tbody>
                       </table>
                    )}
                 </div>
              </div>
            </div>
            {/* Render AddMemberModal */}
            <AddMemberModal
               isOpen={isAddMemberModalOpen}
               onClose={() => setIsAddMemberModalOpen(false)}
               onSubmit={handleConfirmAddMember}
               isLoading={addMemberLoading}
               error={addMemberError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupFiles; 