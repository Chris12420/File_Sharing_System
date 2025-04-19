const { PageView, UserInteraction, FileTypeDistribution } = require('../models/DataAnalytics'); // 导入模型
const File = require('../models/File');
// Controller methods
const getPageViews = async (req, res) => {
  try {
    const pageViews = await PageView.find()
      .sort({ name: -1 }) 
      .limit(7); 
    res.status(200).json(pageViews);
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({ message: 'Error fetching page views' });
  }
};

const getUserInteractions = async (req, res) => {
  try {
    const userInteractions = await UserInteraction.find().sort({ count: -1 });
    res.status(200).json(userInteractions);
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    res.status(500).json({ message: 'Error fetching user interactions' });
  }
};

const getFileTypeDistribution = async (req, res) => {
  try {
    const fileTypeCounts = await File.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$mimeType", false] }, 
              { $arrayElemAt: [{ $split: ["$mimeType", "/"] }, 0] },
              "Other" 
            ]
          },
          count: { $sum: 1 } 
        }
      }
    ]);

    const totalFiles = fileTypeCounts.reduce((sum, fileType) => sum + fileType.count, 0);

    if (totalFiles === 0) {
      return res.status(200).json({ message: "No files found in the database." });
    }

    const fileTypeDistribution = fileTypeCounts.map((fileType) => ({
      fileName: fileType._id || "Other", 
      value: ((fileType.count / totalFiles) * 100).toFixed(2) 
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
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8 timezone(beijing time)
    const today = beijingTime.toISOString().split('T')[0];

    const pageView = await PageView.findOneAndUpdate(
      { name: today },
      { $inc: { value: 1 } },
      { new: true, upsert: true } 
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