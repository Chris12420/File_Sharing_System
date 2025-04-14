const cron = require('node-cron');
const { PageView } = require('./models/DataAnalytics');

// 定时任务：每天凌晨 12:00 创建新日期记录
const scheduleDailyPageViewReset = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // 获取当前日期 (YYYY-MM-DD)
      const existingRecord = await PageView.findOne({ name: today });
      if (!existingRecord) {
        await PageView.create({ name: today, value: 0 }); // 创建新记录，初始值为 0
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