'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  Eye, 
  Download,
  Heart,
  MessageCircle,
  Award,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import WallpaperCard from './WallpaperCard';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface CommunityPost {
  id: string;
  wallpaper: any;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    verified?: boolean;
  };
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  is_featured: boolean;
  is_liked?: boolean;
}

interface CommunityGalleryProps {
  filter?: 'trending' | 'recent' | 'featured' | 'following';
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export default function CommunityGallery({ 
  filter = 'trending',
  limit = 20,
  showFilters = true,
  className = '' 
}: CommunityGalleryProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState(filter);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadPosts();
  }, [currentFilter]);

  const loadUser = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const loadPosts = async () => {
    setLoading(true);
    
    try {
      // Mock community posts data
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          wallpaper: {
            id: 'w1',
            title: 'Sunset Mountain Vista',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            category: 'nature',
            download_count: 1234,
            average_rating: 4.8
          },
          user: {
            id: 'u1',
            username: 'naturelover',
            full_name: 'Alex Chen',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            verified: true
          },
          caption: 'Captured this breathtaking sunset during my hiking trip in the Rockies. The colors were absolutely incredible! 🌄',
          tags: ['sunset', 'mountains', 'nature', 'hiking'],
          likes: 342,
          comments: 28,
          shares: 15,
          created_at: '2024-01-20T10:30:00Z',
          is_featured: true,
          is_liked: false
        },
        {
          id: '2',
          wallpaper: {
            id: 'w2',
            title: 'Abstract Geometric Pattern',
            image_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
            category: 'abstract',
            download_count: 856,
            average_rating: 4.6
          },
          user: {
            id: 'u2',
            username: 'designpro',
            full_name: 'Maria Rodriguez',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
            verified: false
          },
          caption: 'New geometric design inspired by modern architecture. What do you think? 🎨',
          tags: ['abstract', 'geometric', 'modern', 'design'],
          likes: 189,
          comments: 12,
          shares: 8,
          created_at: '2024-01-19T15:45:00Z',
          is_featured: false,
          is_liked: true
        },
        {
          id: '3',
          wallpaper: {
            id: 'w3',
            title: 'Minimalist Ocean Waves',
            image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
            category: 'minimal',
            download_count: 2103,
            average_rating: 4.9
          },
          user: {
            id: 'u3',
            username: 'minimalista',
            full_name: 'David Kim',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            verified: true
          },
          caption: 'Sometimes less is more. Clean, peaceful, perfect for focus. 🌊',
          tags: ['minimal', 'ocean', 'peaceful', 'clean'],
          likes: 567,
          comments: 34,
          shares: 23,
          created_at: '2024-01-18T09:15:00Z',
          is_featured: true,
          is_liked: false
        }
      ];

      // Filter posts based on current filter
      let filteredPosts = mockPosts;
      
      switch (currentFilter) {
        case 'featured':
          filteredPosts = mockPosts.filter(post => post.is_featured);
          break;
        case 'recent':
          filteredPosts = mockPosts.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
        case 'trending':
          filteredPosts = mockPosts.sort((a, b) => 
            (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
          );
          break;
        case 'following':
          // Would filter by followed users
          filteredPosts = mockPosts.slice(0, 2);
          break;
      }

      setPosts(filteredPosts.slice(0, limit));
    } catch (error) {
      console.error('Failed to load community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      // Show auth modal
      return;
    }

    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes: post.is_liked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community Gallery
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'featured', label: 'Featured', icon: Award },
            ...(user ? [{ id: 'following', label: 'Following', icon: Users }] : [])
          ].map((filterOption) => {
            const Icon = filterOption.icon;
            return (
              <button
                key={filterOption.id}
                onClick={() => setCurrentFilter(filterOption.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentFilter === filterOption.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{filterOption.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Posts */}
      <div className={viewMode === 'grid' ? 'space-y-8' : 'space-y-6'}>
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {post.user.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {post.user.full_name}
                    </h3>
                    {post.user.verified && (
                      <Star className="w-4 h-4 text-blue-500 fill-current" />
                    )}
                    {post.is_featured && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    @{post.user.username} • {formatTimeAgo(post.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Wallpaper */}
            <div className={viewMode === 'grid' ? 'px-4' : ''}>
              <WallpaperCard
                wallpaper={post.wallpaper}
                showStats={false}
                className={viewMode === 'list' ? 'flex space-x-4' : ''}
              />
            </div>

            {/* Post Content */}
            <div className="p-4 space-y-3">
              {/* Caption */}
              <p className="text-gray-900 dark:text-white">
                {post.caption}
              </p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      post.is_liked
                        ? 'text-red-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>

                  <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>

                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Download className="w-5 h-5" />
                    <span className="text-sm">{post.wallpaper.download_count}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{post.shares} shares</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {posts.length >= limit && (
        <div className="text-center">
          <button
            onClick={loadPosts}
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span>Load More Posts</span>
          </button>
        </div>
      )}
    </div>
  );
}
