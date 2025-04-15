import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Download, Share2, Upload, File, FileText, Music, Video, Image } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// --- Reusable Components (Potentially move to src/components later) ---

interface FileItem {
  id: number;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  shared: boolean;
}

interface DragDropUploadProps {
  onUpload: (files: FileList) => void;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
      <p className="mb-1 font-medium">Drag and drop files here</p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2">
        <Upload size={18} />
        <span>Browse Files</span>
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          multiple 
        />
      </label>
    </div>
  );
};

const FileIcon: React.FC<{ fileType: string }> = ({ fileType }) => {
  switch (fileType) {
    case 'image':
      return <Image size={20} />;
    case 'video':
      return <Video size={20} />;
    case 'audio':
      return <Music size={20} />;
    default:
      return <FileText size={20} />;
  }
};

interface FileItemProps {
  file: FileItem;
  onDelete: (id: number) => void;
  onShare: (file: FileItem) => void;
}

const FileItemRow: React.FC<FileItemProps> = ({ file, onDelete, onShare }) => {
  // Function to handle download click
  const handleDownload = (fileId: number) => {
    // Construct the download URL using environment variable
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/api/files/download/${fileId}`;
    // Open the URL in a new tab (or same tab) to trigger download
    window.open(downloadUrl, '_blank');
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <FileIcon fileType={file.type} />
          <span className="truncate max-w-sm">{file.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-500">{file.size}</td>
      <td className="py-3 px-4 text-gray-500">{file.uploadDate}</td>
      <td className="py-3 px-4">
        {file.shared ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Shared
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Private
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-end gap-2">
          <button 
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Download"
            onClick={() => handleDownload(file.id)}
          >
            <Download size={18} />
          </button>
          <button 
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Share"
            onClick={() => onShare(file)}
          >
            <Share2 size={18} />
          </button>
          <button 
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
            onClick={() => onDelete(file.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface FileListProps {
  files: FileItem[];
  onDelete: (id: number) => void;
  onShare: (file: FileItem) => void;
  uploading: boolean;
  onUpload: (files: FileList) => void;
  sortConfig: { key: keyof FileItem | null; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof FileItem) => void;
}

const FileListTable: React.FC<FileListProps> = ({ 
  files, 
  onDelete, 
  onShare, 
  uploading, 
  onUpload, 
  sortConfig,
  requestSort
}) => {
  // Helper to get sort indicator
  const getSortIndicator = (key: keyof FileItem) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  if (files.length === 0 && !uploading) {
    // Check if files prop itself is empty (could be due to filtering)
    // The original check for "No files uploaded yet" is handled in FilesView now
    // This section might not be needed anymore depending on FilesView logic
    // We'll keep the table structure for when filters result in empty list
    // return (
    //   <div className="text-center py-6">
    //     <File size={48} className="mx-auto text-gray-400 mb-4" />
    //     <p className="text-gray-500 mb-6">No files match your current filters.</p>
    //     {/* Keep upload accessible even if filtered list is empty? Or move upload elsewhere? */}
    //     {/* <DragDropUpload onUpload={onUpload} /> */}
    //   </div>
    // );
  }

  return (
    <div>
      {/* Upload component is now usually rendered outside/above the table in FilesView */}
      {/* <div className="mb-6">
        <DragDropUpload onUpload={onUpload} />
      </div> */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Make headers clickable and add indicators */}
              <th className="text-left py-3 px-4 cursor-pointer hover:bg-gray-100 select-none" onClick={() => requestSort('name')}>
                Name{getSortIndicator('name')}
              </th>
              <th className="text-left py-3 px-4 cursor-pointer hover:bg-gray-100 select-none" onClick={() => requestSort('size')}>
                Size{getSortIndicator('size')}
              </th>
              <th className="text-left py-3 px-4 cursor-pointer hover:bg-gray-100 select-none" onClick={() => requestSort('uploadDate')}>
                Uploaded{getSortIndicator('uploadDate')}
              </th>
              {/* Make Status header clickable and add indicator */}
              <th className="text-left py-3 px-4 cursor-pointer hover:bg-gray-100 select-none" onClick={() => requestSort('shared')}>
                Status{getSortIndicator('shared')}
              </th>
              <th className="text-right py-3 px-4 select-none">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {files.length > 0 ? (
              files.map(file => (
                <FileItemRow 
                  key={file.id} 
                  file={file} 
                  onDelete={onDelete} 
                  onShare={onShare} 
                />
              ))
            ) : (
              // Show message if no files match filters/search
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  {uploading ? 'Uploading...' : 'No files match your current criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ShareModalProps {
  file: FileItem | null;
  onClose: () => void;
  onToggleShare: (id: number) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ file, onClose, onToggleShare }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopy = () => {
    // In a real app, this would copy to clipboard
    setCopySuccess(true);
    
    // Reset copy success message after 2 seconds
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">Share File</h3>
        <p className="mb-2 text-gray-600">{file?.name}</p>
        
        <div className="flex items-center mt-4 mb-6">
          <input
            type="text"
            readOnly
            value={`https://fileshare.example/share/${file?.id}`}
            className="flex-1 border rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white py-2 px-4 rounded-r-lg hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
        
        {copySuccess && (
          <p className="text-green-600 mb-4">Link copied to clipboard!</p>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => file && onToggleShare(file.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {file?.shared ? 'Disable Sharing' : 'Enable Sharing'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Files Page Component ---

const FilesView: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentFileToShare, setCurrentFileToShare] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);
  // Add state for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video', 'audio', 'document'
  const [sortConfig, setSortConfig] = useState<{ key: keyof FileItem | null; direction: 'ascending' | 'descending' }>({ key: 'uploadDate', direction: 'descending' });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use environment variable for API base URL
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/check`;
        const response = await fetch(apiUrl, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setCurrentUser(data.user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Auth check failed:', e);
        setError('Could not verify authentication status.');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  // Fetch files only if authenticated
  useEffect(() => {
    const fetchFiles = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Assuming your API is running on localhost:5001
        const response = await fetch('http://localhost:5001/api/files', {
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Add Accept header
          },
        });
        
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Please log in to access files.');
          setIsLoading(false); // Stop loading on auth error
          return;
        }
        
        if (!response.ok) {
          // Try to parse error message from backend if possible
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            // Backend might not have sent JSON
            console.warn("Could not parse error response as JSON", jsonError);
          }
          throw new Error(errorMessage);
        }
        
        const fetchedData = await response.json();

        // Map fetched data to FileItem structure
        const mappedFiles: FileItem[] = fetchedData.map((file: any) => ({
          id: file._id, // Use _id from MongoDB
          name: file.originalName || file.name, // Prefer originalName, fallback to name
          size: file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A', // Format size, handle missing size
          // Determine type based on mimeType or type field
          type: file.mimeType ? file.mimeType.split('/')[0] : (file.type ? file.type.split('/')[0] : 'document'),
          // Use createdAt for newer files, uploadDate for older mock data
          uploadDate: file.createdAt ? new Date(file.createdAt).toLocaleDateString() : (file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : 'N/A'),
          shared: file.shared || false // Handle shared status
        }));

        setFiles(mappedFiles); // Set the mapped data

      } catch (e: any) {
        console.error("Failed to fetch files:", e);
        setError(e.message || "Failed to load files.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [isAuthenticated]); // Dependency array remains the same

  const handleFileUpload = async (uploadedFiles: FileList) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(uploadedFiles).forEach(file => {
        formData.append('file', file);
      });
      
      // Use environment variable for API base URL
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/files/upload`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include', // Important for sending session cookies
        body: formData, // Send the form data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上傳檔案失敗');
      }

      const uploadedFileResponse = await response.json();

      // Access the actual file data from the 'file' property of the response
      const newFileData = uploadedFileResponse.file;

      if (!newFileData) {
          throw new Error('Backend response did not contain file data.');
      }

      // Add the new file to the list using data from newFileData
      setFiles(prevFiles => [{
        id: newFileData.id, // Use newFileData.id
        name: newFileData.originalName, // Use newFileData.originalName
        size: `${(newFileData.size / (1024 * 1024)).toFixed(2)} MB`, // Use newFileData.size
        type: newFileData.mimeType ? newFileData.mimeType.split('/')[0] : 'document',
        uploadDate: new Date(newFileData.createdAt).toLocaleDateString(), // Use newFileData.createdAt
        shared: newFileData.shared || false // Use newFileData.shared (might still be undefined if not sent)
      }, ...prevFiles]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || '上傳檔案時發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // 显示确认提示
    const confirmDelete = window.confirm('Confirm delete this file');
    if (!confirmDelete) {
      return; // 如果用户取消，则退出函数
    }
  
    try {
      // 调用后端 API 删除文件
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/files/${id}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        credentials: 'include', // 确保发送会话 cookie
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file');
      }
  
      // 从前端状态中移除文件
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      console.log(`File ${id} deleted successfully.`);
    } catch (error: any) {
      console.error(`Error deleting file ${id}:`, error.message || error);
      setError(error.message || 'An error occurred while deleting the file.');
    }
  };

  const handleShare = (file: FileItem) => {
    setCurrentFileToShare(file);
    setShareModalOpen(true);
  };

  const toggleShareStatus = async (id: number) => {
    console.log(`Toggling share status for ${id} (API call needed)`);
    const originalFiles = files;
    setFiles(files.map(f => 
      f.id === id ? {...f, shared: !f.shared} : f
    ));
    setShareModalOpen(false);
  };

  // Logout function
  const handleLogout = async () => {
    setError(null);
    try {
      // Use environment variable for API base URL
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      // Clear state and update auth status
      setIsAuthenticated(false);
      setCurrentUser(null);
      setFiles([]); // Clear files list
      setError('You have been logged out.'); // Optional: show logout message
      // router.push('/login'); // Optional: redirect to login

    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'An error occurred during logout.');
    }
  };

  // Memoized calculation for filtered and sorted files
  const filteredAndSortedFiles = useMemo(() => {
    let sortableItems = [...files];

    // Apply filtering
    if (filterType !== 'all') {
      sortableItems = sortableItems.filter(file => file.type === filterType);
    }

    // Apply search
    if (searchTerm) {
      sortableItems = sortableItems.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        let comparison = 0;

        // Specific sort logic for different types
        if (sortConfig.key === 'size') {
          const parseSize = (sizeStr: string): number => {
            if (!sizeStr || sizeStr === 'N/A') return 0;
            const match = sizeStr.match(/([\d.]+)\s*MB/i);
            return match ? parseFloat(match[1]) * 1024 * 1024 : 0; // Convert MB to bytes for accurate comparison
          };
          comparison = parseSize(aValue as string) - parseSize(bValue as string);
        } else if (sortConfig.key === 'uploadDate') {
          const parseDate = (dateStr: string): number => {
            if (!dateStr || dateStr === 'N/A') return 0;
            try {
                // Attempt to parse common date formats, adjust if your format is different
                return new Date(dateStr).getTime();
            } catch (e) {
                return 0; // Handle invalid date strings
            }
          };
          comparison = parseDate(aValue as string) - parseDate(bValue as string);
        } else if (sortConfig.key === 'name') {
          // Case-insensitive string comparison for name
          comparison = (aValue as string).toLowerCase().localeCompare((bValue as string).toLowerCase());
        } else if (sortConfig.key === 'shared') {
          // Boolean comparison for shared status (false comes first when ascending)
          const boolA = aValue as boolean;
          const boolB = bValue as boolean;
          comparison = boolA === boolB ? 0 : (boolA ? 1 : -1);
        } else {
           // Default comparison for other types (if any)
           if (aValue < bValue) {
             comparison = -1;
           } else if (aValue > bValue) {
             comparison = 1;
           }
        }

        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    }
    return sortableItems;
  }, [files, searchTerm, filterType, sortConfig]);

  // Handler for sorting request from table headers (keep this)
  const requestSort = (key: keyof FileItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Files</h1>
      </div>
      
      {/* File Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-700 font-medium">Filter by:</span>
          
          <div className="flex flex-wrap gap-2">
            {/* Update filter buttons */}
            <button 
              onClick={() => setFilterType('all')} 
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 ${
                filterType === 'all' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <FileText size={16} />
              <span>All</span>
            </button>
            
            <button 
              onClick={() => setFilterType('document')} 
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 ${
                filterType === 'document' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <FileText size={16} />
              <span>Documents</span>
            </button>
            
            <button 
              onClick={() => setFilterType('image')} 
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 ${
                filterType === 'image' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <Image size={16} />
              <span>Images</span>
            </button>
            
            <button 
              onClick={() => setFilterType('video')} 
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 ${
                filterType === 'video' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <Video size={16} />
              <span>Videos</span>
            </button>
            
            <button 
              onClick={() => setFilterType('audio')} 
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 ${
                filterType === 'audio' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <Music size={16} />
              <span>Audio</span>
            </button>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              {/* Update search input */}
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchTerm} // Bind value
                onChange={(e) => setSearchTerm(e.target.value)} // Add onChange
                className="border rounded-lg py-1.5 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* File List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
           <DragDropUpload onUpload={handleFileUpload} />
        </div>

        {isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading files...</p>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            {!isAuthenticated && (
              <Link
                to="/login" // Use react-router-dom Link
                className="block mt-2 text-blue-600 hover:text-blue-800"
              >
                Click here to log in
              </Link>
            )}
          </div>
        )}
        
        {uploading && (
          <div className="bg-blue-50 p-3 mb-4 rounded border border-blue-200">
            <span className="text-blue-600">Uploading files, please wait...</span>
          </div>
        )}
        
        {!isLoading && !error && (
          <FileListTable 
            files={filteredAndSortedFiles} 
            onDelete={handleDelete} 
            onShare={handleShare}
            uploading={uploading}
            onUpload={handleFileUpload}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && currentFileToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Share File</h3>
            <p className="mb-2 text-gray-600">{currentFileToShare.name}</p>
            
            <div className="flex items-center mt-4 mb-6">
              <input
                type="text"
                readOnly
                value={`https://fileshare.example/share/${currentFileToShare.id}`}
                className="flex-1 border rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-r-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => toggleShareStatus(currentFileToShare.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {currentFileToShare.shared ? 'Disable Sharing' : 'Enable Sharing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesView; 