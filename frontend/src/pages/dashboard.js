import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Upload, Download, Trash2, Share2 } from 'lucide-react';
import apiClient from '../apiClient'; // Import apiClient
// Mock analytics tracking function
const trackEvent = (eventName, eventData) => {
    console.log(`Event Tracked: ${eventName}`, eventData);
};
const DashboardView = () => {
    const fileTypeDistribution = [
        { name: 'Documents', value: 65 },
        { name: 'Images', value: 20 },
        { name: 'Videos', value: 10 },
        { name: 'Audio', value: 5 },
    ];
    const [pageViewsData, setPageViewsData] = useState([]);
    const [userBehaviorData, setUserBehaviorData] = useState([]);
    const [fileTypeDistributionData, setDistributionData] = useState([]);
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
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleCustomEvent = (action) => {
        // Track custom user interactions
        trackEvent('user_interaction', { action });
    };
    if (loading) {
        return _jsx("div", { className: "p-6", children: "Loading..." });
    }
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Dashboard" }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Page Views (Last 7 Days)" }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "h-64 flex items-end", children: pageViewsData.map((item, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-full mx-1 bg-purple-500 rounded-t", style: { height: `${(item.value / Math.max(...pageViewsData.map(d => d.value))) * 170}px` } }), _jsx("span", { className: "text-sm font-medium mt-1", children: item.value }), _jsx("span", { className: "text-xs mt-2", children: item.name })] }, index))) }), _jsx("div", { className: "mt-4 text-gray-600 text-sm", children: _jsx("p", { children: "Track user activity and identify peak usage times." }) })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "User Interactions" }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsx("div", { className: "grid grid-cols-2 gap-4", children: userBehaviorData.map((item, index) => (_jsxs("button", { className: "flex items-center bg-gray-50 p-3 rounded shadow hover:bg-gray-100", onClick: () => handleCustomEvent(item.action), children: [item.action === 'Upload' && _jsx(Upload, { size: 16, className: "text-blue-500 mr-2" }), item.action === 'Download' && _jsx(Download, { size: 16, className: "text-green-500 mr-2" }), item.action === 'Share' && _jsx(Share2, { size: 16, className: "text-purple-500 mr-2" }), item.action === 'Delete' && _jsx(Trash2, { size: 16, className: "text-red-500 mr-2" }), _jsx("span", { children: item.action }), _jsx("span", { className: "ml-auto text-gray-500", children: item.count })] }, index))) }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "font-medium mb-4", children: "\u6A94\u6848\u985E\u578B\u5206\u4F48 (Bar Chart)" }), _jsx("div", { className: "h-64 flex items-end", children: fileTypeDistributionData.map((item, index) => {
                            const colors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                            return (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: `w-full mx-1 ${colors[index % colors.length]} rounded-t`, style: { height: `${item.value * 2}px` } }), _jsx("span", { className: "text-xs mt-2", children: item.fileName }), _jsxs("span", { className: "text-gray-500 text-xs", children: [item.value, "%"] })] }, index));
                        }) }), _jsx("div", { className: "mt-4 text-gray-600 text-sm", children: _jsx("p", { children: "\u6A94\u6848\u985E\u578B\u7684\u5206\u4F48\u60C5\u6CC1\u4EE5\u689D\u5F62\u5716\u986F\u793A\uFF0C\u4FBF\u65BC\u6BD4\u8F03\u5404\u985E\u578B\u7684\u6BD4\u4F8B\u3002" }) })] })] }));
};
export default DashboardView;
