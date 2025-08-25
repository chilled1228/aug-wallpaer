'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Heart, Eye, ArrowRight } from 'lucide-react';
import { RecommendationEngine } from './AdvancedSearch';
import WallpaperCard from './WallpaperCard';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface RecommendationsProps {
  context?: {
    currentWallpaper?: string;
    searchQuery?: string;
    category?: string;
  };
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

interface RecommendationSection {
  id: string;
  title: string;
  icon: any;
  wallpapers: any[];
  type: 'personalized' | 'trending' | 'similar' | 'recent';
}

export default function Recommendations({ 
  context, 
  limit = 12,
  showTitle = true,
  className = '' 
}: RecommendationsProps) {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, [context]);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      // Generate recommendation sections
      const recommendationSections: RecommendationSection[] = [];

      // Personalized recommendations (if user is logged in)
      if (currentUser) {
        const personalizedIds = await RecommendationEngine.getRecommendations(
          currentUser.id, 
          context
        );
        const personalizedWallpapers = await fetchWallpapersByIds(personalizedIds.slice(0, limit));
        
        if (personalizedWallpapers.length > 0) {
          recommendationSections.push({
            id: 'personalized',
            title: 'Recommended for You',
            icon: Sparkles,
            wallpapers: personalizedWallpapers,
            type: 'personalized'
          });
        }
      }

      // Similar wallpapers (if viewing a specific wallpaper)
      if (context?.currentWallpaper) {
        const similarWallpapers = await fetchSimilarWallpapers(context.currentWallpaper, limit);
        if (similarWallpapers.length > 0) {
          recommendationSections.push({
            id: 'similar',
            title: 'Similar Wallpapers',
            icon: Eye,
            wallpapers: similarWallpapers,
            type: 'similar'
          });
        }
      }

      // Trending wallpapers
      const trendingWallpapers = await fetchTrendingWallpapers(context?.category, limit);
      if (trendingWallpapers.length > 0) {
        recommendationSections.push({
          id: 'trending',
          title: context?.category ? `Trending in ${context.category}` : 'Trending Now',
          icon: TrendingUp,
          wallpapers: trendingWallpapers,
          type: 'trending'
        });
      }

      // Recently added
      const recentWallpapers = await fetchRecentWallpapers(context?.category, limit);
      if (recentWallpapers.length > 0) {
        recommendationSections.push({
          id: 'recent',
          title: 'Recently Added',
          icon: Clock,
          wallpapers: recentWallpapers,
          type: 'recent'
        });
      }

      // Popular this week
      const popularWallpapers = await fetchPopularWallpapers(limit);
      if (popularWallpapers.length > 0) {
        recommendationSections.push({
          id: 'popular',
          title: 'Popular This Week',
          icon: Heart,
          wallpapers: popularWallpapers,
          type: 'trending'
        });
      }

      setSections(recommendationSections);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallpapersByIds = async (ids: string[]) => {
    if (ids.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .in('id', ids)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch wallpapers by IDs:', error);
      return [];
    }
  };

  const fetchSimilarWallpapers = async (wallpaperId: string, count: number) => {
    try {
      // Get the current wallpaper to find similar ones
      const { data: currentWallpaper } = await supabase
        .from('wallpapers')
        .select('category, tags')
        .eq('id', wallpaperId)
        .single();

      if (!currentWallpaper) return [];

      // Find wallpapers with similar category or tags
      let query = supabase
        .from('wallpapers')
        .select('*')
        .neq('id', wallpaperId)
        .limit(count);

      if (currentWallpaper.category) {
        query = query.eq('category', currentWallpaper.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch similar wallpapers:', error);
      return [];
    }
  };

  const fetchTrendingWallpapers = async (category?: string, count: number = 12) => {
    try {
      let query = supabase
        .from('wallpapers')
        .select('*')
        .order('download_count', { ascending: false })
        .limit(count);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch trending wallpapers:', error);
      return [];
    }
  };

  const fetchRecentWallpapers = async (category?: string, count: number = 12) => {
    try {
      let query = supabase
        .from('wallpapers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(count);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch recent wallpapers:', error);
      return [];
    }
  };

  const fetchPopularWallpapers = async (count: number = 12) => {
    try {
      // Get wallpapers with high ratings and downloads from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('average_rating', { ascending: false })
        .order('download_count', { ascending: false })
        .limit(count);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch popular wallpapers:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="wallpaper-grid">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="aspect-portrait bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover More
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations just for you
          </p>
        </div>
      )}

      {/* Section Navigation (for mobile) */}
      {sections.length > 1 && (
        <div className="md:hidden">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === index
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendation Sections */}
      <div className="space-y-12">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isVisible = sections.length === 1 || index === activeSection || window.innerWidth >= 768;
          
          if (!isVisible) return null;

          return (
            <section key={section.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                
                {section.wallpapers.length > 6 && (
                  <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="wallpaper-grid">
                {section.wallpapers.slice(0, 6).map((wallpaper, wallpaperIndex) => (
                  <WallpaperCard
                    key={wallpaper.id}
                    wallpaper={wallpaper}
                    showStats={true}
                    priority={index === 0 && wallpaperIndex < 4}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Load More Button */}
      {sections.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadRecommendations}
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Refresh Recommendations</span>
          </button>
        </div>
      )}
    </div>
  );
}
