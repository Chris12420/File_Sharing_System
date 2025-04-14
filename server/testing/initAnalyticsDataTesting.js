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

    const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
          name: date.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
          value: Math.floor(Math.random() * 200) + 100, // 随机生成 100-300 的值
        });
      }
      return days;
    };
    
    await PageView.insertMany(getLast7Days());

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
      { fileName: 'Audio', value: 5 },
      { fileName: 'other', value: 7 }
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