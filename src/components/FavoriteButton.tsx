'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { FavoritesService, AuthService } from '@/lib/auth';
import { Analytics } from '@/lib/analytics';

interface FavoriteButtonProps {
  wallpaperId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onAuthRequired?: () => void;
}

export default function FavoriteButton({ 
  wallpaperId, 
  className = '',
  size = 'md',
  showCount = false,
  onAuthRequired
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndFavoriteStatus();
  }, [wallpaperId]);

  const checkAuthAndFavoriteStatus = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const favorited = await FavoritesService.isFavorited(currentUser.id, wallpaperId);
        setIsFavorited(favorited);
      }

      // Get favorite count (you'd implement this in your backend)
      // For now, using a mock count
      setFavoriteCount(Math.floor(Math.random() * 100) + 10);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);

    try {
      if (isFavorited) {
        const result = await FavoritesService.removeFromFavorites(user.id, wallpaperId);
        if (!result.error) {
          setIsFavorited(false);
          setFavoriteCount(prev => Math.max(0, prev - 1));
          
          // Track unfavorite
          await Analytics.trackPageView(`/unfavorite/${wallpaperId}`);
        }
      } else {
        const result = await FavoritesService.addToFavorites(user.id, wallpaperId);
        if (!result.error) {
          setIsFavorited(true);
          setFavoriteCount(prev => prev + 1);
          
          // Track favorite
          await Analytics.trackPageView(`/favorite/${wallpaperId}`);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={handleToggleFavorite}
        disabled={loading}
        className={`
          ${getButtonSize()}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isFavorited 
            ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500'
          }
          ${loading ? 'animate-pulse' : ''}
        `}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`${getIconSize()} transition-all duration-200 ${
            isFavorited ? 'fill-current scale-110' : ''
          }`}
        />
      </button>

      {showCount && favoriteCount > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {favoriteCount}
        </span>
      )}
    </div>
  );
}
