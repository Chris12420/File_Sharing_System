const { PageView, UserInteraction, FileTypeDistribution } = require('../models/DataAnalytics'); // 导入模型
const File = require('../models/File');
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
    // 获取所有文件类型及其数量
    const fileTypeCounts = await File.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$mimeType", false] }, // 如果 mimeType 为 null
              { $arrayElemAt: [{ $split: ["$mimeType", "/"] }, 0] }, // 提取主类型
              "Other" // 如果 mimeType 为 null，则设置为 "Other"
            ]
          },
          count: { $sum: 1 } // 统计每种类型的数量
        }
      }
    ]);

    // 计算总文件数
    const totalFiles = fileTypeCounts.reduce((sum, fileType) => sum + fileType.count, 0);

    // 如果没有文件，返回提示信息
    if (totalFiles === 0) {
      return res.status(200).json({ message: "No files found in the database." });
    }

    // 格式化数据为前端需要的格式
    const fileTypeDistribution = fileTypeCounts.map((fileType) => ({
      fileName: fileType._id || "Other", // 主类型或 "Other"
      value: ((fileType.count / totalFiles) * 100).toFixed(2) // 百分比值，保留两位小数
    }));

    res.status(200).json(fileTypeDistribution);
  } catch (error) {
    console.error('Error fetching file type distribution:', error);
    res.status(500).json({ message: 'Error fetching file type distribution' });
  }
};

// Increment PageView for the current day
const incrementPageView = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // 获取当前日期 (YYYY-MM-DD)
    const pageView = await PageView.findOneAndUpdate(
      { name: today }, // 查找当天的记录
      { $inc: { value: 1 } }, // 将 value 字段加 1
      { new: true, upsert: true } // 如果不存在则创建
    );
    console.log(`Page view incremented for ${today}:`, pageView.value);
  } catch (error) {
    console.error('Error incrementing page view:', error);
  }
};


module.exports = {
  getPageViews,
  getUserInteractions,
  getFileTypeDistribution,
  incrementPageView
};