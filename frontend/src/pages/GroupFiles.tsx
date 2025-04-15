import React, { useState } from 'react';
import { Users, FolderPlus, File, Image, FileText, Music, Video, Upload, UserPlus, Trash2 } from 'lucide-react';

// --- Mock Data ---
interface Group {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  role: 'admin' | 'member';
}

interface GroupFile {
  id: string;
  name: string;
  size: string;
  type: string; // 'image', 'video', 'audio', 'document'
  uploadDate: string;
  uploadedBy: string;
}

const mockGroups: Group[] = [
  { id: 'g1', name: 'Project Alpha' },
  { id: 'g2', name: 'Marketing Team' },
  { id: 'g3', name: 'Research & Development' },
];

const mockMembers: { [key: string]: Member[] } = {
  g1: [
    { id: 'u1', name: 'Alice', role: 'admin' },
    { id: 'u2', name: 'Bob', role: 'member' },
  ],
  g2: [
    { id: 'u3', name: 'Charlie', role: 'admin' },
    { id: 'u1', name: 'Alice', role: 'member' },
    { id: 'u4', name: 'David', role: 'member' },
  ],
  g3: [
    { id: 'u5', name: 'Eve', role: 'admin' },
  ],
};

const mockFiles: { [key: string]: GroupFile[] } = {
  g1: [
    { id: 'f1', name: 'alpha-design-v1.png', size: '1.2 MB', type: 'image', uploadDate: '2023-10-26', uploadedBy: 'Alice' },
    { id: 'f2', name: 'project-plan.docx', size: '0.5 MB', type: 'document', uploadDate: '2023-10-25', uploadedBy: 'Bob' },
  ],
  g2: [
    { id: 'f3', name: 'campaign-video.mp4', size: '25 MB', type: 'video', uploadDate: '2023-10-27', uploadedBy: 'Charlie' },
    { id: 'f4', name: 'social-media-calendar.xlsx', size: '0.1 MB', type: 'document', uploadDate: '2023-10-20', uploadedBy: 'Alice' },
  ],
  g3: [], // R&D group has no files yet
};

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
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'idle' | 'create' | 'details'>('idle');
  const [newGroupName, setNewGroupName] = useState('');

  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;
  const currentMembers = selectedGroupId ? mockMembers[selectedGroupId] || [] : [];
  const currentFiles = selectedGroupId ? mockFiles[selectedGroupId] || [] : [];

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setViewMode('details');
  };

  const handleShowCreateForm = () => {
    setSelectedGroupId(null);
    setViewMode('create');
    setNewGroupName('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return; // Basic validation
    const newGroup: Group = {
      id: `g${Date.now()}`, // Simple unique ID generation
      name: newGroupName.trim(),
    };
    setGroups([...groups, newGroup]);
    // Optionally select the new group immediately
    setSelectedGroupId(newGroup.id); 
    setViewMode('details');
    setNewGroupName(''); // Reset form
    console.log('Create Group:', newGroup);
    // TODO: Add API call to create group in backend
  };

  const handleDeleteFile = (fileId: string) => {
    console.log(`Delete file ${fileId} from group ${selectedGroupId}`);
    // TODO: Add API call to delete file
  };
  
  const handleAddMember = () => {
      console.log(`Add member to group ${selectedGroupId}`);
      // TODO: Implement add member functionality (e.g., open a modal)
  };

  const handleUploadFile = () => {
      console.log(`Upload file to group ${selectedGroupId}`);
      // TODO: Implement file upload functionality
  };


  return (
    <div className="p-6 flex gap-6 h-full"> {/* Changed height calculation */}
      
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
        <ul className="flex-grow space-y-1 overflow-y-auto">
          {groups.map((group) => (
            <li key={group.id}>
              <button 
                onClick={() => handleSelectGroup(group.id)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  selectedGroupId === group.id 
                    ? 'bg-purple-100 text-purple-800 font-medium' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Users size={18} />
                <span className="truncate">{group.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Content Area */}
      <div className="w-3/4 bg-white rounded-lg shadow p-6 flex flex-col">
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {viewMode === 'details' && selectedGroup && (
          <div className="flex flex-col h-full">
            {/* Group Header */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-semibold mb-2">{selectedGroup.name}</h2>
              {/* Group Actions - Adjust layout */}
              <div className="flex justify-between items-center"> {/* Use justify-between */}
                 {/* Move Add Member button first */}
                 <button onClick={handleAddMember} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1">
                    <UserPlus size={16} /> Add Member
                 </button>
                 {/* Upload File button second */}
                 <button onClick={handleUploadFile} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                   <Upload size={16} /> Upload File
                 </button>
                 {/* Add other actions like rename, delete group etc. if needed */}
              </div>
            </div>
            
            {/* Content Tabs/Sections (Example: Members and Files) */}
            <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
              
              {/* Members Section */}
              <div className="w-full md:w-1/3 border-r pr-6 flex flex-col">
                 <h3 className="text-lg font-semibold mb-3">Members ({currentMembers.length})</h3>
                 <ul className="space-y-2 overflow-y-auto flex-grow">
                    {currentMembers.map(member => (
                      <li key={member.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                         <div>
                            <span className="font-medium">{member.name}</span>
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                                {member.role}
                            </span>
                         </div>
                         {/* Add remove member button for admins if needed */}
                      </li>
                    ))}
                 </ul>
              </div>

              {/* Files Section */}
              <div className="w-full md:w-2/3 flex flex-col">
                 <h3 className="text-lg font-semibold mb-3">Group Files ({currentFiles.length})</h3>
                 {currentFiles.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-gray-400">
                        No files in this group yet.
                    </div>
                 ) : (
                    <div className="overflow-y-auto flex-grow">
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
                                       {/* Add download button */}
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
                    </div>
                 )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupFiles; 