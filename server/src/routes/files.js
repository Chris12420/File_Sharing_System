const express = require('express');
const router = express.Router();

// Mock data (replace with database logic later)
let mockFiles = [
  { id: 1, name: 'Project Proposal.docx', size: '2.3 MB', type: 'document', uploadDate: '2025-03-28', shared: false },
  { id: 2, name: 'Presentation.pptx', size: '5.7 MB', type: 'document', uploadDate: '2025-03-29', shared: true },
  { id: 3, name: 'Budget.xlsx', size: '1.1 MB', type: 'document', uploadDate: '2025-04-01', shared: false },
  { id: 4, name: 'Team Photo.jpg', size: '3.5 MB', type: 'image', uploadDate: '2025-03-25', shared: true },
  { id: 5, name: 'Meeting Recording.mp4', size: '45.2 MB', type: 'video', uploadDate: '2025-03-30', shared: false },
];
let nextId = 6;

// GET /api/files - List all files
router.get('/', (req, res) => {
  // In a real app, you might add filtering, sorting, pagination here
  res.json(mockFiles);
});

// GET /api/files/:id - Get a specific file (example)
router.get('/:id', (req, res) => {
  const fileId = parseInt(req.params.id, 10);
  const file = mockFiles.find(f => f.id === fileId);
  if (file) {
    res.json(file);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// POST /api/files/upload - Simulate file upload (no actual file handling)
router.post('/upload', (req, res) => {
  // In a real app, you would use middleware like multer to handle file uploads
  // For now, we'll just pretend a file was uploaded based on request body
  const { name, size, type } = req.body;
  if (!name || !size || !type) {
    return res.status(400).json({ message: 'Missing file information in request body' });
  }

  const newFile = {
    id: nextId++,
    name,
    size, // Assume size is passed in request
    type, // Assume type is passed in request
    uploadDate: new Date().toISOString().split('T')[0],
    shared: false,
  };

  mockFiles.unshift(newFile); // Add to the beginning of the list
  console.log('Simulated file upload:', newFile);
  res.status(201).json(newFile);
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', (req, res) => {
  const fileId = parseInt(req.params.id, 10);
  const initialLength = mockFiles.length;
  mockFiles = mockFiles.filter(f => f.id !== fileId);

  if (mockFiles.length < initialLength) {
    console.log('Deleted file with id:', fileId);
    res.status(200).json({ message: 'File deleted successfully' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// --- TODO: Add routes for sharing, downloading, etc. ---

module.exports = router; 