import React, { useEffect, useState } from 'react';
import { Upload, Download, Trash2, Share2 } from 'lucide-react';
import apiClient from '../apiClient'; // Import apiClient
import { AxiosResponse } from 'axios';

// Legacy metrics interfaces to be used only for API consumption
interface CountryMetricAPI {
  country: string;
  visits: number;
  uniqueVisitorCount: number;
  regionCount: number;
  visitPercentage: string;
  visitorPercentage: string;
}

interface CountryMetricsResponse {
  totalRecords: number;
  uniqueVisitors: number;
  countries: CountryMetricAPI[];
}

// City metrics interfaces are removed as they're no longer used

// Location metrics for the UI
interface LocationMetric {
  name: string;
  type: 'country'; // Only countries are used now
  visits: number;
  percentage: string;
}

interface LocationMetricsResponse {
  totalRecords: number;
  totalLocations: number;
  locations: LocationMetric[];
}

// Browser metrics from API
interface BrowserMetric {
  browser: string;
  count: number;
  percentage: string;
}

interface BrowserMetricsResponse {
  totalRecords: number;
  browsers: BrowserMetric[];
}

// Device metrics from API
interface DeviceMetric {
  deviceType: string;
  count: number;
  percentage: string;
}

interface DeviceMetricsResponse {
  totalRecords: number;
  devices: DeviceMetric[];
}

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
  const [locationMetrics, setLocationMetrics] = useState<LocationMetricsResponse>({ 
    totalRecords: 0, 
    totalLocations: 0, 
    locations: [] 
  });
  const [browserMetrics, setBrowserMetrics] = useState<BrowserMetricsResponse | null>(null);
  const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetricsResponse | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Dashboard component mounted, starting fetch...");
    // Track page view when the dashboard loads
    trackEvent('page_view', { page: 'dashboard' });

    // Fetch data from APIs
    const fetchData = async () => {
      setLoading(true); // Ensure loading is true at the start
      setGeolocationError(null); // Reset error on new fetch
      try {
        // Use Promise.allSettled to fetch all data, even if one fails
        const responses = await Promise.allSettled([
          apiClient.get('/api/analytics/page-views'),
          apiClient.get('/api/analytics/user-interactions'),
          apiClient.get('/api/analytics/file-type-distribution')
        ]);

        // Process successful responses
        if (responses[0].status === 'fulfilled') {
          setPageViewsData(responses[0].value.data);
        }
        if (responses[1].status === 'fulfilled') {
          setUserBehaviorData(responses[1].value.data);
        }
        if (responses[2].status === 'fulfilled') {
          setDistributionData(responses[2].value.data);
        }

      } catch (error) {
        // General catch block (less likely needed with Promise.allSettled for individual errors)
        console.error('Error fetching dashboard data:', error);
        // Optionally set a general error state here
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Add geographical metrics fetching
    const fetchGeoMetrics = async () => {
      try {
        // Use fetch with VITE_API_BASE_URL instead of apiClient
        const [countriesResponse, browsersResponse, devicesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/geo-metrics/countries`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/geo-metrics/browsers`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/geo-metrics/devices`)
        ]);
        
        // Check if any response failed
        if (!countriesResponse.ok) throw new Error(`Failed to fetch country metrics: ${countriesResponse.status} ${countriesResponse.statusText}`);
        if (!browsersResponse.ok) throw new Error(`Failed to fetch browser metrics: ${browsersResponse.status} ${browsersResponse.statusText}`);
        if (!devicesResponse.ok) throw new Error(`Failed to fetch device metrics: ${devicesResponse.status} ${devicesResponse.statusText}`);

        // Parse the JSON responses
        const countriesData = await countriesResponse.json() as CountryMetricsResponse;
        const browsersData = await browsersResponse.json() as BrowserMetricsResponse;
        const devicesData = await devicesResponse.json() as DeviceMetricsResponse;
        
        // Set metrics data for browsers and devices
        setBrowserMetrics(browsersData);
        setDeviceMetrics(devicesData);

        // Transform country data into a unified locations array
        const locations: LocationMetric[] = 
          // Add countries only
          countriesData.countries.map(country => ({
            name: country.country || 'Unknown Country',
            type: 'country' as const,
            visits: country.visits,
            percentage: country.visitPercentage
          })).sort((a, b) => b.visits - a.visits);

        // Set location metrics with only country data
        setLocationMetrics({
          totalRecords: countriesData.totalRecords,
          totalLocations: countriesData.countries.length,
          locations: locations
        });

        setGeolocationError(null); // Clear error on success
      } catch (error) {
        console.error('Error fetching geographical metrics:', error);
        setGeolocationError(`Failed to load geographical metrics. ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Set empty state on error for all geo-related data
        setLocationMetrics({ totalRecords: 0, totalLocations: 0, locations: [] });
        setBrowserMetrics(null);
        setDeviceMetrics(null);
      }
    };

    fetchGeoMetrics();

  }, []);

  const handleCustomEvent = (action: string) => {
    // Track custom user interactions
    trackEvent('user_interaction', { action });
  };

  // Helper to format timestamp
  const formatTimestamp = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const isGeoDataLoading = loading && (!locationMetrics || locationMetrics.locations.length === 0);
  const hasGeoData = Boolean(locationMetrics && locationMetrics.locations.length > 0);

  if (loading && (!locationMetrics || locationMetrics.locations.length === 0)) {
    return <div className="p-6">Loading Dashboard Data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Page Views Section */}
      <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Page Views</h2>
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
          
          <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
  <h3 className="font-medium mb-4">File Type Distribution (Bar Chart)</h3>
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
</div>
</div>

      {/* Geolocation Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Geographic Access Data</h2>
        <div className="bg-white rounded-lg shadow p-6">
          {isGeoDataLoading && <p>Loading location data...</p>}
          {geolocationError && <p className="text-red-500">Error: {geolocationError}</p>}
          
          {hasGeoData && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Total Visits</h3>
                  <p className="text-2xl font-bold">{locationMetrics.totalRecords || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Locations</h3>
                  <p className="text-2xl font-bold">{locationMetrics.totalLocations || 0}</p>
                </div>
              </div>

              <div>
                {/* Top Locations */}
                <div>
                  <h3 className="font-medium mb-3">Top Locations</h3>
                  <ul className="divide-y divide-gray-200">
                    {locationMetrics.locations.slice(0, 6).map((location, index) => (
                      <li key={`location-${index}`} className="py-2 flex justify-between">
                        <span className="text-sm flex items-center">
                          {location.name}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">{location.visits} visits</span>
                          <span className="text-xs text-gray-500">({location.percentage}%)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {!loading && !geolocationError && !hasGeoData && (
            <p>No geolocation data available yet.</p>
          )}
        </div>
      </div>

      {/* Browser and Device Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browser & Device Analytics</h2>
        <div className="bg-white rounded-lg shadow p-6">
          
          {isGeoDataLoading && <p>Loading browser and device data...</p>}
          
          {browserMetrics && deviceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Browser Statistics */}
              <div>
                <h3 className="font-medium mb-3">Browser Usage</h3>
                <ul className="divide-y divide-gray-200">
                  {browserMetrics.browsers.slice(0, 5).map((item, index) => (
                    <li key={index} className="py-2 flex justify-between">
                      <span className="text-sm">{item.browser || 'Unknown'}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{item.count} visits</span>
                        <span className="text-xs text-gray-500">({item.percentage}%)</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Device Statistics */}
              <div>
                <h3 className="font-medium mb-3">Device Types</h3>
                <ul className="divide-y divide-gray-200">
                  {deviceMetrics.devices.slice(0, 5).map((item, index) => (
                    <li key={index} className="py-2 flex justify-between">
                      <span className="text-sm">{item.deviceType || 'Unknown'}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{item.count} visits</span>
                        <span className="text-xs text-gray-500">({item.percentage}%)</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!loading && !geolocationError && (!browserMetrics || !deviceMetrics) && (
            <p>No browser and device data available yet.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;