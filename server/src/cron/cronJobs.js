const cron = require('node-cron');
const { PageView } = require('../models/DataAnalytics');

const scheduleDailyPageViewReset = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      // (UTC+8)
      const now = new Date();
      const hongKongTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8 
      const today = hongKongTime.toISOString().split('T')[0]; // format YYYY-MM-DD

      const existingRecord = await PageView.findOne({ name: today });
      if (!existingRecord) {
        await PageView.create({ name: today, value: 0 });
        console.log(`New PageView record created for ${today}`);
      } else {
        console.log(`PageView record for ${today} already exists`);
      }
    } catch (error) {
      console.error('Error creating new PageView record:', error);
    }
  });
};

module.exports = {
  scheduleDailyPageViewReset,
};