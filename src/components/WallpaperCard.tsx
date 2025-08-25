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
    <div className={`card-wallpaper group relative ${className}`}>
      {/* Image Container */}
      <Link href={`/wallpaper/${wallpaper.id}`} className="block">
        <div className="relative aspect-portrait overflow-hidden rounded-t">
          <Image
            src={wallpaper.image_url}
            alt={wallpaper.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 lazy-loading"
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
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex space-x-2">
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
              
              <button
                onClick={(e) => handleDownload(e)}
                disabled={isLoading}
                className="btn-download flex items-center space-x-2 text-sm py-2 px-3"
                aria-label="Download wallpaper"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="tag-category bg-brand-soft text-brand border-2 border-white">
              {wallpaper.category}
            </span>
          </div>

          {/* Resolution & Device badges */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            {wallpaper.resolution && (
              <span className="badge-resolution">
                {wallpaper.resolution}
              </span>
            )}
            {wallpaper.device_type && (
              <span className="badge-featured flex items-center space-x-1">
                {getDeviceIcon(wallpaper.device_type)}
                <span className="capitalize text-xs">{wallpaper.device_type}</span>
              </span>
            )}
          </div>

          {/* Featured indicator */}
          {wallpaper.featured && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <span className="badge-featured flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5">
        <Link href={`/wallpaper/${wallpaper.id}`}>
          <h3 className="font-bold text-brand group-hover:text-brand-accent transition-colors duration-200 line-clamp-2 text-lg mb-2">
            {wallpaper.title}
          </h3>
        </Link>
        
        {wallpaper.description && (
          <p className="text-sm text-brand-text/70 mt-1 line-clamp-2 mb-3">
            {wallpaper.description}
          </p>
        )}

        {/* Tags */}
        {wallpaper.tags && wallpaper.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {wallpaper.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="tag-category text-xs"
              >
                #{tag}
              </span>
            ))}
            {wallpaper.tags.length > 3 && (
              <span className="text-xs text-brand-accent px-2 py-1">
                +{wallpaper.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Social Proof and Stats */}
        {showStats && (
          <div className="mt-4 pt-4 border-t border-brand-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-brand-accent">
                {wallpaper.download_count && (
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{wallpaper.download_count.toLocaleString()}</span>
                  </div>
                )}
                {wallpaper.average_rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-brand-soft" />
                    <span>{wallpaper.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Quick download button */}
              <DownloadButton
                wallpaper={wallpaper}
                variant="icon"
                showOptions={false}
                className="opacity-75 hover:opacity-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-brand-surface border-4 border-brand-accent flex items-center justify-center rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-soft border-t-brand"></div>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for wallpaper cards
export function WallpaperCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-wallpaper loading-shimmer ${className}`}>
      <div className="aspect-portrait bg-brand-surface rounded-t-2xl" />
      <div className="p-5">
        <div className="h-5 bg-brand-surface rounded mb-3" />
        <div className="h-3 bg-brand-surface rounded w-3/4 mb-4" />
        <div className="flex space-x-2 mb-4">
          <div className="h-6 w-12 bg-brand-surface rounded-full" />
          <div className="h-6 w-16 bg-brand-surface rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-brand-surface">
          <div className="flex space-x-4">
            <div className="h-3 w-8 bg-brand-surface rounded" />
            <div className="h-3 w-8 bg-brand-surface rounded" />
          </div>
          <div className="h-6 w-6 bg-brand-surface rounded" />
        </div>
      </div>
    </div>
  );
}
