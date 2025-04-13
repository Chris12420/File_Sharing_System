import React, { useState, useEffect } from 'react';
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
}

const FileListTable: React.FC<FileListProps> = ({ files, onDelete, onShare, uploading, onUpload }) => {
  if (files.length === 0 && !uploading) {
    return (
      <div className="text-center py-6">
        <File size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 mb-6">No files uploaded yet</p>
        <DragDropUpload onUpload={onUpload} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <DragDropUpload onUpload={onUpload} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-left py-3 px-4">Uploaded</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {files.map(file => (
              <FileItemRow 
                key={file.id} 
                file={file} 
                onDelete={onDelete} 
                onShare={onShare} 
              />
            ))}
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
    console.log(`Deleting file ${id} (API call needed)`);
    setFiles(files.filter(file => file.id !== id));
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Files</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated && currentUser && (
            <span className="text-sm text-gray-600">Welcome, {currentUser.username}!</span>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"> {/* Use react-router-dom Link */}
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                   Login
                </div>
              </Link>
              <Link to="/register"> {/* Use react-router-dom Link */}
                <div className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm cursor-pointer">
                   Register
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* File Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-700 font-medium">Filter by:</span>
          
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-md bg-purple-100 text-purple-800 font-medium flex items-center gap-1">
              <FileText size={16} />
              <span>All</span>
            </button>
            
            <button className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1">
              <FileText size={16} />
              <span>Documents</span>
            </button>
            
            <button className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1">
              <Image size={16} />
              <span>Images</span>
            </button>
            
            <button className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1">
              <Video size={16} />
              <span>Videos</span>
            </button>
            
            <button className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1">
              <Music size={16} />
              <span>Audio</span>
            </button>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search files..." 
                className="border rounded-lg py-1.5 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select className="border rounded-lg py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option>Sort by: Newest</option>
              <option>Sort by: Oldest</option>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: Name (Z-A)</option>
              <option>Sort by: Size (Large-Small)</option>
              <option>Sort by: Size (Small-Large)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* File List */}
      <div className="bg-white rounded-lg shadow p-6">
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
            files={files} 
            onDelete={handleDelete} 
            onShare={handleShare}
            uploading={uploading}
            onUpload={handleFileUpload}
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