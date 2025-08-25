'use client';

import { useState } from 'react';
import { 
  Download, 
  Monitor, 
  Check, 
  AlertCircle
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
}

export default function DownloadButton({ 
  wallpaper, 
  className = '', 
  variant = 'primary'
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Download options - only original quality
  const downloadOptions: DownloadOption[] = [
    {
      label: 'Original Quality',
      resolution: 'Original',
      width: 0,
      height: 0,
      size: '~5MB',
      device: 'desktop',
      recommended: true
    }
  ];

  // Detect if user is on mobile device
  function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Handle download with specific resolution
  const handleDownload = async (option?: DownloadOption) => {
    setIsDownloading(true);
    setDownloadStatus('idle');

    try {
      // Validate wallpaper URL
      if (!wallpaper.image_url) {
        throw new Error('Wallpaper image URL is not available');
      }

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

      // Test if the URL is accessible
      try {
        const response = await fetch(downloadUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Image not accessible: ${response.status}`);
        }
      } catch (fetchError) {
        console.warn('Could not verify image accessibility, proceeding with download:', fetchError);
      }

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = generateFileName(option);
      link.style.display = 'none';

      // Add error handling for download link
      link.onerror = () => {
        setDownloadStatus('error');
        console.error('Download link failed');
      };

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

      // Show user-friendly error message
      if (error instanceof Error) {
        console.error('Download error details:', error.message);
      }
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

  // Simple download button - only original quality available
  return (
    <button
      onClick={() => handleDownload(downloadOptions[0])}
      disabled={isDownloading}
      className={`${getButtonStyles()} ${className}`}
    >
      {getButtonContent()}
    </button>
  );
}
