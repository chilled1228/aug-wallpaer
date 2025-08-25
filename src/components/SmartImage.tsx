'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CDNService } from '@/lib/cdn-config';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function SmartImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect network speed
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setNetworkSpeed('fast');
        } else if (effectiveType === '3g' || effectiveType === '2g') {
          setNetworkSpeed('slow');
        }
      }
    }
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              observerRef.current?.unobserve(img);
            }
          });
        },
        {
          rootMargin: getLoadingMargin(),
          threshold: 0.1
        }
      );

      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Adjust loading margin based on network speed
  const getLoadingMargin = () => {
    switch (networkSpeed) {
      case 'slow':
        return '200px'; // Load earlier on slow connections
      case 'fast':
        return '50px';  // Load closer to viewport on fast connections
      default:
        return '100px'; // Default margin
    }
  };

  // Get optimized quality based on network speed
  const getOptimizedQuality = () => {
    if (networkSpeed === 'slow') {
      return Math.max(quality - 15, 60); // Reduce quality on slow connections
    }
    return quality;
  };

  // Generate optimized image URLs
  const getOptimizedSrc = () => {
    return CDNService.getOptimizedImageUrl(src, {
      width,
      height,
      quality: getOptimizedQuality(),
      format: getOptimalFormat()
    });
  };

  const getOptimalFormat = (): 'avif' | 'webp' | 'jpeg' => {
    // Check browser support for modern formats
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      
      // Check AVIF support
      if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        return 'avif';
      }
      
      // Check WebP support
      if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return 'webp';
      }
    }
    
    return 'jpeg';
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcset
  const responsiveSrcSet = sizes ? CDNService.generateResponsiveSrcSet(src, undefined, {
    quality: getOptimizedQuality(),
    format: getOptimalFormat()
  }) : undefined;

  // Generate blur placeholder if not provided
  const getBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple gradient placeholder
    const svg = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
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
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 dark:text-gray-400 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        ref={imgRef}
        src={priority ? getOptimizedSrc() : ''}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes={sizes || CDNService.generateSizesAttribute()}
        srcSet={priority ? responsiveSrcSet : undefined}
        priority={priority}
        quality={getOptimizedQuality()}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? getBlurPlaceholder() : undefined}
        onLoad={handleLoad}
        onError={handleError}
        data-src={!priority ? getOptimizedSrc() : undefined}
        data-srcset={!priority ? responsiveSrcSet : undefined}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Network speed indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {networkSpeed}
        </div>
      )}
    </div>
  );
}

// Progressive enhancement hook
export function useProgressiveEnhancement() {
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    // Check if browser supports modern features
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();
    const supportsServiceWorker = 'serviceWorker' in navigator;

    setIsEnhanced(supportsIntersectionObserver && supportsWebP && supportsServiceWorker);
  }, []);

  return isEnhanced;
}

// Image preloader utility
export class ImagePreloader {
  private static cache = new Map<string, Promise<void>>();

  static preload(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): Promise<void> {
    const optimizedSrc = CDNService.getOptimizedImageUrl(src, options);
    
    if (this.cache.has(optimizedSrc)) {
      return this.cache.get(optimizedSrc)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedSrc}`));
      img.src = optimizedSrc;
    });

    this.cache.set(optimizedSrc, promise);
    return promise;
  }

  static preloadMultiple(sources: Array<{
    src: string;
    options?: { width?: number; height?: number; quality?: number };
  }>): Promise<void[]> {
    return Promise.all(
      sources.map(({ src, options }) => this.preload(src, options))
    );
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
