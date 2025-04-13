const mongoose = require('mongoose');
const connectDB = require('../src/db/connect'); 


const PageView = mongoose.model('PageView', new mongoose.Schema({ name: String, value: Number }));
const UserInteraction = mongoose.model('UserInteraction', new mongoose.Schema({ action: String, count: Number }));
const FileTypeDistribution = mongoose.model('FileTypeDistribution', new mongoose.Schema({ fileName: String, value: Number }));

const insertTestData = async () => {
  try {
    console.log('Clearing existing data from MongoDB...');

    await PageView.deleteMany({});
    await UserInteraction.deleteMany({});
    await FileTypeDistribution.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Inserting test data into MongoDB...');

    await PageView.insertMany([
      { name: 'Mar 25', value: 166 },
      { name: 'Mar 26', value: 120 },
      { name: 'Mar 27', value: 145 },
      { name: 'Mar 28', value: 156 },
      { name: 'Mar 29', value: 182 },
      { name: 'Mar 30', value: 210 },
      { name: 'Mar 31', value: 195 }
    ]);

    await UserInteraction.insertMany([
      { action: 'Upload', count: 245 },
      { action: 'Download', count: 689 },
      { action: 'Share', count: 178 },
      { action: 'Delete', count: 92 }
    ]);

    await FileTypeDistribution.insertMany([
      { fileName: 'Documents', value: 65 },
      { fileName: 'Images', value: 20 },
      { fileName: 'Videos', value: 10 },
      { fileName: 'Audio', value: 5 }
    ]);

    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB()
  .then(insertTestData)
  .catch((error) => {
    console.error('Error during database connection or data insertion:', error);
  });