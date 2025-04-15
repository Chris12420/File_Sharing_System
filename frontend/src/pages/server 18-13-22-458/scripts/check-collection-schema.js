require('dotenv').config();
const mongoose = require('mongoose');

async function checkCollectionSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    
    // Get collection info
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    console.log(collections.map(c => c.name));

    // Get validation info for users collection
    const collInfo = await db.command({ listCollections: 1, filter: { name: 'users' } });
    console.log('\nUsers collection info:');
    console.log(JSON.stringify(collInfo, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCollectionSchema(); 