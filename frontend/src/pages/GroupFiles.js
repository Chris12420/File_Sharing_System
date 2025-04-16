import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Users, FolderPlus, Image, FileText, Music, Video, Upload, UserPlus, Trash2, Download } from 'lucide-react';
import apiClient from '../apiClient'; // Import the centralized client
import AddMemberModal from '../components/AddMemberModal';
// --- Reusable Components (Simplified for this page) ---
const FileIcon = ({ fileType }) => {
    switch (fileType) {
        case 'image': return _jsx(Image, { size: 18, className: "text-gray-500" });
        case 'video': return _jsx(Video, { size: 18, className: "text-gray-500" });
        case 'audio': return _jsx(Music, { size: 18, className: "text-gray-500" });
        default: return _jsx(FileText, { size: 18, className: "text-gray-500" });
    }
};
// --- Group Files Page Component ---
const GroupFiles = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [viewMode, setViewMode] = useState('idle');
    const [newGroupName, setNewGroupName] = useState('');
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState(null);
    // State for fetched details
    const [currentMembers, setCurrentMembers] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    // State for Add Member Modal
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [addMemberError, setAddMemberError] = useState(null);
    const [fileActionLoading, setFileActionLoading] = useState(null); // Store ID of file being acted upon
    const [fileActionError, setFileActionError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    // Ref for the hidden file input
    const fileInputRef = useRef(null);
    // Fetch user's groups on component mount
    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoadingGroups(true);
            setError(null);
            try {
                // Use apiClient
                const response = await apiClient.get('/api/groups'); // No config needed if defaults are set in apiClient
                // Map backend response (_id to id)
                const fetchedGroups = response.data.map((group) => ({
                    id: group._id,
                    name: group.name
                    // Map other fields if needed
                }));
                setGroups(fetchedGroups);
            }
            catch (err) { // Catch specific axios error if needed
                console.error('Error fetching groups:', err);
                setError(err.response?.data?.message || 'Failed to load groups.');
            }
            finally {
                setIsLoadingGroups(false);
            }
        };
        fetchGroups();
    }, []); // Empty dependency array means run once on mount
    // Fetch group details when a group is selected
    const handleSelectGroup = async (groupId) => {
        setSelectedGroupId(groupId);
        setViewMode('details');
        setIsLoadingDetails(true);
        setError(null);
        setCurrentMembers([]); // Clear previous details
        setCurrentFiles([]);
        try {
            // Use apiClient
            const response = await apiClient.get(`/api/groups/${groupId}`);
            // Extract data from response
            const { group: groupDetails, files: groupFiles } = response.data;
            // Update members state
            setCurrentMembers(groupDetails.members.map((m) => ({
                user: {
                    _id: m.user?._id || 'unknown', // Handle potential missing user data
                    username: m.user?.username || 'Unknown User'
                },
                role: m.role
            })));
            // Update files state
            setCurrentFiles(groupFiles.map((f) => ({
                id: f._id,
                name: f.originalName || f.filename, // Use appropriate field from backend model
                size: formatSize(f.size || 0), // Use helper and handle missing size
                type: f.mimeType?.split('/')[0] || 'document', // Basic type extraction
                uploadDate: formatDate(f.createdAt || Date.now()), // Use helper and handle missing date
                uploadedBy: f.ownerId?.username || 'Unknown' // Use populated owner username
            })));
        }
        catch (err) {
            console.error(`Error fetching details for group ${groupId}:`, err);
            setError(err.response?.data?.message || 'Failed to load group details.');
            setViewMode('idle'); // Revert view if details fail
            setSelectedGroupId(null);
        }
        finally {
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
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim())
            return;
        setError(null);
        // Add loading state if needed
        try {
            // Use apiClient
            const response = await apiClient.post('/api/groups', { name: newGroupName.trim() }
            // No need for { withCredentials: true } here if set globally
            );
            const newGroup = { id: response.data._id, name: response.data.name }; // Axios response data is in response.data
            setGroups([...groups, newGroup]);
            setSelectedGroupId(newGroup.id);
            setViewMode('details');
            setNewGroupName('');
            // Fetch details for the newly created group
            await handleSelectGroup(newGroup.id);
        }
        catch (err) {
            console.error('Error creating group:', err);
            setError(err.response?.data?.message || 'Failed to create group.');
        }
    };
    // Placeholder: Add API calls for delete, add member, upload
    const handleDeleteFile = async (fileId) => {
        // Confirmation dialog
        if (!window.confirm('Are you sure you want to delete this file permanently?')) {
            return;
        }
        setFileActionLoading(fileId); // Indicate loading for this specific file
        setFileActionError(null);
        try {
            // Use apiClient
            await apiClient.delete(`/api/files/${fileId}`);
            // Remove file from state on success
            setCurrentFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
            console.log(`File ${fileId} deleted successfully.`);
        }
        catch (err) {
            console.error(`Error deleting file ${fileId}:`, err);
            setFileActionError(`Failed to delete file: ${err.response?.data?.message || err.message}`);
            // Optionally show error more prominently
        }
        finally {
            setFileActionLoading(null); // Clear loading state
        }
    };
    // Add download handler
    const handleDownloadGroupFile = (fileId) => {
        // Construct the download URL using environment variable
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const downloadUrl = `${baseUrl}/api/files/download/${fileId}`;
        // Open the URL in a new tab (or same tab) to trigger download
        window.open(downloadUrl, '_blank');
        // Optionally track download interaction if needed
        console.log(`Download triggered for file: ${fileId}`);
    };
    // Open the Add Member modal
    const handleAddMember = () => {
        if (!selectedGroupId)
            return;
        setAddMemberError(null); // Clear previous errors
        setIsAddMemberModalOpen(true);
    };
    // Handle the submission from the modal
    const handleConfirmAddMember = async (identifier) => {
        if (!selectedGroupId)
            return;
        setAddMemberLoading(true);
        setAddMemberError(null);
        try {
            // Use apiClient
            const response = await apiClient.post(`/api/groups/${selectedGroupId}/members`, { identifier } // Send identifier (username or email)
            );
            // Update the members list with the response from the server
            setCurrentMembers(response.data.map((m) => ({
                user: { _id: m.user._id, username: m.user.username },
                role: m.role
            })));
            setIsAddMemberModalOpen(false); // Close modal on success
        }
        catch (err) {
            console.error('Error adding member:', err);
            setAddMemberError(err.response?.data?.message || 'Failed to add member.');
            // Keep modal open on error
        }
        finally {
            setAddMemberLoading(false);
        }
    };
    // Trigger the hidden file input
    const handleUploadFile = () => {
        if (!selectedGroupId)
            return;
        setFileActionError(null); // Clear previous errors
        fileInputRef.current?.click(); // Click the hidden input
    };
    // Handle the actual file upload after selection
    const handleFileSelected = async (event) => {
        if (!event.target.files || event.target.files.length === 0 || !selectedGroupId) {
            return; // No file selected or no group selected
        }
        const file = event.target.files[0];
        event.target.value = ''; // Reset input immediately to allow re-uploading same file
        setIsUploading(true);
        setFileActionError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            // Use apiClient
            const response = await apiClient.post(`/api/groups/${selectedGroupId}/files`, formData, {
                // Still need headers for multipart/form-data
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Add the newly uploaded file to the state
            const newFileData = response.data.file; // Axios data is in response.data
            const newFile = {
                id: newFileData._id,
                name: newFileData.originalName,
                size: formatSize(newFileData.size || 0),
                type: newFileData.mimeType?.split('/')[0] || 'document',
                uploadDate: formatDate(newFileData.createdAt || Date.now()),
                uploadedBy: newFileData.ownerId?.username || 'Unknown'
            };
            setCurrentFiles(prevFiles => [newFile, ...prevFiles]); // Add to the top
            console.log('File uploaded to group successfully:', newFile);
        }
        catch (err) {
            console.error('Error uploading file to group:', err);
            setFileActionError(`Upload failed: ${err.response?.data?.message || err.message}`);
        }
        finally {
            setIsUploading(false);
        }
    };
    // Helper function (example)
    const formatSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;
    return (_jsxs("div", { className: "p-6 flex gap-6 h-full", children: [_jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileSelected, style: { display: 'none' } }), _jsxs("div", { className: "w-1/4 bg-white rounded-lg shadow p-4 flex flex-col", children: [_jsx("h2", { className: "text-lg font-semibold mb-4 border-b pb-2", children: "Your Groups" }), _jsxs("button", { onClick: handleShowCreateForm, className: "w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm", children: [_jsx(FolderPlus, { size: 18 }), _jsx("span", { children: "Create New Group" })] }), _jsx("div", { className: "flex-grow space-y-1 overflow-y-auto", children: isLoadingGroups ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Loading groups..." })) : error && groups.length === 0 ? (_jsxs("p", { className: "text-red-500 text-center py-4", children: ["Error: ", error] })) : groups.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "No groups found. Create one!" })) : (_jsx("ul", { children: groups.map((group) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleSelectGroup(group.id), disabled: isLoadingDetails && selectedGroupId === group.id, className: `w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${selectedGroupId === group.id
                                        ? 'bg-purple-100 text-purple-800 font-medium'
                                        : 'hover:bg-gray-100 text-gray-700'} ${(isLoadingDetails && selectedGroupId === group.id) ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsx(Users, { size: 18 }), _jsx("span", { className: "truncate", children: group.name }), isLoadingDetails && selectedGroupId === group.id && (_jsx("span", { className: "ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700" }))] }) }, group.id))) })) })] }), _jsxs("div", { className: "w-3/4 bg-white rounded-lg shadow p-6 flex flex-col", children: [error && viewMode !== 'details' && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm", children: ["Error: ", error] })), viewMode === 'idle' && (_jsxs("div", { className: "flex-grow flex flex-col items-center justify-center text-gray-500", children: [_jsx(FolderPlus, { size: 48, className: "mb-4" }), _jsx("p", { children: "Select a group from the list or create a new one." })] })), viewMode === 'create' && (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Create New Group" }), _jsxs("form", { onSubmit: handleCreateGroup, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "groupName", className: "block text-sm font-medium text-gray-700 mb-1", children: "Group Name" }), _jsx("input", { type: "text", id: "groupName", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500", placeholder: "Enter group name...", required: true })] }), _jsx("button", { type: "submit", 
                                        // Add disabled state while creating
                                        className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700", children: "Create Group" })] })] })), viewMode === 'details' && isLoadingDetails && (_jsx("div", { className: "flex-grow flex items-center justify-center text-gray-500", children: "Loading group details..." })), viewMode === 'details' && !isLoadingDetails && selectedGroup && (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "border-b pb-4 mb-4", children: [error && (_jsxs("div", { className: "mb-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm", children: ["Error loading details: ", error] })), _jsx("h2", { className: "text-2xl font-semibold mb-2", children: selectedGroup.name }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("button", { onClick: handleAddMember, className: "px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1", children: [_jsx(UserPlus, { size: 16 }), " Add Member"] }), _jsx("button", { onClick: handleUploadFile, disabled: isUploading, className: "px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed", children: isUploading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" }), " Uploading..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { size: 16 }), " Upload File"] })) })] })] }), _jsxs("div", { className: "flex-grow flex flex-col md:flex-row gap-6 overflow-hidden", children: [_jsxs("div", { className: "w-full md:w-1/3 border-r pr-6 flex flex-col", children: [_jsxs("h3", { className: "text-lg font-semibold mb-3", children: ["Members (", currentMembers.length, ")"] }), _jsx("ul", { className: "space-y-2 overflow-y-auto flex-grow", children: currentMembers.length === 0 ? (_jsx("li", { className: "text-gray-400", children: "No members yet." })) : (currentMembers.map(member => (_jsx("li", { className: "flex justify-between items-center p-2 rounded hover:bg-gray-50", children: _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: member.user.username }), _jsx("span", { className: `ml-2 text-xs px-1.5 py-0.5 rounded ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`, children: member.role })] }) }, member.user._id)))) })] }), _jsxs("div", { className: "w-full md:w-2/3 flex flex-col", children: [_jsxs("h3", { className: "text-lg font-semibold mb-3", children: ["Group Files (", currentFiles.length, ")"] }), isUploading && _jsx("p", { className: 'text-sm text-blue-600', children: "Uploading file..." }), _jsx("div", { className: "overflow-y-auto flex-grow", children: currentFiles.length === 0 ? (_jsx("div", { className: "flex-grow flex items-center justify-center text-gray-400", children: "No files in this group yet." })) : (_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50 sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-2 px-3", children: "Name" }), _jsx("th", { className: "text-left py-2 px-3", children: "Size" }), _jsx("th", { className: "text-left py-2 px-3", children: "Uploaded By" }), _jsx("th", { className: "text-left py-2 px-3", children: "Date" }), _jsx("th", { className: "text-right py-2 px-3", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: currentFiles.map(file => (_jsxs("tr", { className: `hover:bg-gray-50 ${fileActionLoading === file.id ? 'opacity-50' : ''}`, children: [_jsx("td", { className: "py-2 px-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileIcon, { fileType: file.type }), _jsx("span", { className: "truncate max-w-xs", children: file.name })] }) }), _jsx("td", { className: "py-2 px-3 text-gray-500", children: file.size }), _jsx("td", { className: "py-2 px-3 text-gray-500", children: file.uploadedBy }), _jsx("td", { className: "py-2 px-3 text-gray-500", children: file.uploadDate }), _jsx("td", { className: "py-2 px-3", children: _jsxs("div", { className: "flex justify-end gap-1", children: [_jsx("button", { className: "p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed", title: "Download", onClick: () => handleDownloadGroupFile(file.id), disabled: fileActionLoading === file.id, children: _jsx(Download, { size: 16 }) }), _jsx("button", { className: "p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed", title: "Delete", onClick: () => handleDeleteFile(file.id), disabled: fileActionLoading === file.id, children: fileActionLoading === file.id ? (_jsx("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 inline-block" })) : (_jsx(Trash2, { size: 16 })) })] }) })] }, file.id))) })] })) }), fileActionError && (_jsxs("p", { className: "text-red-500 text-sm mt-2", children: ["Error: ", fileActionError] }))] })] }), _jsx(AddMemberModal, { isOpen: isAddMemberModalOpen, onClose: () => setIsAddMemberModalOpen(false), onSubmit: handleConfirmAddMember, isLoading: addMemberLoading, error: addMemberError })] }))] })] }));
};
export default GroupFiles;
