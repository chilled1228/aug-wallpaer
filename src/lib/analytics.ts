import { supabase } from './supabase';

// Analytics tracking functions
export class Analytics {
  private static getDeviceType(): string {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private static getUserIP(): string {
    // In production, you'd get this from a service or header
    return 'unknown';
  }

  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Track page views
  static async trackPageView(pagePath: string, referrer?: string) {
    if (typeof window === 'undefined') return;

    try {
      await supabase.from('page_views').insert({
        page_path: pagePath,
        user_ip: this.getUserIP(),
        user_agent: navigator.userAgent,
        referrer: referrer || document.referrer,
        device_type: this.getDeviceType(),
        session_id: this.getSessionId()
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track wallpaper downloads
  static async trackDownload(wallpaperId: string, resolution: string) {
    try {
      // Track the download
      await supabase.from('wallpaper_downloads').insert({
        wallpaper_id: wallpaperId,
        user_ip: this.getUserIP(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        resolution,
        device_type: this.getDeviceType()
      });

      // Update download count
      await supabase.rpc('increment_download_count', { wallpaper_id: wallpaperId });
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  }

  // Track search queries
  static async trackSearch(query: string, resultsCount: number) {
    if (typeof window === 'undefined') return;

    try {
      await supabase.from('search_queries').insert({
        query,
        results_count: resultsCount,
        user_ip: this.getUserIP()
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Track wallpaper ratings
  static async trackRating(wallpaperId: string, rating: number, review?: string) {
    try {
      await supabase.from('wallpaper_ratings').insert({
        wallpaper_id: wallpaperId,
        rating,
        review,
        user_ip: this.getUserIP()
      });

      // Update average rating
      await supabase.rpc('update_average_rating', { wallpaper_id: wallpaperId });
    } catch (error) {
      console.error('Error tracking rating:', error);
    }
  }

  // Get analytics data (for admin dashboard)
  static async getAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    try {
      // Get page views
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('viewed_at', startDate.toISOString());

      // Get downloads
      const { data: downloads } = await supabase
        .from('wallpaper_downloads')
        .select('*')
        .gte('downloaded_at', startDate.toISOString());

      // Get popular wallpapers
      const { data: popularWallpapers } = await supabase
        .from('wallpapers')
        .select('id, title, download_count, average_rating')
        .order('download_count', { ascending: false })
        .limit(10);

      // Get search queries
      const { data: searches } = await supabase
        .from('search_queries')
        .select('*')
        .gte('searched_at', startDate.toISOString());

      return {
        pageViews: pageViews || [],
        downloads: downloads || [],
        popularWallpapers: popularWallpapers || [],
        searches: searches || [],
        summary: {
          totalPageViews: pageViews?.length || 0,
          totalDownloads: downloads?.length || 0,
          totalSearches: searches?.length || 0,
          uniqueVisitors: new Set(pageViews?.map(pv => pv.user_ip)).size,
          mobileTraffic: pageViews?.filter(pv => pv.device_type === 'mobile').length || 0,
          conversionRate: pageViews?.length ? ((downloads?.length || 0) / pageViews.length * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      // Measure Core Web Vitals
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          // First Contentful Paint
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          // Largest Contentful Paint
          lcp: 0, // Would need web-vitals library for accurate measurement
          // Time to Interactive
          tti: navigation.loadEventEnd - navigation.fetchStart,
          // Total page load time
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          // DNS lookup time
          dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
          // Server response time
          serverTime: navigation.responseEnd - navigation.requestStart
        };

        // Log performance metrics (in production, send to analytics service)
        console.log('Performance Metrics:', metrics);
        
        // Track slow pages
        if (metrics.loadTime > 3000) {
          console.warn('Slow page load detected:', window.location.pathname, metrics.loadTime);
        }
      }
    });
  }

  static measureImageLoad(imageUrl: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    
    // Log slow image loads
    if (loadTime > 2000) {
      console.warn('Slow image load:', imageUrl, loadTime);
    }
    
    return loadTime;
  }
}

// Error tracking
export class ErrorTracker {
  static init() {
    if (typeof window === 'undefined') return;

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      });
    });
  }

  private static logError(error: any) {
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    console.error('Error tracked:', error);
    
    // Could also send to Supabase for basic error logging
    // supabase.from('error_logs').insert({ ...error, timestamp: new Date().toISOString() });
  }
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.measurePageLoad();
  ErrorTracker.init();
}
