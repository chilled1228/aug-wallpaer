'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, User, Verified, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified?: boolean;
    location?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  wallpaper?: {
    id: string;
    title: string;
  };
}

interface TestimonialsProps {
  wallpaperId?: string;
  limit?: number;
  showOverall?: boolean;
  className?: string;
}

export default function Testimonials({ 
  wallpaperId, 
  limit = 5, 
  showOverall = true,
  className = '' 
}: TestimonialsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [overallStats, setOverallStats] = useState({
    averageRating: 4.6,
    totalReviews: 1247,
    distribution: [
      { stars: 5, count: 856, percentage: 68.7 },
      { stars: 4, count: 298, percentage: 23.9 },
      { stars: 3, count: 67, percentage: 5.4 },
      { stars: 2, count: 18, percentage: 1.4 },
      { stars: 1, count: 8, percentage: 0.6 }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [wallpaperId, limit]);

  const fetchReviews = async () => {
    setLoading(true);
    
    // Mock reviews data - in production, fetch from API
    const mockReviews: Review[] = [
      {
        id: '1',
        user: {
          name: 'Sarah Chen',
          avatar: '/avatars/sarah.jpg',
          verified: true,
          location: 'San Francisco, CA'
        },
        rating: 5,
        comment: 'Absolutely stunning wallpaper! The quality is incredible and it looks perfect on my 4K monitor. The colors are vibrant and the detail is amazing.',
        date: '2024-01-15',
        helpful: 23,
        wallpaper: wallpaperId ? undefined : { id: 'w1', title: 'Mountain Sunset' }
      },
      {
        id: '2',
        user: {
          name: 'Mike Rodriguez',
          verified: false,
          location: 'Austin, TX'
        },
        rating: 5,
        comment: 'Perfect for my home office setup. Downloaded multiple resolutions and they all look great. Highly recommend!',
        date: '2024-01-12',
        helpful: 18
      },
      {
        id: '3',
        user: {
          name: 'Emma Thompson',
          avatar: '/avatars/emma.jpg',
          verified: true,
          location: 'London, UK'
        },
        rating: 4,
        comment: 'Beautiful wallpaper with great attention to detail. Only wish there were more similar styles available.',
        date: '2024-01-10',
        helpful: 12
      },
      {
        id: '4',
        user: {
          name: 'David Kim',
          verified: true,
          location: 'Seoul, South Korea'
        },
        rating: 5,
        comment: 'Amazing collection! I\'ve downloaded several wallpapers and they\'re all top quality. The mobile versions are perfectly optimized.',
        date: '2024-01-08',
        helpful: 31
      },
      {
        id: '5',
        user: {
          name: 'Lisa Anderson',
          avatar: '/avatars/lisa.jpg',
          verified: false,
          location: 'Toronto, Canada'
        },
        rating: 5,
        comment: 'Love the variety and quality. Easy download process and the images look fantastic on all my devices.',
        date: '2024-01-05',
        helpful: 15
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setReviews(mockReviews.slice(0, limit));
      setLoading(false);
    }, 500);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-current text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall rating stats */}
      {showOverall && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {overallStats.averageRating}
                </span>
                {renderStars(Math.round(overallStats.averageRating), 'md')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on {overallStats.totalReviews.toLocaleString()} reviews
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((overallStats.distribution[0].count / overallStats.totalReviews) * 100)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                5-star ratings
              </p>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="space-y-2">
            {overallStats.distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {dist.stars}★
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual reviews */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Quote className="w-5 h-5" />
          <span>What people are saying</span>
        </h3>

        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {review.user.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>

              {/* Review content */}
              <div className="flex-1 min-w-0">
                {/* User info and rating */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.user.name}
                    </h4>
                    {review.user.verified && (
                      <Verified className="w-4 h-4 text-blue-500" />
                    )}
                    {review.user.location && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • {review.user.location}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {review.comment}
                </p>

                {/* Wallpaper reference (for general reviews) */}
                {review.wallpaper && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Review for: <span className="font-medium">{review.wallpaper.title}</span>
                  </div>
                )}

                {/* Helpful votes */}
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {reviews.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => fetchReviews()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
