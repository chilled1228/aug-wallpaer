import { config } from './config';

export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheSettings: {
    images: number;
    static: number;
    api: number;
  };
  compressionSettings: {
    gzip: boolean;
    brotli: boolean;
    quality: number;
  };
}

// CDN configuration for global image delivery
export const cdnConfig: CDNConfig = {
  baseUrl: config.storage.publicUrl,
  regions: [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'ap-southeast-1',
    'ap-northeast-1'
  ],
  cacheSettings: {
    images: 31536000,    // 1 year
    static: 31536000,    // 1 year
    api: 300             // 5 minutes
  },
  compressionSettings: {
    gzip: true,
    brotli: true,
    quality: 85
  }
};

export class CDNService {
  // Get the best CDN endpoint based on user location
  static getBestEndpoint(userRegion?: string): string {
    // In a real implementation, you'd use geolocation to determine the best endpoint
    // For now, return the default endpoint
    return cdnConfig.baseUrl;
  }

  // Generate cache headers for different content types
  static getCacheHeaders(contentType: 'image' | 'static' | 'api'): Record<string, string> {
    const maxAge = cdnConfig.cacheSettings[contentType];
    
    const headers: Record<string, string> = {
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      'Vary': 'Accept-Encoding',
    };

    if (contentType === 'image') {
      headers['Cache-Control'] += ', immutable';
    }

    return headers;
  }

  // Generate optimized image URL with CDN parameters
  static getOptimizedImageUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      fit?: 'cover' | 'contain' | 'fill';
      userRegion?: string;
    } = {}
  ): string {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover',
      userRegion
    } = options;

    const endpoint = this.getBestEndpoint(userRegion);
    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);
    params.set('fit', fit);

    return `${endpoint}/${imagePath}?${params.toString()}`;
  }

  // Generate responsive image srcset with CDN optimization
  static generateResponsiveSrcSet(
    imagePath: string,
    sizes: number[] = [400, 800, 1200, 1920],
    options: {
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg';
      userRegion?: string;
    } = {}
  ): string {
    return sizes
      .map(size => {
        const url = this.getOptimizedImageUrl(imagePath, {
          width: size,
          ...options
        });
        return `${url} ${size}w`;
      })
      .join(', ');
  }

  // Generate sizes attribute for responsive images
  static generateSizesAttribute(breakpoints: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  } = {}): string {
    const {
      mobile = 400,
      tablet = 800,
      desktop = 1200
    } = breakpoints;

    return [
      `(max-width: ${mobile}px) 100vw`,
      `(max-width: ${tablet}px) 50vw`,
      `(max-width: ${desktop}px) 33vw`,
      '25vw'
    ].join(', ');
  }

  // Preload critical images
  static preloadImage(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      format?: 'webp' | 'avif' | 'jpeg';
      priority?: 'high' | 'low';
      as?: 'image';
    } = {}
  ): void {
    if (typeof window === 'undefined') return;

    const {
      width = 800,
      height,
      format = 'webp',
      priority = 'high',
      as = 'image'
    } = options;

    const url = this.getOptimizedImageUrl(imagePath, {
      width,
      height,
      format
    });

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    
    if (priority) {
      link.setAttribute('fetchpriority', priority);
    }

    document.head.appendChild(link);
  }

  // Prefetch images for better UX
  static prefetchImage(imagePath: string, options: {
    width?: number;
    format?: 'webp' | 'avif' | 'jpeg';
  } = {}): void {
    if (typeof window === 'undefined') return;

    const url = this.getOptimizedImageUrl(imagePath, options);
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    document.head.appendChild(link);
  }

  // Get image metadata from CDN
  static async getImageMetadata(imagePath: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  } | null> {
    try {
      const metadataUrl = `${cdnConfig.baseUrl}/${imagePath}?metadata=true`;
      const response = await fetch(metadataUrl, {
        method: 'HEAD'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const width = parseInt(response.headers.get('x-image-width') || '0');
      const height = parseInt(response.headers.get('x-image-height') || '0');
      const format = response.headers.get('x-image-format') || 'unknown';
      const size = parseInt(response.headers.get('content-length') || '0');

      return { width, height, format, size };
    } catch (error) {
      console.error('Error fetching image metadata:', error);
      return null;
    }
  }

  // Purge CDN cache for specific image
  static async purgeCache(imagePath: string): Promise<boolean> {
    try {
      // Implementation would depend on your CDN provider
      // For Cloudflare, you'd use their API to purge cache
      const purgeUrl = `${cdnConfig.baseUrl}/purge`;
      
      const response = await fetch(purgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CDN_API_TOKEN}`
        },
        body: JSON.stringify({
          files: [`${cdnConfig.baseUrl}/${imagePath}`]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error purging cache:', error);
      return false;
    }
  }

  // Monitor CDN performance
  static async checkCDNHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    regions: Array<{
      region: string;
      status: 'healthy' | 'down';
      responseTime: number;
    }>;
  }> {
    const healthChecks = await Promise.allSettled(
      cdnConfig.regions.map(async (region) => {
        const start = Date.now();
        try {
          const response = await fetch(`${cdnConfig.baseUrl}/health`, {
            headers: { 'CF-IPCountry': region }
          });
          const responseTime = Date.now() - start;
          
          return {
            region,
            status: response.ok ? 'healthy' as const : 'down' as const,
            responseTime
          };
        } catch (error) {
          return {
            region,
            status: 'down' as const,
            responseTime: Date.now() - start
          };
        }
      })
    );

    const results = healthChecks
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const healthyRegions = results.filter(r => r.status === 'healthy');
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    let overallStatus: 'healthy' | 'degraded' | 'down';
    if (healthyRegions.length === results.length) {
      overallStatus = 'healthy';
    } else if (healthyRegions.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'down';
    }

    return {
      status: overallStatus,
      responseTime: avgResponseTime,
      regions: results
    };
  }
}

// Initialize CDN monitoring
if (typeof window !== 'undefined') {
  // Check CDN health periodically
  setInterval(async () => {
    const health = await CDNService.checkCDNHealth();
    if (health.status !== 'healthy') {
      console.warn('CDN health check failed:', health);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}
