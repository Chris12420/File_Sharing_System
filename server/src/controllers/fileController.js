const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config/db'); // Assuming config loads .env
const stream = require('stream'); // Import stream module
const { UserInteraction } = require('../models/DataAnalytics'); 
const Group = require('../models/Group'); // Import Group model for membership check
const asyncHandler = require('express-async-handler');



const updateUserInteraction = async (action) => {
  try {
    const interaction = await UserInteraction.findOneAndUpdate(
      { action },
      { $inc: { count: 1 } }, // 增加 count 字段的值
      { new: true, upsert: true } // 如果不存在则创建
    );
    console.log(`User interaction updated: ${action}, new count: ${interaction.count}`);
  } catch (error) {
    console.error(`Error updating user interaction for action: ${action}`, error);
  }
};


// Initialize GridFSBucket
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads' // Optional: bucket name, defaults to 'fs'
  });
  console.log('GridFSBucket Initialized for bucket: uploads');
});

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (can be adjusted)
  }
}).single('file');

const uploadFile = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        console.error('Unknown upload error (before GridFS):', err);
        return res.status(500).json({ message: `Error preparing file upload: ${err.message || err}` });
      }

      if (!req.file) {
        console.log('No file provided in request.');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check if gfsBucket is initialized
      if (!gfsBucket) {
        console.error("GridFSBucket not initialized. Check DB connection.");
        return res.status(500).json({ message: 'Storage service not available' });
      }

      console.log(`Attempting to upload file to GridFS: ${req.file.originalname}`);

      // Create a readable stream from the buffer in memory
      const readableStream = new stream.PassThrough();
      readableStream.end(req.file.buffer);

      // Open a GridFS upload stream
      console.log(`Original file mimetype from multer: ${req.file.mimetype}`);
      const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        // metadata: { uploadedBy: req.session.user.id } // Example metadata
      });

      // Capture the GridFS file ID immediately after stream creation
      const streamId = uploadStream.id;
      console.log(`GridFS stream created with ID: ${streamId}`);

      // Handle stream events
      uploadStream.on('error', (error) => {
        console.error('GridFS upload stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error uploading file to storage' });
        }
      });

      uploadStream.on('finish', async (/* fileInfo */) => { // Ignore the potentially undefined fileInfo argument
        console.log(`GridFS upload stream finished for ID: ${streamId}. Fetching details...`);

        // Manually fetch the file document using the captured stream ID
        let savedFileInfo;
        try {
            const cursor = gfsBucket.find({ _id: streamId }).limit(1);
            savedFileInfo = await cursor.next(); // Get the first document found
            if (!savedFileInfo) {
                console.error(`Failed to manually fetch GridFS file info for ID: ${streamId}`);
                if (!res.headersSent) {
                    return res.status(500).json({ message: 'Storage service failed to confirm upload details.' });
                }
                return;
            }
            console.log('Manually fetched GridFS file info:', savedFileInfo);
        } catch (fetchError) {
            console.error(`Error manually fetching GridFS file info for ID: ${streamId}`, fetchError);
            if (!res.headersSent) {
                 return res.status(500).json({ message: 'Storage service failed to retrieve upload details.' });
            }
            return;
        }


        // Proceed with saving metadata using the manually fetched savedFileInfo
        try {
            const newFile = new File({
                filename: savedFileInfo.filename, // Use filename from fetched doc
                originalName: req.file.originalname,
                gridfsId: savedFileInfo._id, // Use ID from fetched doc
                size: savedFileInfo.length, // Use size from fetched doc
                mimeType: savedFileInfo.contentType, // Use contentType from fetched doc
                uploadedBy: req.user.id, // Use req.user instead of req.session.user
                ownerId: req.user.id,    // Set required ownerId field
                isPublic: false,         // Set required isPublic field (defaulting to false)
                // groupId: null // Explicitly null for personal files, or leave as default if schema allows
            });

            await newFile.save();
            console.log('File metadata saved to DB:', newFile._id);
            
            await updateUserInteraction('Upload');

            // Respond to client
            res.status(201).json({
                message: 'File uploaded successfully',
                file: {
                    id: newFile._id,
                    filename: newFile.filename,
                    originalName: newFile.originalName,
                    size: newFile.size,
                    mimeType: newFile.mimeType,
                    uploadedBy: newFile.uploadedBy,
                    gridfsId: newFile.gridfsId,
                    createdAt: newFile.createdAt
                }
            });
        } catch (dbError) {
            console.error('Error saving file metadata to DB:', dbError);
             // Attempt to delete the orphaned GridFS file if DB save fails
             try {
                 // Use the captured streamId here as well
                 await gfsBucket.delete(streamId);
                 console.log(`Orphaned GridFS file ${streamId} deleted due to DB error.`);
             } catch (deleteError) {
                 console.error(`Failed to delete orphaned GridFS file ${streamId}:`, deleteError);
             }
            if (!res.headersSent) {
                 res.status(500).json({ message: 'Error saving file details' });
            }
        }
      });

      // Pipe the memory stream to the GridFS stream
      readableStream.pipe(uploadStream);

    });
  } catch (error) {
    // This top-level catch might catch errors before 'upload' middleware runs
    console.error('Error in uploadFile controller (outer):', error);
    if (!res.headersSent) {
       res.status(500).json({ message: 'Server error during file upload process' });
    }
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileMetadata = await File.findById(req.params.id);
    if (!fileMetadata) {
      console.log(`File metadata not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'File metadata not found' });
    }

    if (!fileMetadata.gridfsId) {
      console.log(`GridFS ID missing for metadata ID: ${req.params.id}`);
      return res.status(404).json({ message: 'File data reference not found' });
    }

    // --- Authorization Check ---
    const userId = req.user.id;
    if (fileMetadata.groupId) { // It's a group file
      const group = await Group.findById(fileMetadata.groupId);
      if (!group) {
          // File metadata points to a non-existent group (data inconsistency)
          console.error(`Group ${fileMetadata.groupId} not found for file ${fileMetadata._id}`);
          return res.status(404).json({ message: 'Associated group not found' });
      }
      const isMember = group.members.some(member => member.user.toString() === userId);
      if (!isMember) {
          console.log(`User ${userId} is not a member of group ${fileMetadata.groupId}`);
          return res.status(403).json({ message: 'You do not have permission to download this file' });
      }
    } else { // It's a personal file
      if (fileMetadata.ownerId.toString() !== userId) {
          console.log(`User ${userId} is not the owner of personal file ${fileMetadata._id}`);
          return res.status(403).json({ message: 'You do not have permission to download this file' });
      }
    }
    // --- End Authorization Check ---

    // Check if gfsBucket is initialized
    if (!gfsBucket) {
      console.error("GridFSBucket not initialized. Check DB connection.");
      return res.status(500).json({ message: 'Storage service not available' });
    }

    // Get the GridFS file ID from our metadata
    // Ensure gridfsId is converted to ObjectId for lookup
    let gridfsId;
    try {
        gridfsId = new mongoose.Types.ObjectId(fileMetadata.gridfsId);
    } catch (castError) {
        console.error('Invalid GridFS ID format in metadata:', fileMetadata.gridfsId, castError);
        return res.status(500).json({ message: 'Internal file reference error' });
    }

    // Check if file exists in GridFS by attempting to open download stream
    // This is more direct than find().toArray()
    const downloadStream = gfsBucket.openDownloadStream(gridfsId);

    downloadStream.on('error', (error) => {
      // Handle errors, e.g., file not found in GridFS
      if (error.code === 'ENOENT' || error.message.includes('File not found')) {
        console.log(`File not found in GridFS for ID: ${gridfsId}`);
        if (!res.headersSent) {
          return res.status(404).json({ message: 'File not found in storage' });
        }
      } else {
        console.error('Error streaming file from GridFS:', error);
        if (!res.headersSent) {
           res.status(500).json({ message: 'Error downloading file' });
        }
      }
       // Ensure response ends if an error occurs during streaming
       if (!res.finished) {
           res.end();
       }
    });

     downloadStream.on('file', (fileDoc) => {
        // 'file' event is emitted before data starts streaming
        // We can set headers here using info from the GridFS file document
        console.log(`Starting download for: ${fileDoc.filename} (Original: ${fileMetadata.originalName})`);
        res.set({
          'Content-Type': fileDoc.contentType || fileMetadata.mimeType, // Prefer GridFS contentType
          'Content-Length': fileDoc.length, // Set content length for progress indication
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMetadata.originalName)}"`,
        });
     });


    // Pipe the GridFS stream directly to the response
    downloadStream.pipe(res).on('finish', async() => {
        console.log(`File ${fileMetadata.originalName} downloaded successfully.`);
        // res.end() is called automatically by pipe on finish
        // Update user interaction for download
        try {
          await updateUserInteraction('Download'); // 更新用户交互数据
        } catch (error) {
          console.error('Error updating user interaction for download:', error);
        }
    }).on('error', (pipeError) => {
        // Handle errors during the piping process (e.g., client disconnects)
        console.error('Error piping download stream to response:', pipeError);
         // Ensure response ends if an error occurs during piping
         if (!res.finished) {
            res.end();
         }
    });

  } catch (error) {
    console.error('Error in downloadFile controller:', error);
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Invalid file ID format' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error processing download request' });
    }
  }
};

const getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID

    // Find files owned by the current user and NOT belonging to any group
    const files = await File.find({ ownerId: userId, groupId: null })
      .populate('uploadedBy', 'username') // uploadedBy might be redundant if ownerId is always populated
      .populate('ownerId', 'username') // Populate owner username
      .sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    console.error('Error in getAllFiles (personal files):', error);
    res.status(500).json({ message: 'Error fetching personal files' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileMetadata = await File.findById(req.params.id);
    if (!fileMetadata) {
      return res.status(404).json({ message: 'File metadata not found' });
    }

    // --- Authorization Check ---
    const userId = req.user.id;
    let canDelete = false;

    if (fileMetadata.groupId) { // It's a group file
      const group = await Group.findById(fileMetadata.groupId);
      if (group) { // Ensure group exists
        const membership = group.members.find(member => member.user.toString() === userId);
        // Can delete if group admin OR the original uploader
        if ((membership && membership.role === 'admin') || fileMetadata.ownerId.toString() === userId) {
            canDelete = true;
        }
      } else {
         console.warn(`Group ${fileMetadata.groupId} not found for file ${fileMetadata._id} during delete attempt.`);
         // Decide if deletion should proceed if group is gone - likely yes if owner matches
         if (fileMetadata.ownerId.toString() === userId) {
             canDelete = true; // Allow owner to delete even if group is gone
         }
      }
    } else { // It's a personal file
      // Can delete if owner
      if (fileMetadata.ownerId.toString() === userId) {
          canDelete = true;
      }
    }

    if (!canDelete) {
       return res.status(403).json({ message: 'You do not have permission to delete this file' });
    }
    // --- End Authorization Check ---

    // Check if gfsBucket is initialized
    if (!gfsBucket) {
      console.error("GridFSBucket not initialized. Check DB connection.");
      return res.status(500).json({ message: 'Storage service not available' });
    }

    // Delete file from GridFS
    if (fileMetadata.gridfsId) {
        let gridfsId;
        try {
            gridfsId = new mongoose.Types.ObjectId(fileMetadata.gridfsId);
        } catch (castError) {
            console.error('Invalid GridFS ID format in metadata for deletion:', fileMetadata.gridfsId, castError);
            // Decide if you want to proceed with metadata deletion or return error
            return res.status(500).json({ message: 'Internal file reference error for deletion' });
        }

        try {
            await gfsBucket.delete(gridfsId);
            console.log(`File deleted from GridFS: ${gridfsId}`);
        } catch (gridfsError) {
            if (gridfsError.message.includes('File not found')) {
               console.warn(`File ${gridfsId} already not found in GridFS. Proceeding with metadata deletion.`);
            } else {
                console.error(`Error deleting file from GridFS (ID: ${gridfsId}):`, gridfsError);
                // Depending on desired behavior, you might want to stop here
                return res.status(500).json({ message: 'Error deleting file from storage' });
            }
        }
    } else {
        console.warn(`No GridFS ID found for metadata ${fileMetadata._id}. Skipping GridFS deletion.`);
    }


    // Delete file metadata from DB
    await File.findByIdAndDelete(req.params.id);
    console.log(`File metadata deleted from DB: ${req.params.id}`);

    await updateUserInteraction('Delete'); 

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFile controller:', error);
     if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Invalid file ID format' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error deleting file' });
    }
  }
};

