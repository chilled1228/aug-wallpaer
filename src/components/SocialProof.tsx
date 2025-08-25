'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  Download, 
  Eye, 
  Heart, 
  Users,
  Award,
  Zap,
  Clock
} from 'lucide-react';
import { Analytics } from '@/lib/analytics';

interface SocialProofProps {
  wallpaper: {
    id: string;
    title: string;
    download_count?: number;
    average_rating?: number;
    view_count?: number;
    favorite_count?: number;
    created_at: string;
  };
  showTrending?: boolean;
  showRecentActivity?: boolean;
  className?: string;
}

interface RecentActivity {
  type: 'download' | 'rating' | 'favorite';
  count: number;
  timeframe: string;
}

export default function SocialProof({ 
  wallpaper, 
  showTrending = true,
  showRecentActivity = true,
  className = '' 
}: SocialProofProps) {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isPopular, setIsPopular] = useState(false);
  const [trendingScore, setTrendingScore] = useState(0);

  useEffect(() => {
    // Calculate trending score and popularity
    calculateTrendingMetrics();
    
    // Fetch recent activity
    if (showRecentActivity) {
      fetchRecentActivity();
    }
  }, [wallpaper.id]);

  const calculateTrendingMetrics = () => {
    const downloads = wallpaper.download_count || 0;
    const rating = wallpaper.average_rating || 0;
    const views = wallpaper.view_count || 0;
    const favorites = wallpaper.favorite_count || 0;
    
    // Calculate age in days
    const ageInDays = Math.max(1, 
      (Date.now() - new Date(wallpaper.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate trending score (downloads per day + rating boost)
    const downloadsPerDay = downloads / ageInDays;
    const ratingBoost = rating > 4 ? rating * 10 : 0;
    const engagementScore = (favorites + views * 0.1) / ageInDays;
    
    const score = downloadsPerDay + ratingBoost + engagementScore;
    setTrendingScore(Math.round(score));
    
    // Mark as popular if above threshold
    setIsPopular(score > 50 || downloads > 1000 || rating > 4.5);
  };

  const fetchRecentActivity = async () => {
    // Simulate recent activity data
    // In a real app, this would fetch from your analytics API
    const mockActivity: RecentActivity[] = [
      { type: 'download', count: Math.floor(Math.random() * 50) + 10, timeframe: 'last 24h' },
      { type: 'rating', count: Math.floor(Math.random() * 20) + 5, timeframe: 'this week' },
      { type: 'favorite', count: Math.floor(Math.random() * 30) + 8, timeframe: 'last 24h' }
    ];
    
    setRecentActivity(mockActivity);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download':
        return <Download className="w-3 h-3" />;
      case 'rating':
        return <Star className="w-3 h-3" />;
      case 'favorite':
        return <Heart className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'download':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'rating':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'favorite':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
          {/* Download count */}
          {wallpaper.download_count !== undefined && (
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span className="font-medium">{formatNumber(wallpaper.download_count)}</span>
              <span className="hidden sm:inline">downloads</span>
            </div>
          )}
          
          {/* Rating */}
          {wallpaper.average_rating !== undefined && wallpaper.average_rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span className="font-medium">{wallpaper.average_rating.toFixed(1)}</span>
              <span className="hidden sm:inline">rating</span>
            </div>
          )}
          
          {/* View count */}
          {wallpaper.view_count !== undefined && (
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{formatNumber(wallpaper.view_count)}</span>
              <span className="hidden sm:inline">views</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2">
          {/* Trending badge */}
          {showTrending && trendingScore > 30 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
          )}
          
          {/* Popular badge */}
          {isPopular && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
              <Award className="w-3 h-3" />
              <span>Popular</span>
            </div>
          )}
          
          {/* New badge removed per request */}
        </div>
      </div>

      {/* Recent activity */}
      {showRecentActivity && recentActivity.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Recent Activity</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
                <span className="font-medium">{activity.count}</span>
                <span>{activity.type}s</span>
                <span className="opacity-75">{activity.timeframe}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social proof messages */}
      <SocialProofMessages 
        downloadCount={wallpaper.download_count || 0}
        rating={wallpaper.average_rating || 0}
        isPopular={isPopular}
        isTrending={trendingScore > 30}
      />
    </div>
  );
}

// Social proof messages component
interface SocialProofMessagesProps {
  downloadCount: number;
  rating: number;
  isPopular: boolean;
  isTrending: boolean;
}

function SocialProofMessages({ 
  downloadCount, 
  rating, 
  isPopular, 
  isTrending 
}: SocialProofMessagesProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const proofMessages: string[] = [];

    if (downloadCount > 1000) {
      proofMessages.push(`Over ${Math.floor(downloadCount / 1000)}K people have downloaded this wallpaper`);
    }

    if (rating > 4.5) {
      proofMessages.push(`Highly rated with ${rating.toFixed(1)} stars`);
    }

    if (isPopular) {
      proofMessages.push('One of our most popular wallpapers');
    }

    if (isTrending) {
      proofMessages.push('Trending now - join thousands of others');
    }

    if (downloadCount > 100) {
      proofMessages.push(`${downloadCount} downloads and counting`);
    }

    // Add time-based urgency
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      proofMessages.push('Downloaded by professionals worldwide');
    }

    setMessages(proofMessages);
  }, [downloadCount, rating, isPopular, isTrending]);

  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 italic">
      <div className="flex items-center space-x-1">
        <Users className="w-3 h-3" />
        <span>{messages[currentMessage]}</span>
      </div>
    </div>
  );
}

// Rating component for user interaction
interface RatingComponentProps {
  wallpaperId: string;
  currentRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingComponent({ 
  wallpaperId, 
  currentRating = 0, 
  onRate,
  readonly = false,
  size = 'md'
}: RatingComponentProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = async (newRating: number) => {
    if (readonly) return;

    setRating(newRating);
    
    try {
      await Analytics.trackRating(wallpaperId, newRating);
      onRate?.(newRating);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          className={`${getStarSize()} ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <Star
            className={`${getStarSize()} ${
              star <= (hoverRating || rating)
                ? 'fill-current text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
      
      {!readonly && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {hoverRating || rating || 'Rate this wallpaper'}
        </span>
      )}
    </div>
  );
}
