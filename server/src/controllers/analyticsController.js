const { PageView, UserInteraction, FileTypeDistribution } = require('../models/DataAnalytics'); // 导入模型

// Controller methods
const getPageViews = async (req, res) => {
  try {
    const pageViews = await PageView.find().sort({ name: 1 }); // 按日期排序
    res.status(200).json(pageViews);
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({ message: 'Error fetching page views' });
  }
};

const getUserInteractions = async (req, res) => {
  try {
    const userInteractions = await UserInteraction.find().sort({ count: -1 }); // 按交互次数降序排序
    res.status(200).json(userInteractions);
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    res.status(500).json({ message: 'Error fetching user interactions' });
  }
};

const getFileTypeDistribution = async (req, res) => {
  try {
    const fileTypeDistribution = await FileTypeDistribution.find().sort({ value: -1 }); // 按文件类型比例降序排序
    res.status(200).json(fileTypeDistribution);
  } catch (error) {
    console.error('Error fetching file type distribution:', error);
    res.status(500).json({ message: 'Error fetching file type distribution' });
  }
};

module.exports = {
  getPageViews,
  getUserInteractions,
  getFileTypeDistribution,
};