// @desc    Toggle the public sharing status of a file
// @route   PUT /api/files/:id/share
// @access  Private (Owner only)
const toggleSharing = asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    res.status(400);
    throw new Error('Invalid file ID format');
  }

  const file = await File.findById(fileId);

  if (!file) {
    res.status(404);
    throw new Error('File not found');
  }

  // Authorization: Only the owner can toggle sharing
  if (file.ownerId.toString() !== userId) {
    res.status(403);
    throw new Error('You do not have permission to change sharing status for this file');
  }

  // Toggle the isPublic status
  file.isPublic = !file.isPublic;
  await file.save();

  console.log(`Sharing status for file ${fileId} toggled to: ${file.isPublic}`);
  
  // Return the updated file metadata (or just the status)
  res.status(200).json({
      id: file._id,
      isPublic: file.isPublic,
      // include other fields if needed by frontend
  });
});

// @desc    Download a publicly shared file
// @route   GET /api/files/public/:id 
// @access  Public (if file.isPublic is true)
const downloadPublicFile = asyncHandler(async (req, res) => {
  try {
    const fileMetadata = await File.findById(req.params.id);
    if (!fileMetadata || !fileMetadata.isPublic) { // Check if found AND isPublic
      return res.status(404).json({ message: 'File not found or not shared publicly' });
    }

    if (!fileMetadata.gridfsId) {
      return res.status(404).json({ message: 'File data reference not found' });
    }

    // Check if gfsBucket is initialized
    if (!gfsBucket) {
      console.error("GridFSBucket not initialized (public download).");
      return res.status(500).json({ message: 'Storage service not available' });
    }

    let gridfsId;
    try {
      gridfsId = new mongoose.Types.ObjectId(fileMetadata.gridfsId);
    } catch (castError) {
      return res.status(500).json({ message: 'Internal file reference error' });
    }

    const downloadStream = gfsBucket.openDownloadStream(gridfsId);

    downloadStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        if (!res.headersSent) {
          return res.status(404).json({ message: 'File not found in storage' });
        }
      } else {
        console.error('Error streaming public file from GridFS:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
      if (!res.finished) {
        res.end();
      }
    });

    downloadStream.on('file', (fileDoc) => {
      console.log(`Starting public download for: ${fileDoc.filename} (Original: ${fileMetadata.originalName})`);
      res.set({
        'Content-Type': fileDoc.contentType || fileMetadata.mimeType,
        'Content-Length': fileDoc.length,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMetadata.originalName)}"`,
      });
    });

    downloadStream.pipe(res).on('finish', () => {
      console.log(`Public file ${fileMetadata.originalName} downloaded successfully.`);
      // No interaction update for public downloads
    }).on('error', (pipeError) => {
      console.error('Error piping public download stream:', pipeError);
      if (!res.finished) {
        res.end();
      }
    });

  } catch (error) {
    console.error('Error in downloadPublicFile controller:', error);
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Invalid file ID format' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error processing public download request' });
    }
  }
});

module.exports = {
  uploadFile,
  downloadFile,
  getAllFiles,
  deleteFile,
  toggleSharing,
  downloadPublicFile,
}; 