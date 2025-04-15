/* eslint-disable no-undef */
// MongoDB Database Initialization Script
// Usage: mongo <database_name> init-db.js

// --- Configuration ---
const dbName = 'fileShareDB'; // The name of the database
const filesCollectionName = 'files'; // The name of the files collection
const usersCollectionName = 'users'; // The name of the users collection
const USER_ROLES = ['admin', 'user']; // Updated roles

// --- Initialization Logic ---

// Switch to the target database (creates if it doesn't exist)
db = db.getSiblingDB(dbName);

print(`Switched to database: ${dbName}`);

// --- Create Files Collection ---

// Drop existing collection (optional, useful for development reset)
// db[filesCollectionName].drop(); 
// print(`Dropped existing collection: ${filesCollectionName}`);

// Create the files collection with potential validation (optional)
// Example validation (adjust as needed):
/*
db.createCollection(filesCollectionName, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "size", "type", "uploadDate", "storagePath"],
      properties: {
        name: { bsonType: "string", description: "must be a string and is required" },
        size: { bsonType: ["long", "int"], description: "must be an integer or long and is required" },
        type: { bsonType: "string", description: "must be a string and is required" },
        uploadDate: { bsonType: "date", description: "must be a date and is required" },
        storagePath: { bsonType: "string", description: "must be a string and is required" },
        shared: { bsonType: "bool", description: "must be a boolean" },
        ownerId: { bsonType: "objectId", description: "must be an ObjectId referencing a user" }
        // Add other fields as needed
      }
    }
  }
});
*/

// Create collection without validation (simpler start)
db.createCollection(filesCollectionName);
print(`Created collection: ${filesCollectionName}`);

// Create indexes for common queries (example)
db[filesCollectionName].createIndex({ name: 1 });
db[filesCollectionName].createIndex({ ownerId: 1 }); // If you add owner references
db[filesCollectionName].createIndex({ uploadDate: -1 });
print(`Created indexes for ${filesCollectionName}`);

// --- Insert Sample Files Data (Optional) ---
const sampleFiles = [
  { name: 'Project Proposal.docx', size: 2411724, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date('2025-03-28T10:00:00Z'), storagePath: '/uploads/mock/proposal.docx', shared: false },
  { name: 'Presentation.pptx', size: 5976883, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', uploadDate: new Date('2025-03-29T14:30:00Z'), storagePath: '/uploads/mock/presentation.pptx', shared: true },
  { name: 'Budget.xlsx', size: 1153433, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadDate: new Date('2025-04-01T09:15:00Z'), storagePath: '/uploads/mock/budget.xlsx', shared: false },
  { name: 'Team Photo.jpg', size: 3670016, type: 'image/jpeg', uploadDate: new Date('2025-03-25T16:45:00Z'), storagePath: '/uploads/mock/team.jpg', shared: true },
  { name: 'Meeting Recording.mp4', size: 47395635, type: 'video/mp4', uploadDate: new Date('2025-03-30T11:00:00Z'), storagePath: '/uploads/mock/meeting.mp4', shared: false },
];

// Only insert if the collection is empty
if (db[filesCollectionName].countDocuments() === 0) {
  db[filesCollectionName].insertMany(sampleFiles);
  print(`Inserted ${sampleFiles.length} sample documents into ${filesCollectionName}`);
} else {
  print(`${filesCollectionName} collection already contains data. Skipping sample data insertion.`);
}

// --- Create Users Collection (Optional) ---
// Uncomment and adapt if you need a users collection
/*
// db[usersCollectionName].drop();
// print(`Dropped existing collection: ${usersCollectionName}`);

db.createCollection(usersCollectionName, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "passwordHash"],
      properties: {
        username: { bsonType: "string", description: "must be a string and is required" },
        email: { bsonType: "string", description: "must be a string and is required" },
        passwordHash: { bsonType: "string", description: "must be a string and is required" },
        createdAt: { bsonType: "date", description: "must be a date" }
      }
    }
  }
});
print(`Created collection: ${usersCollectionName}`);

db[usersCollectionName].createIndex({ username: 1 }, { unique: true });
db[usersCollectionName].createIndex({ email: 1 }, { unique: true });
print(`Created indexes for ${usersCollectionName}`);

// Insert sample user (replace with secure user creation process)
// IMPORTANT: Never store plain text passwords. Use a strong hashing algorithm.
// This is just a placeholder for initialization.
if (db[usersCollectionName].countDocuments() === 0) {
  db[usersCollectionName].insertOne({
    username: "johndoe",
    email: "john.doe@example.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuv", // Example bcrypt hash (replace with actual hash)
    createdAt: new Date()
  });
  print(`Inserted sample user into ${usersCollectionName}`);
} else {
  print(`${usersCollectionName} collection already contains data. Skipping sample user insertion.`);
}
*/

// --- Create Users Collection ---
// Uncommented and adapted for roles

// Drop existing collection (optional)
// db[usersCollectionName].drop();
// print(`Dropped existing collection: ${usersCollectionName}`);

if (!db.getCollectionNames().includes(usersCollectionName)) {
    db.createCollection(usersCollectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["username", "email", "passwordHash", "role"],
                properties: {
                    username: { bsonType: "string", description: "must be a string and is required" },
                    email: { bsonType: "string", description: "must be a string and is required" },
                    passwordHash: { bsonType: "string", description: "must be a string and is required" },
                    role: { 
                        bsonType: "string", 
                        enum: USER_ROLES, // Use updated roles for enum validation
                        description: "must be one of the predefined roles (admin, user) and is required" 
                    },
                    createdAt: { bsonType: "date", description: "must be a date" }
                }
            }
        }
    });
    print(`Created collection: ${usersCollectionName}`);

    db[usersCollectionName].createIndex({ username: 1 }, { unique: true });
    db[usersCollectionName].createIndex({ email: 1 }, { unique: true });
    print(`Created indexes for ${usersCollectionName}`);
} else {
    print(`Collection ${usersCollectionName} already exists.`);
}

// Insert sample users with updated roles
// IMPORTANT: Replace password hashes with actual, securely generated hashes!
const sampleUsers = [
    {
        username: "admin_user",
        email: "admin@example.com",
        passwordHash: "$2b$10$DUMMYHASHADMINabcdefghijklm", // Replace with real hash
        role: "admin", 
        createdAt: new Date()
    },
    {
        username: "regular_user",
        email: "user@example.com",
        passwordHash: "$2b$10$DUMMYHASHUSERnopqrstuvwxyz", // Replace with real hash
        role: "user",
        createdAt: new Date()
    }
];

if (db[usersCollectionName].countDocuments() === 0) {
    try {
        db[usersCollectionName].insertMany(sampleUsers);
        print(`Inserted ${sampleUsers.length} sample users into ${usersCollectionName}`);
    } catch (e) {
        print(`Error inserting sample users: ${e}`);
    }
} else {
    print(`${usersCollectionName} collection already contains data. Skipping sample user insertion.`);
}

print("\nDatabase initialization complete."); 