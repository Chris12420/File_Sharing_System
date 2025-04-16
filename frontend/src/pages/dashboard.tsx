import React, { useEffect, useState } from 'react';
import { Upload, Download, Trash2, Share2 } from 'lucide-react';
import apiClient from '../apiClient'; // Import apiClient

// Mock analytics tracking function
const trackEvent = (eventName: string, eventData: Record<string, any>) => {
  console.log(`Event Tracked: ${eventName}`, eventData);
};

const DashboardView: React.FC = () => {

  const fileTypeDistribution = [
    { name: 'Documents', value: 65 },
    { name: 'Images', value: 20 },
    { name: 'Videos', value: 10 },
    { name: 'Audio', value: 5 },
  ];
  

  const [pageViewsData, setPageViewsData] = useState<{ name: string; value: number }[]>([]);
  const [userBehaviorData, setUserBehaviorData] = useState<{ action: string; count: number }[]>([]);
  const [fileTypeDistributionData, setDistributionData] = useState<{ fileName: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track page view when the dashboard loads
    trackEvent('page_view', { page: 'dashboard' });

    // Fetch data from APIs
    const fetchData = async () => {
      try {
        // Use apiClient, remove baseUrl
        const pageViewsResponse = await apiClient.get('/api/analytics/page-views');
        const userInteractionsResponse = await apiClient.get('/api/analytics/user-interactions');
        const fileTypeDistributionResponse = await apiClient.get('/api/analytics/file-type-distribution');

        // Access data from response.data
        const pageViews = pageViewsResponse.data;
        const userInteractions = userInteractionsResponse.data;
        const distribution = fileTypeDistributionResponse.data;

        setDistributionData(distribution);
        setPageViewsData(pageViews);
        setUserBehaviorData(userInteractions);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCustomEvent = (action: string) => {
    // Track custom user interactions
    trackEvent('user_interaction', { action });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Page Views Section */}
      <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Page Views (Last 7 Days)</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-64 flex items-end">
          {pageViewsData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full mx-1 bg-purple-500 rounded-t"
                style={{ height: `${(item.value / Math.max(...pageViewsData.map(d => d.value))) * 170}px` }}
              ></div>
              {/* 添加数值显示 */}
              <span className="text-sm font-medium mt-1">{item.value}</span>
              <span className="text-xs mt-2">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-gray-600 text-sm">
          <p>Track user activity and identify peak usage times.</p>
        </div>
      </div>
    </div>

      {/* User Interactions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Interactions</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            {userBehaviorData.map((item, index) => (
              <button
                key={index}
                className="flex items-center bg-gray-50 p-3 rounded shadow hover:bg-gray-100"
                onClick={() => handleCustomEvent(item.action)}
              >
                {item.action === 'Upload' && <Upload size={16} className="text-blue-500 mr-2" />}
                {item.action === 'Download' && <Download size={16} className="text-green-500 mr-2" />}
                {item.action === 'Share' && <Share2 size={16} className="text-purple-500 mr-2" />}
                {item.action === 'Delete' && <Trash2 size={16} className="text-red-500 mr-2" />}
                <span>{item.action}</span>
                <span className="ml-auto text-gray-500">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">檔案類型分佈</h3>
            <div className="h-64 flex">
              <div className="w-1/2">
                <div className="relative h-full flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full bg-gray-100">
                    {fileTypeDistribution.map((item, index) => {
                      const colors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                      let startAngle = 0;
                      fileTypeDistribution.slice(0, index).forEach(prevItem => {
                        startAngle += (prevItem.value / 100) * 360;
                      });
                      const degrees = (item.value / 100) * 360;
                      return (
                        <div 
                          key={index}
                          className={`absolute inset-0 ${colors[index % colors.length]}`}
                          style={{ 
                            clipPath: `conic-gradient(from ${startAngle}deg, currentColor ${degrees}deg, transparent 0)`,
                            opacity: 0.8
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-center">
                {fileTypeDistribution.map((item, index) => {
                  const colors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                  return (
                    <div key={index} className="flex items-center mb-2">
                      <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-sm mr-2`}></div>
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-gray-600 text-sm">
              <p>追蹤各類檔案使用情況，優化儲存空間並改進功能開發優先順序。</p>
            </div>
          </div> */}
          

          <div className="bg-white rounded-lg shadow p-6">
  <h3 className="font-medium mb-4">檔案類型分佈 (Bar Chart)</h3>
  <div className="h-64 flex items-end">
    {fileTypeDistributionData.map((item, index) => {
      const colors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
      return (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full mx-1 ${colors[index % colors.length]} rounded-t`}
            style={{ height: `${item.value * 2}px` }} 
          ></div>
          <span className="text-xs mt-2">{item.fileName}</span>
          <span className="text-gray-500 text-xs">{item.value}%</span>
        </div>
      );
    })}
  </div>
  <div className="mt-4 text-gray-600 text-sm">
    <p>檔案類型的分佈情況以條形圖顯示，便於比較各類型的比例。</p>
  </div>
</div>

    </div>
  );
};

export default DashboardView;