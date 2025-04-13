import React from 'react';
import { Activity, Upload, Download, Trash2, Share2 } from 'lucide-react';

// Dashboard Component (Formerly Analytics)
const DashboardView: React.FC = () => {
  // Mock analytics data
  const pageViewsData = [
    { name: 'Mar 26', value: 120 },
    { name: 'Mar 27', value: 145 },
    { name: 'Mar 28', value: 156 },
    { name: 'Mar 29', value: 182 },
    { name: 'Mar 30', value: 210 },
    { name: 'Mar 31', value: 195 },
    { name: 'Apr 01', value: 220 },
  ];

  const fileTypeDistribution = [
    { name: 'Documents', value: 65 },
    { name: 'Images', value: 20 },
    { name: 'Videos', value: 10 },
    { name: 'Audio', value: 5 },
  ];

  const userBehaviorData = [
    { action: 'Upload', count: 245 },
    { action: 'Download', count: 689 },
    { action: 'Share', count: 178 },
    { action: 'Delete', count: 92 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Analytics tools section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Analytics Integration</h2>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded text-purple-600 mr-3">
              <Activity size={20} />
            </div>
            <h3 className="font-medium">Mixpanel</h3>
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✅ 推薦</span>
          </div>
          <p className="text-gray-600 mb-4">用於行為分析（behavioral analytics），專注於追蹤「誰做了什麼」，最適合深入了解使用者互動模式。</p>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">特別適合用來追蹤：</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Upload size={16} className="text-blue-500 mr-2" />
                <span>上傳（upload）</span>
              </div>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Download size={16} className="text-green-500 mr-2" />
                <span>下載（download）</span>
              </div>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Trash2 size={16} className="text-red-500 mr-2" />
                <span>刪除（delete）</span>
              </div>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Share2 size={16} className="text-purple-500 mr-2" />
                <span>分享行為（例如點擊 copy link）</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">優勢：</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>建立詳細的使用者漏斗分析（user funnel）</li>
              <li>使用者留存追蹤（retention tracking）</li>
              <li>事件細節與屬性記錄（event details）</li>
              <li>使用者行為序列分析（user flow analysis）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Collection section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">使用者行為追蹤</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="font-medium mb-2">追蹤事件</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4">事件名稱</th>
                    <th className="text-left py-2 px-4">描述</th>
                    <th className="text-left py-2 px-4">追蹤屬性</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4">file_upload</td>
                    <td className="py-3 px-4">追蹤使用者上傳檔案行為</td>
                    <td className="py-3 px-4">檔案類型、檔案大小、上傳耗時</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">file_download</td>
                    <td className="py-3 px-4">追蹤檔案下載行為</td>
                    <td className="py-3 px-4">檔案類型、檔案大小、用戶身份</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">file_share</td>
                    <td className="py-3 px-4">追蹤檔案分享行為</td>
                    <td className="py-3 px-4">檔案類型、分享方式</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">file_delete</td>
                    <td className="py-3 px-4">追蹤檔案刪除行為</td>
                    <td className="py-3 px-4">檔案類型、檔案年齡、檔案大小</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">copy_link</td>
                    <td className="py-3 px-4">追蹤使用者複製分享連結行為</td>
                    <td className="py-3 px-4">檔案類型、使用者類型</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Insights section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">資料分析與洞察</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">使用者活躍度 (最近 7 天)</h3>
            <div className="h-64 flex items-end">
              {pageViewsData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full mx-1 bg-purple-500 rounded-t" 
                    style={{ height: `${(item.value/220) * 170}px` }}
                  ></div>
                  <span className="text-xs mt-2">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-gray-600 text-sm">
              <p>通過 Mixpanel 追蹤使用者每日活躍度，分析平台使用高峰時段。</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
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
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h3 className="font-medium mb-4">使用者漏斗分析</h3>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-20 bg-purple-500 rounded-t-lg flex items-center justify-center text-white font-medium">
                    <div className="text-center">
                      <div className="text-lg">100%</div>
                      <div className="text-xs">訪問</div>
                    </div>
                  </div>
                  <div className="w-24 text-center mt-2 text-xs">網站訪問</div>
                </div>
                
                <div className="flex-1 h-2 bg-gray-300 mx-2"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-24 h-16 bg-purple-500 rounded-t-lg flex items-center justify-center text-white font-medium">
                    <div className="text-center">
                      <div className="text-lg">78%</div>
                      <div className="text-xs">瀏覽</div>
                    </div>
                  </div>
                  <div className="w-24 text-center mt-2 text-xs">檔案瀏覽</div>
                </div>
                
                <div className="flex-1 h-2 bg-gray-300 mx-2"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-24 h-12 bg-purple-500 rounded-t-lg flex items-center justify-center text-white font-medium">
                    <div className="text-center">
                      <div className="text-lg">45%</div>
                      <div className="text-xs">上傳</div>
                    </div>
                  </div>
                  <div className="w-24 text-center mt-2 text-xs">檔案上傳</div>
                </div>
                
                <div className="flex-1 h-2 bg-gray-300 mx-2"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-24 h-8 bg-purple-500 rounded-t-lg flex items-center justify-center text-white font-medium">
                    <div className="text-center">
                      <div className="text-lg">32%</div>
                      <div className="text-xs">分享</div>
                    </div>
                  </div>
                  <div className="w-24 text-center mt-2 text-xs">檔案分享</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">透過 Mixpanel 追蹤完整的使用者旅程，識別流失點並優化關鍵步驟。</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">如何運用分析資料：</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>透過識別使用者流失點來提升留存率</li>
                <li>基於使用模式優先開發最需要的功能</li>
                <li>針對不同使用者群體客製化體驗</li>
                <li>A/B 測試界面變更以提升使用者參與度</li>
                <li>監控系統效能並優化檔案上傳下載流程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView; 