// Core Web Vitals monitoring and reporting
import { Analytics } from './analytics';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  processingStart?: number;
  processingEnd?: number;
  loadEventStart?: number;
  loadEventEnd?: number;
}

export class WebVitalsMonitor {
  private static metrics = new Map<string, WebVitalMetric>();
  private static observers = new Map<string, PerformanceObserver>();
  private static isInitialized = false;

  // Initialize Web Vitals monitoring
  static init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;
    
    // Monitor Core Web Vitals
    this.monitorLCP();
    this.monitorFID();
    this.monitorCLS();
    this.monitorFCP();
    this.monitorTTFB();
    this.monitorINP();

    // Monitor custom metrics
    this.monitorCustomMetrics();

    // Report metrics periodically
    this.startPeriodicReporting();
  }

  // Monitor Largest Contentful Paint (LCP)
  private static monitorLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        const metric: WebVitalMetric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.getLCPRating(lastEntry.startTime),
          delta: lastEntry.startTime,
          id: this.generateId(),
          navigationType: this.getNavigationType()
        };

        this.metrics.set('LCP', metric);
        this.reportMetric(metric);
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }
  }

  // Monitor First Input Delay (FID)
  private static monitorFID(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        const metric: WebVitalMetric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: this.getFIDRating(entry.processingStart - entry.startTime),
          delta: entry.processingStart - entry.startTime,
          id: this.generateId(),
          navigationType: this.getNavigationType()
        };

        this.metrics.set('FID', metric);
        this.reportMetric(metric);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }
  }

  // Monitor Cumulative Layout Shift (CLS)
  private static monitorCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            
            const metric: WebVitalMetric = {
              name: 'CLS',
              value: clsValue,
              rating: this.getCLSRating(clsValue),
              delta: entry.value,
              id: this.generateId(),
              navigationType: this.getNavigationType()
            };

            this.metrics.set('CLS', metric);
            this.reportMetric(metric);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }
  }

  // Monitor First Contentful Paint (FCP)
  private static monitorFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const metric: WebVitalMetric = {
            name: 'FCP',
            value: entry.startTime,
            rating: this.getFCPRating(entry.startTime),
            delta: entry.startTime,
            id: this.generateId(),
            navigationType: this.getNavigationType()
          };

          this.metrics.set('FCP', metric);
          this.reportMetric(metric);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    } catch (error) {
      console.warn('FCP monitoring not supported:', error);
    }
  }

  // Monitor Time to First Byte (TTFB)
  private static monitorTTFB(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: PerformanceEntry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const ttfb = navEntry.responseStart - navEntry.requestStart;

          const metric: WebVitalMetric = {
            name: 'TTFB',
            value: ttfb,
            rating: this.getTTFBRating(ttfb),
            delta: ttfb,
            id: this.generateId(),
            navigationType: this.getNavigationType()
          };

          this.metrics.set('TTFB', metric);
          this.reportMetric(metric);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('TTFB', observer);
    } catch (error) {
      console.warn('TTFB monitoring not supported:', error);
    }
  }

  // Monitor Interaction to Next Paint (INP)
  private static monitorINP(): void {
    if (!('PerformanceObserver' in window)) return;

    let interactions: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        interactions.push({
          startTime: entry.startTime,
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
          duration: entry.duration
        });

        // Keep only recent interactions (last 10 seconds)
        const tenSecondsAgo = performance.now() - 10000;
        interactions = interactions.filter(i => i.startTime > tenSecondsAgo);

        // Calculate INP (98th percentile of interaction latencies)
        if (interactions.length > 0) {
          const sortedDurations = interactions
            .map(i => i.duration)
            .sort((a, b) => a - b);
          
          const p98Index = Math.floor(sortedDurations.length * 0.98);
          const inp = sortedDurations[p98Index] || sortedDurations[sortedDurations.length - 1];

          const metric: WebVitalMetric = {
            name: 'INP',
            value: inp,
            rating: this.getINPRating(inp),
            delta: entry.duration,
            id: this.generateId(),
            navigationType: this.getNavigationType()
          };

          this.metrics.set('INP', metric);
          this.reportMetric(metric);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['event'] });
      this.observers.set('INP', observer);
    } catch (error) {
      console.warn('INP monitoring not supported:', error);
    }
  }

  // Monitor custom performance metrics
  private static monitorCustomMetrics(): void {
    // Time to Interactive (TTI)
    this.measureTTI();
    
    // Resource loading times
    this.measureResourceTiming();
    
    // JavaScript execution time
    this.measureJSExecutionTime();
  }

  // Measure Time to Interactive
  private static measureTTI(): void {
    window.addEventListener('load', () => {
      // Simplified TTI calculation
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const tti = navTiming.loadEventEnd - navTiming.navigationStart;

      const metric: WebVitalMetric = {
        name: 'TTI',
        value: tti,
        rating: this.getTTIRating(tti),
        delta: tti,
        id: this.generateId(),
        navigationType: this.getNavigationType()
      };

      this.metrics.set('TTI', metric);
      this.reportMetric(metric);
    });
  }

  // Measure resource loading performance
  private static measureResourceTiming(): void {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      
      // Analyze image loading performance
      const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i));
      const avgImageLoadTime = images.reduce((sum, img) => sum + img.duration, 0) / images.length;

      if (avgImageLoadTime > 0) {
        const metric: WebVitalMetric = {
          name: 'AvgImageLoad',
          value: avgImageLoadTime,
          rating: avgImageLoadTime < 1000 ? 'good' : avgImageLoadTime < 2000 ? 'needs-improvement' : 'poor',
          delta: avgImageLoadTime,
          id: this.generateId(),
          navigationType: this.getNavigationType()
        };

        this.metrics.set('AvgImageLoad', metric);
        this.reportMetric(metric);
      }
    });
  }

  // Measure JavaScript execution time
  private static measureJSExecutionTime(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (entry.entryType === 'measure' && entry.name.includes('script')) {
          const metric: WebVitalMetric = {
            name: 'JSExecution',
            value: entry.duration,
            rating: entry.duration < 50 ? 'good' : entry.duration < 100 ? 'needs-improvement' : 'poor',
            delta: entry.duration,
            id: this.generateId(),
            navigationType: this.getNavigationType()
          };

          this.reportMetric(metric);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('JS execution monitoring not supported:', error);
    }
  }

  // Rating functions
  private static getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  }

  private static getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
  }

  private static getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  }

  private static getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
  }

  private static getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
  }

  private static getINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
  }

  private static getTTIRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 3800 ? 'good' : value <= 7300 ? 'needs-improvement' : 'poor';
  }

  // Utility functions
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getNavigationType(): string {
    if ('navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navEntry.type || 'navigate';
    }
    return 'navigate';
  }

  // Report metric to analytics
  private static reportMetric(metric: WebVitalMetric): void {
    // Send to analytics service
    Analytics.trackPageView(`/performance/${metric.name}`, undefined, {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      navigation_type: metric.navigationType
    });

    // Log poor performance
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name} performance:`, metric.value);
    }
  }

  // Start periodic reporting
  private static startPeriodicReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportCurrentMetrics();
    }, 30000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportCurrentMetrics();
    });
  }

  // Report all current metrics
  private static reportCurrentMetrics(): void {
    this.metrics.forEach(metric => {
      this.reportMetric(metric);
    });
  }

  // Get current metrics
  static getCurrentMetrics(): Map<string, WebVitalMetric> {
    return new Map(this.metrics);
  }

  // Cleanup observers
  static cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
    this.isInitialized = false;
  }
}

// Initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  // Wait for page load to start monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WebVitalsMonitor.init();
    });
  } else {
    WebVitalsMonitor.init();
  }
}
