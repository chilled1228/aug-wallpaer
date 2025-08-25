'use client';

import { useState, useRef } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Check, 
  AlertCircle,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Analytics } from '@/lib/analytics';
import { CDNService } from '@/lib/cdn-config';

interface DownloadOption {
  label: string;
  resolution: string;
  width: number;
  height: number;
  size: string;
  device: 'mobile' | 'tablet' | 'desktop';
  recommended?: boolean;
}

interface DownloadButtonProps {
  wallpaper: {
    id: string;
    title: string;
    image_url: string;
    category: string;
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  showOptions?: boolean;
}

export default function DownloadButton({ 
  wallpaper, 
  className = '', 
  variant = 'primary',
  showOptions = true 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const downloadRef = useRef<HTMLAnchorElement>(null);

  // Download options based on device type and common resolutions
  const downloadOptions: DownloadOption[] = [
    {
      label: 'Mobile (Portrait)',
      resolution: '1080x1920',
      width: 1080,
      height: 1920,
      size: '~800KB',
      device: 'mobile',
      recommended: isMobileDevice()
    },
    {
      label: 'Mobile (Landscape)',
      resolution: '1920x1080',
      width: 1920,
      height: 1080,
      size: '~900KB',
      device: 'mobile'
    },
    {
      label: 'Tablet',
      resolution: '1536x2048',
      width: 1536,
      height: 2048,
      size: '~1.2MB',
      device: 'tablet'
    },
    {
      label: 'Desktop HD',
      resolution: '1920x1080',
      width: 1920,
      height: 1080,
      size: '~1.5MB',
      device: 'desktop',
      recommended: !isMobileDevice()
    },
    {
      label: 'Desktop 4K',
      resolution: '3840x2160',
      width: 3840,
      height: 2160,
      size: '~3MB',
      device: 'desktop'
    },
    {
      label: 'Original Quality',
      resolution: 'Original',
      width: 0,
      height: 0,
      size: '~5MB',
      device: 'desktop'
    }
  ];

  // Detect if user is on mobile device
  function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Get device icon
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  // Handle download with specific resolution
  const handleDownload = async (option?: DownloadOption) => {
    setIsDownloading(true);
    setDownloadStatus('idle');

    try {
      // Track download attempt
      await Analytics.trackDownload(
        wallpaper.id, 
        option?.resolution || 'default'
      );

      let downloadUrl = wallpaper.image_url;
      
      // Generate optimized URL if specific resolution requested
      if (option && option.width > 0) {
        downloadUrl = CDNService.getOptimizedImageUrl(wallpaper.image_url, {
          width: option.width,
          height: option.height,
          quality: 95, // High quality for downloads
          format: 'jpeg'
        });
      }

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = generateFileName(option);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success state
      setDownloadStatus('success');
      
      // Try to set as wallpaper on mobile
      if (isMobileDevice() && 'setAsWallpaper' in navigator) {
        try {
          await (navigator as any).setAsWallpaper(downloadUrl);
        } catch (error) {
          // Fallback to showing instructions
          showSetWallpaperInstructions();
        }
      }

      // Hide dropdown after download
      setShowDropdown(false);

    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('error');
    } finally {
      setIsDownloading(false);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);
    }
  };

  // Generate filename for download
  const generateFileName = (option?: DownloadOption): string => {
    const sanitizedTitle = wallpaper.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    const resolution = option?.resolution || 'original';
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `${sanitizedTitle}_${resolution}_${timestamp}.jpg`;
  };

  // Show instructions for setting wallpaper manually
  const showSetWallpaperInstructions = () => {
    const instructions = isMobileDevice() 
      ? 'Tap and hold the downloaded image, then select "Set as wallpaper"'
      : 'Right-click the downloaded image and select "Set as desktop background"';
    
    // You could show a toast notification here
    console.log(instructions);
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper.title,
          text: `Check out this amazing wallpaper: ${wallpaper.title}`,
          url: `${window.location.origin}/wallpaper/${wallpaper.id}`
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/wallpaper/${wallpaper.id}`
        );
        // Show copied notification
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  // Get button content based on status
  const getButtonContent = () => {
    if (isDownloading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Downloading...</span>
        </>
      );
    }

    if (downloadStatus === 'success') {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Downloaded!</span>
        </>
      );
    }

    if (downloadStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Try Again</span>
        </>
      );
    }

    return (
      <>
        <Download className="w-4 h-4" />
        <span>{variant === 'icon' ? '' : 'Download'}</span>
      </>
    );
  };

  // Get button styles based on variant and status
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center space-x-2 font-medium rounded-lg transition-all duration-200 focus-ring touch-target';
    
    if (downloadStatus === 'success') {
      return `${baseStyles} bg-green-600 text-white px-4 py-2`;
    }
    
    if (downloadStatus === 'error') {
      return `${baseStyles} bg-red-600 text-white px-4 py-2`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 ${isDownloading ? 'opacity-75' : ''}`;
      case 'secondary':
        return `${baseStyles} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 ${isDownloading ? 'opacity-75' : ''}`;
      case 'icon':
        return `${baseStyles} bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-2 rounded-full ${isDownloading ? 'opacity-75' : ''}`;
      default:
        return baseStyles;
    }
  };

  if (!showOptions) {
    // Simple download button without options
    return (
      <button
        onClick={() => handleDownload()}
        disabled={isDownloading}
        className={`${getButtonStyles()} ${className}`}
      >
        {getButtonContent()}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main download button */}
      <div className="flex">
        <button
          onClick={() => handleDownload(downloadOptions.find(opt => opt.recommended))}
          disabled={isDownloading}
          className={`${getButtonStyles()} ${showOptions ? 'rounded-r-none' : ''}`}
        >
          {getButtonContent()}
        </button>

        {/* Options dropdown trigger */}
        {showOptions && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isDownloading}
            className={`${getButtonStyles()} rounded-l-none border-l border-white border-opacity-20 px-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Download options dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2 px-2">
              Choose Resolution
            </div>
            
            {downloadOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleDownload(option)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(option.device)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                      {option.recommended && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.resolution} • {option.size}
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            ))}

            {/* Additional actions */}
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
              <button
                onClick={handleShare}
                className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Share Wallpaper</span>
              </button>
              
              {isMobileDevice() && (
                <button
                  onClick={() => {
                    handleDownload(downloadOptions.find(opt => opt.recommended));
                    showSetWallpaperInstructions();
                  }}
                  className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Set as Wallpaper</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
