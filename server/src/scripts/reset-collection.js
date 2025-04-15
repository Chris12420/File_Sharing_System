require('dotenv').config();
const mongoose = require('mongoose');

async function resetCollection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the existing users collection if it exists
    try {
      await db.collection('users').drop();
      console.log('Dropped existing users collection');
    } catch (error) {
      if (error.code !== 26) { // 26 is the error code for "namespace not found"
        throw error;
      }
      console.log('Users collection did not exist');
    }

    // Create the users collection with proper validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password', 'role'],
          properties: {
            username: {
              bsonType: 'string',
              minLength: 3
            },
            email: {
              bsonType: 'string',
              pattern: '^\\S+@\\S+\\.\\S+$'
            },
            password: {
              bsonType: 'string'
            },
            role: {
              enum: ['admin', 'user']
            }
          }
        }
      }
    });
    console.log('Created users collection with validation rules');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('Created indexes');

    console.log('Collection reset complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetCollection(); 