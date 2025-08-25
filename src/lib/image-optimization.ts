import { config } from './config';

// Image optimization utilities
export class ImageOptimizer {
  // Generate responsive image URLs with different sizes and formats
  static generateResponsiveUrls(baseUrl: string, options: {
    sizes?: number[];
    formats?: string[];
    quality?: number;
  } = {}) {
    const {
      sizes = [400, 800, 1200, 1920],
      formats = ['avif', 'webp', 'jpeg'],
      quality = 85
    } = options;

    const urls: Record<string, Record<number, string>> = {};

    formats.forEach(format => {
      urls[format] = {};
      sizes.forEach(size => {
        urls[format][size] = this.buildOptimizedUrl(baseUrl, {
          width: size,
          format,
          quality
        });
      });
    });

    return urls;
  }

  // Build optimized image URL with parameters
  static buildOptimizedUrl(baseUrl: string, options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  } = {}) {
    const {
      width,
      height,
      format = 'webp',
      quality = 85,
      fit = 'cover'
    } = options;

    // If using Cloudflare Images or similar service
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('f', format);
    params.set('q', quality.toString());
    params.set('fit', fit);

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate srcset string for responsive images
  static generateSrcSet(baseUrl: string, options: {
    sizes?: number[];
    format?: string;
    quality?: number;
  } = {}) {
    const {
      sizes = [400, 800, 1200, 1920],
      format = 'webp',
      quality = 85
    } = options;

    return sizes
      .map(size => {
        const url = this.buildOptimizedUrl(baseUrl, { width: size, format, quality });
        return `${url} ${size}w`;
      })
      .join(', ');
  }

  // Generate sizes attribute for responsive images
  static generateSizes(breakpoints: Record<string, number> = config.images.breakpoints) {
    return [
      `(max-width: ${breakpoints.mobile}px) 100vw`,
      `(max-width: ${breakpoints.tablet}px) 50vw`,
      `(max-width: ${breakpoints.desktop}px) 33vw`,
      '25vw'
    ].join(', ');
  }

  // Get optimal image format based on browser support
  static getOptimalFormat(userAgent?: string): string {
    if (typeof window !== 'undefined') {
      // Client-side detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Check AVIF support
      if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        return 'avif';
      }
      
      // Check WebP support
      if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return 'webp';
      }
      
      return 'jpeg';
    }

    // Server-side detection based on user agent
    if (userAgent) {
      // Chrome 85+, Edge 85+, Firefox 93+, Safari 16+
      if (/Chrome\/([8-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Edge\/([8-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Firefox\/([9-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Safari\/([1-9]\d{2,})/.test(userAgent)) {
        return 'avif';
      }
      
      // WebP support: Chrome 23+, Firefox 65+, Edge 18+, Safari 14+
      if (/Chrome\/([2-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Firefox\/([6-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Edge\/([1-9]\d|[1-9]\d{2,})/.test(userAgent) ||
          /Safari\/([1-9]\d{2,})/.test(userAgent)) {
        return 'webp';
      }
    }

    return 'jpeg';
  }

  // Preload critical images
  static preloadImage(src: string, options: {
    as?: 'image';
    fetchpriority?: 'high' | 'low' | 'auto';
    sizes?: string;
    type?: string;
  } = {}) {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = options.as || 'image';
    
    if (options.fetchpriority) {
      link.setAttribute('fetchpriority', options.fetchpriority);
    }
    
    if (options.sizes) {
      link.setAttribute('imagesizes', options.sizes);
    }
    
    if (options.type) {
      link.type = options.type;
    }

    document.head.appendChild(link);
  }

  // Lazy load images with Intersection Observer
  static setupLazyLoading() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the actual image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }

          // Remove loading class and add loaded class
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          observer.unobserve(img);
        }
      });
    }, {
      // Start loading when image is 50px away from viewport
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Generate blur placeholder for images
  static generateBlurPlaceholder(width: number = 40, height: number = 40): string {
    // Generate a simple SVG blur placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Calculate image dimensions maintaining aspect ratio
  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (targetWidth && targetHeight) {
      return { width: targetWidth, height: targetHeight };
    }

    if (targetWidth) {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      };
    }

    if (targetHeight) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      };
    }

    return { width: originalWidth, height: originalHeight };
  }

  // Validate image file size and format
  static validateImage(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

    if (file.size > maxSize) {
      errors.push(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Progressive image loading component helper
export function createProgressiveImage(src: string, options: {
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
} = { alt: '' }) {
  const {
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 85
  } = options;

  // Generate different sizes and formats
  const sizes = ImageOptimizer.generateSizes();
  const srcSet = ImageOptimizer.generateSrcSet(src, { quality });
  const placeholder = ImageOptimizer.generateBlurPlaceholder(width, height);

  return {
    src,
    srcSet,
    sizes,
    alt,
    width,
    height,
    className: `${className} ${priority ? '' : 'lazy-loading'}`.trim(),
    placeholder,
    loading: priority ? 'eager' : 'lazy',
    'data-src': priority ? undefined : src,
    'data-srcset': priority ? undefined : srcSet
  };
}

// Initialize image optimization on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ImageOptimizer.setupLazyLoading();
  });
}
