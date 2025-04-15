const multer = require('multer');

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (adjust as needed)
  }
});

module.exports = upload; 