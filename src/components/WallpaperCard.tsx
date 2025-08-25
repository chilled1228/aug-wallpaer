'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Download, 
  Heart, 
  Star, 
  Eye, 
  Share2,
  MoreVertical,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Wallpaper } from '@/lib/supabase';
import { Analytics } from '@/lib/analytics';
import { CDNService } from '@/lib/cdn-config';
import DownloadButton from './DownloadButton';
import SocialProof from './SocialProof';
import FavoriteButton from './FavoriteButton';
import { QuickShareButton } from './SocialShare';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  priority?: boolean;
  showStats?: boolean;
  className?: string;
}

export default function WallpaperCard({ 
  wallpaper, 
  priority = false, 
  showStats = true,
  className = '' 
}: WallpaperCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDownload = async (e: React.MouseEvent, resolution: string = 'original') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // Track download
      await Analytics.trackDownload(wallpaper.id, resolution);
      
      // Create download link
      const link = document.createElement('a');
      link.href = wallpaper.image_url;
      link.download = `${wallpaper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${resolution}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality with user accounts
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper.title,
          text: wallpaper.description || `Check out this wallpaper: ${wallpaper.title}`,
          url: `${window.location.origin}/wallpaper/${wallpaper.id}`
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/wallpaper/${wallpaper.id}`);
        // TODO: Show toast notification
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-3 h-3" />;
      case 'tablet':
        return <Tablet className="w-3 h-3" />;
      case 'desktop':
        return <Monitor className="w-3 h-3" />;
      default:
        return <Monitor className="w-3 h-3" />;
    }
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden wallpaper-card ${className}`}>
      {/* Image Container */}
      <Link href={`/wallpaper/${wallpaper.id}`} className="block">
        <div className="relative aspect-portrait overflow-hidden">
          <Image
            src={wallpaper.image_url}
            alt={wallpaper.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 lazy-loading"
            sizes={CDNService.generateSizesAttribute()}
            priority={priority}
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
            onLoad={() => {
              // Remove lazy loading class when image loads
              const img = document.querySelector(`img[alt="${wallpaper.title}"]`);
              img?.classList.remove('lazy-loading');
              img?.classList.add('lazy-loaded');
            }}
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={(e) => handleDownload(e)}
                disabled={isLoading}
                className="touch-target bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full p-2 transition-all duration-200 focus-ring"
                aria-label="Download wallpaper"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <FavoriteButton
                wallpaperId={wallpaper.id}
                size="sm"
                onAuthRequired={() => {
                  // Handle auth required - could open auth modal
                  console.log('Authentication required for favorites');
                }}
              />
              
              <QuickShareButton
                wallpaper={{
                  id: wallpaper.id,
                  title: wallpaper.title,
                  image_url: wallpaper.image_url,
                  category: wallpaper.category
                }}
                size="sm"
              />
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
              {wallpaper.category}
            </span>
          </div>

          {/* Device type indicator */}
          {wallpaper.device_type && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                {getDeviceIcon(wallpaper.device_type)}
                <span className="capitalize">{wallpaper.device_type}</span>
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4">
        <Link href={`/wallpaper/${wallpaper.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
            {wallpaper.title}
          </h3>
        </Link>
        
        {wallpaper.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
            {wallpaper.description}
          </p>
        )}

        {/* Tags */}
        {wallpaper.tags && wallpaper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {wallpaper.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {wallpaper.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                +{wallpaper.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Social Proof and Stats */}
        {showStats && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SocialProof
                  wallpaper={{
                    id: wallpaper.id,
                    title: wallpaper.title,
                    download_count: wallpaper.download_count,
                    average_rating: wallpaper.average_rating,
                    created_at: wallpaper.created_at
                  }}
                  showTrending={true}
                  showRecentActivity={false}
                />
              </div>

              {/* Quick download button */}
              <DownloadButton
                wallpaper={wallpaper}
                variant="icon"
                showOptions={false}
                className="opacity-75 hover:opacity-100 ml-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for wallpaper cards
export function WallpaperCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-portrait bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="flex space-x-1 mt-2">
          <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
