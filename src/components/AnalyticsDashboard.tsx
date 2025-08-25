'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download, 
  Eye, 
  Clock,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Analytics } from '@/lib/analytics';
import { WebVitalsMonitor } from '@/lib/web-vitals';
import { ABTestingFramework } from '@/lib/ab-testing';

interface AnalyticsData {
  overview: {
    totalPageViews: number;
    totalDownloads: number;
    totalUsers: number;
    conversionRate: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  traffic: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topWallpapers: Array<{
    id: string;
    title: string;
    downloads: number;
    views: number;
    conversionRate: number;
  }>;
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  experiments: Array<{
    id: string;
    name: string;
    status: string;
    participants: number;
    conversionRate: number;
  }>;
}

interface AnalyticsDashboardProps {
  timeframe?: 'day' | 'week' | 'month';
  className?: string;
}

export default function AnalyticsDashboard({ 
  timeframe = 'week',
  className = '' 
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'experiments'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Fetch analytics data
      const analyticsData = await Analytics.getAnalytics(timeframe);
      
      // Get Web Vitals data
      const webVitals = WebVitalsMonitor.getCurrentMetrics();
      
      // Get A/B testing data
      const experiments = ABTestingFramework.getAllExperiments();

      // Mock data for demonstration
      const mockData: AnalyticsData = {
        overview: {
          totalPageViews: analyticsData?.summary.totalPageViews || 12547,
          totalDownloads: analyticsData?.summary.totalDownloads || 3421,
          totalUsers: analyticsData?.summary.uniqueVisitors || 8934,
          conversionRate: analyticsData?.summary.conversionRate || 27.3,
          avgSessionDuration: 245, // seconds
          bounceRate: 34.2
        },
        traffic: {
          mobile: analyticsData?.summary.mobileTraffic || 6789,
          desktop: 4521,
          tablet: 1234
        },
        topWallpapers: [
          { id: '1', title: 'Mountain Sunset', downloads: 1234, views: 5678, conversionRate: 21.7 },
          { id: '2', title: 'Ocean Waves', downloads: 987, views: 4321, conversionRate: 22.8 },
          { id: '3', title: 'Forest Path', downloads: 876, views: 3987, conversionRate: 22.0 },
          { id: '4', title: 'City Lights', downloads: 765, views: 3456, conversionRate: 22.1 },
          { id: '5', title: 'Abstract Art', downloads: 654, views: 2987, conversionRate: 21.9 }
        ],
        performance: {
          lcp: webVitals.get('LCP')?.value || 2100,
          fid: webVitals.get('FID')?.value || 85,
          cls: webVitals.get('CLS')?.value || 0.08,
          fcp: webVitals.get('FCP')?.value || 1600,
          ttfb: webVitals.get('TTFB')?.value || 650
        },
        experiments: experiments.map(exp => ({
          id: exp.id,
          name: exp.name,
          status: exp.status,
          participants: Math.floor(Math.random() * 1000) + 100,
          conversionRate: Math.random() * 10 + 20
        }))
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'fcp':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'ttfb':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'poor':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'experiments', label: 'A/B Tests', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.totalPageViews)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.totalDownloads)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.totalUsers)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.overview.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Traffic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic by Device</h3>
              <div className="space-y-4">
                {[
                  { type: 'Mobile', count: data.traffic.mobile, icon: Smartphone, color: 'bg-blue-500' },
                  { type: 'Desktop', count: data.traffic.desktop, icon: Monitor, color: 'bg-green-500' },
                  { type: 'Tablet', count: data.traffic.tablet, icon: Globe, color: 'bg-purple-500' }
                ].map((device) => {
                  const Icon = device.icon;
                  const total = data.traffic.mobile + data.traffic.desktop + data.traffic.tablet;
                  const percentage = (device.count / total) * 100;
                  
                  return (
                    <div key={device.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`${device.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Wallpapers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Wallpapers</h3>
              <div className="space-y-3">
                {data.topWallpapers.map((wallpaper, index) => (
                  <div key={wallpaper.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-4">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {wallpaper.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatNumber(wallpaper.downloads)} downloads</span>
                      <span>{wallpaper.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Performance Tab */}
      {selectedTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'LCP', label: 'Largest Contentful Paint', value: data.performance.lcp, unit: 'ms' },
            { name: 'FID', label: 'First Input Delay', value: data.performance.fid, unit: 'ms' },
            { name: 'CLS', label: 'Cumulative Layout Shift', value: data.performance.cls, unit: '' },
            { name: 'FCP', label: 'First Contentful Paint', value: data.performance.fcp, unit: 'ms' },
            { name: 'TTFB', label: 'Time to First Byte', value: data.performance.ttfb, unit: 'ms' }
          ].map((metric) => {
            const rating = getPerformanceRating(metric.name.toLowerCase(), metric.value);
            const ratingColor = getRatingColor(rating);
            
            return (
              <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ratingColor}`}>
                    {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}{metric.unit}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Experiments Tab */}
      {selectedTab === 'experiments' && (
        <div className="space-y-6">
          {data.experiments.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No active experiments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.experiments.map((experiment) => (
                <div key={experiment.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {experiment.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      experiment.status === 'running' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {experiment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(experiment.participants)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {experiment.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
