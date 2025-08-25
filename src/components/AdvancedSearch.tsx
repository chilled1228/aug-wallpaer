'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Palette, 
  Monitor, 
  Smartphone, 
  Tablet,
  RotateCcw,
  Grid3X3,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Analytics } from '@/lib/analytics';

// Smart Recommendations Engine
export class RecommendationEngine {
  private static userPreferences = new Map<string, any>();
  private static searchHistory = new Map<string, string[]>();
  private static downloadHistory = new Map<string, string[]>();

  // Get personalized recommendations
  static async getRecommendations(userId?: string, context?: {
    currentWallpaper?: string;
    searchQuery?: string;
    category?: string;
  }): Promise<string[]> {
    try {
      // Get user preferences
      const preferences = userId ? this.getUserPreferences(userId) : null;

      // Get similar wallpapers based on context
      const recommendations = await this.generateRecommendations(preferences, context);

      return recommendations;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  // Generate recommendations based on user behavior
  private static async generateRecommendations(
    preferences: any,
    context?: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Content-based filtering
    if (context?.currentWallpaper) {
      const similar = await this.getSimilarWallpapers(context.currentWallpaper);
      recommendations.push(...similar);
    }

    // Collaborative filtering
    if (preferences) {
      const collaborative = await this.getCollaborativeRecommendations(preferences);
      recommendations.push(...collaborative);
    }

    // Trending content
    const trending = await this.getTrendingWallpapers(context?.category);
    recommendations.push(...trending);

    // Remove duplicates and return top recommendations
    return [...new Set(recommendations)].slice(0, 20);
  }

  // Get similar wallpapers based on visual features
  private static async getSimilarWallpapers(wallpaperId: string): Promise<string[]> {
    // In production, this would use image similarity algorithms
    // For now, return mock similar wallpapers
    return [`similar_${wallpaperId}_1`, `similar_${wallpaperId}_2`, `similar_${wallpaperId}_3`];
  }

  // Get recommendations based on similar users
  private static async getCollaborativeRecommendations(preferences: any): Promise<string[]> {
    // In production, this would find users with similar preferences
    // and recommend wallpapers they liked
    return ['collab_1', 'collab_2', 'collab_3'];
  }

  // Get trending wallpapers
  private static async getTrendingWallpapers(category?: string): Promise<string[]> {
    // Mock trending wallpapers
    const trending = ['trending_1', 'trending_2', 'trending_3', 'trending_4'];
    return category ? trending.filter(id => id.includes(category)) : trending;
  }

  // Update user preferences based on actions
  static updateUserPreferences(userId: string, action: {
    type: 'download' | 'favorite' | 'view' | 'search';
    wallpaperId?: string;
    category?: string;
    colors?: string[];
    query?: string;
  }) {
    const preferences = this.getUserPreferences(userId);

    switch (action.type) {
      case 'download':
      case 'favorite':
        if (action.wallpaperId) {
          preferences.favoriteWallpapers = preferences.favoriteWallpapers || [];
          preferences.favoriteWallpapers.push(action.wallpaperId);
        }
        if (action.category) {
          preferences.categories = preferences.categories || {};
          preferences.categories[action.category] = (preferences.categories[action.category] || 0) + 2;
        }
        if (action.colors) {
          preferences.colors = preferences.colors || {};
          action.colors.forEach(color => {
            preferences.colors[color] = (preferences.colors[color] || 0) + 1;
          });
        }
        break;

      case 'view':
        if (action.category) {
          preferences.categories = preferences.categories || {};
          preferences.categories[action.category] = (preferences.categories[action.category] || 0) + 0.5;
        }
        break;

      case 'search':
        if (action.query) {
          preferences.searchTerms = preferences.searchTerms || {};
          preferences.searchTerms[action.query] = (preferences.searchTerms[action.query] || 0) + 1;
        }
        break;
    }

    this.userPreferences.set(userId, preferences);
    this.saveUserPreferences(userId, preferences);
  }

  // Get user preferences
  private static getUserPreferences(userId: string): any {
    if (!this.userPreferences.has(userId)) {
      const stored = this.loadUserPreferences(userId);
      this.userPreferences.set(userId, stored);
    }
    return this.userPreferences.get(userId) || {};
  }

  // Load user preferences from storage
  private static loadUserPreferences(userId: string): any {
    try {
      const stored = localStorage.getItem(`user_preferences_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  // Save user preferences to storage
  private static saveUserPreferences(userId: string, preferences: any) {
    try {
      localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  // Get smart search suggestions
  static getSearchSuggestions(query: string, userPreferences?: any): string[] {
    const suggestions: string[] = [];

    // Add category-based suggestions
    if (userPreferences?.categories) {
      const topCategories = Object.entries(userPreferences.categories)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category]) => category);

      suggestions.push(...topCategories.map(cat => `${query} ${cat}`));
    }

    // Add color-based suggestions
    if (userPreferences?.colors) {
      const topColors = Object.entries(userPreferences.colors)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([color]) => color);

      suggestions.push(...topColors.map(color => `${color} ${query}`));
    }

    // Add popular search combinations
    const popularCombinations = [
      'minimal', 'abstract', 'nature', 'dark', 'light', 'colorful',
      'geometric', 'vintage', 'modern', 'artistic'
    ];

    suggestions.push(...popularCombinations
      .filter(term => term.toLowerCase().includes(query.toLowerCase()) || query === '')
      .map(term => query ? `${query} ${term}` : term)
    );

    return [...new Set(suggestions)].slice(0, 8);
  }
}

interface AdvancedSearchFilters {
  query: string;
  category: string;
  colors: string[];
  orientation: 'portrait' | 'landscape' | 'square' | '';
  resolution: string;
  deviceType: string;
  aspectRatio: string;
  tags: string[];
  sortBy: string;
  dateRange: string;
  minDownloads: number;
  minRating: number;
}

interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  initialFilters?: Partial<AdvancedSearchFilters>;
  className?: string;
}

const colorOptions: ColorOption[] = [
  { name: 'Red', value: 'red', hex: '#ef4444' },
  { name: 'Orange', value: 'orange', hex: '#f97316' },
  { name: 'Yellow', value: 'yellow', hex: '#eab308' },
  { name: 'Green', value: 'green', hex: '#22c55e' },
  { name: 'Blue', value: 'blue', hex: '#3b82f6' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#ffffff' },
  { name: 'Gray', value: 'gray', hex: '#6b7280' },
  { name: 'Brown', value: 'brown', hex: '#a3a3a3' },
  { name: 'Teal', value: 'teal', hex: '#14b8a6' }
];

const categoryOptions = [
  'nature', 'abstract', 'minimal', 'technology', 'art', 'photography',
  'space', 'animals', 'architecture', 'patterns', 'textures', 'vintage'
];

const resolutionOptions = [
  { label: 'Any Resolution', value: '' },
  { label: '4K (3840×2160)', value: '4k' },
  { label: 'QHD (2560×1440)', value: 'qhd' },
  { label: 'Full HD (1920×1080)', value: 'fhd' },
  { label: 'HD (1280×720)', value: 'hd' },
  { label: 'Mobile (1080×1920)', value: 'mobile' }
];

const aspectRatioOptions = [
  { label: 'Any Ratio', value: '' },
  { label: '16:9 (Widescreen)', value: '16:9' },
  { label: '16:10 (Widescreen)', value: '16:10' },
  { label: '4:3 (Standard)', value: '4:3' },
  { label: '1:1 (Square)', value: '1:1' },
  { label: '9:16 (Mobile)', value: '9:16' },
  { label: '21:9 (Ultrawide)', value: '21:9' }
];

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Downloaded', value: 'downloads' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Trending', value: 'trending' }
];

export default function AdvancedSearch({ 
  onSearch, 
  initialFilters = {},
  className = '' 
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: '',
    category: '',
    colors: [],
    orientation: '',
    resolution: '',
    deviceType: '',
    aspectRatio: '',
    tags: [],
    sortBy: 'relevance',
    dateRange: '',
    minDownloads: 0,
    minRating: 0,
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadRecentSearches();
    loadSuggestions();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.query || Object.values(filters).some(v => v && v !== '' && v !== 0 && (!Array.isArray(v) || v.length > 0))) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem('recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const loadSuggestions = async () => {
    // Mock suggestions - in production, fetch from API
    const mockSuggestions = [
      'mountain landscape', 'abstract art', 'minimal design', 'space galaxy',
      'ocean waves', 'forest nature', 'city skyline', 'geometric patterns'
    ];
    setSuggestions(mockSuggestions);
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      // Save recent search
      if (filters.query) {
        saveRecentSearch(filters.query);
      }

      // Track search
      await Analytics.trackSearch(filters.query, 0, {
        category: filters.category,
        colors: filters.colors.join(','),
        orientation: filters.orientation,
        resolution: filters.resolution
      });

      // Update URL
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 0) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, value.toString());
          }
        }
      });

      const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl);

      // Call parent search handler
      onSearch(filters);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [filters, onSearch, router]);

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      colors: [],
      orientation: '',
      resolution: '',
      deviceType: '',
      aspectRatio: '',
      tags: [],
      sortBy: 'relevance',
      dateRange: '',
      minDownloads: 0,
      minRating: 0
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'query' || key === 'sortBy') return false;
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '' && value !== 0;
    }).length;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="container-mobile py-4 md:py-6">
        {/* Main Search Bar */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              placeholder="Search wallpapers by keyword, style, or description..."
              className="w-full pl-12 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
            />
            {filters.query && (
              <button
                onClick={() => updateFilter('query', '')}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                showAdvanced ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>

          {/* Search Suggestions */}
          {filters.query === '' && (recentSearches.length > 0 || suggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {recentSearches.length > 0 && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => updateFilter('query', search)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => updateFilter('query', suggestion)}
                        className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryOptions.slice(0, 6).map((category) => (
            <button
              key={category}
              onClick={() => updateFilter('category', filters.category === category ? '' : category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.category === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Colors
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => toggleColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        filters.colors.includes(color.value)
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Grid3X3 className="w-4 h-4 inline mr-2" />
                  Orientation
                </label>
                <div className="space-y-2">
                  {[
                    { label: 'Any', value: '' },
                    { label: 'Portrait', value: 'portrait' },
                    { label: 'Landscape', value: 'landscape' },
                    { label: 'Square', value: 'square' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="orientation"
                        value={option.value}
                        checked={filters.orientation === option.value}
                        onChange={(e) => updateFilter('orientation', e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Resolution
                </label>
                <select
                  value={filters.resolution}
                  onChange={(e) => updateFilter('resolution', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Device Type
                </label>
                <div className="flex space-x-2">
                  {[
                    { label: 'Mobile', value: 'mobile', icon: Smartphone },
                    { label: 'Tablet', value: 'tablet', icon: Tablet },
                    { label: 'Desktop', value: 'desktop', icon: Monitor }
                  ].map((device) => {
                    const Icon = device.icon;
                    return (
                      <button
                        key={device.value}
                        onClick={() => updateFilter('deviceType', filters.deviceType === device.value ? '' : device.value)}
                        className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                          filters.deviceType === device.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{device.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Aspect Ratio
                </label>
                <select
                  value={filters.aspectRatio}
                  onChange={(e) => updateFilter('aspectRatio', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {aspectRatioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search Status */}
        {isSearching && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        )}
      </div>
    </div>
  );
}
