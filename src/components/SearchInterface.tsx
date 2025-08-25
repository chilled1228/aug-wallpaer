'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown,
  Grid,
  List,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Analytics } from '@/lib/analytics';

interface SearchFilters {
  category?: string;
  tags?: string[];
  deviceType?: string;
  resolution?: string;
  sortBy?: string;
  viewMode?: 'grid' | 'list';
}

interface SearchInterfaceProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onSearch?: (query: string, filters: SearchFilters) => void;
  resultsCount?: number;
}

const filterOptions = {
  categories: ['nature', 'abstract', 'minimal', 'technology', 'art', 'photography'],
  deviceTypes: ['desktop', 'mobile', 'tablet', 'all'],
  resolutions: ['4K', 'HD', '1080p', '720p'],
  sortOptions: [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ]
};

export default function SearchInterface({ 
  initialQuery = '', 
  initialFilters = {},
  onSearch,
  resultsCount = 0
}: SearchInterfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery !== initialQuery || JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      handleSearch();
    }
  }, [debouncedQuery, filters]);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      // Track search
      await Analytics.trackSearch(debouncedQuery, resultsCount);
      
      // Update URL
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.deviceType) params.set('device', filters.deviceType);
      if (filters.resolution) params.set('resolution', filters.resolution);
      if (filters.sortBy) params.set('sort', filters.sortBy);
      if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      
      const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl);
      
      // Call parent search handler
      if (onSearch) {
        onSearch(debouncedQuery, filters);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, filters, onSearch, router, resultsCount]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container-mobile py-4 md:py-6">
        {/* Search Header */}
        <div className="flex items-center mb-4">
          <Search className="h-6 md:h-8 w-6 md:w-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Search Wallpapers
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wallpapers by name, style, or category..."
              className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white touch-target"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden touch-target flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filters (Desktop) */}
        <div className="hidden md:flex flex-wrap gap-2 mb-4">
          {filterOptions.categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilter('category', filters.category === category ? '' : category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-target ${
                filters.category === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {resultsCount > 0 ? (
              <>
                {resultsCount.toLocaleString()} wallpaper{resultsCount !== 1 ? 's' : ''} found
                {query && ` for "${query}"`}
              </>
            ) : (
              'Enter a search term to find wallpapers'
            )}
          </div>
          
          {/* Sort & View Options */}
          <div className="hidden md:flex items-center space-x-2">
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 dark:bg-gray-700 dark:text-white focus-ring"
            >
              {filterOptions.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => updateFilter('viewMode', 'grid')}
                className={`p-1.5 ${
                  filters.viewMode !== 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-l-md transition-colors`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateFilter('viewMode', 'list')}
                className={`p-1.5 ${
                  filters.viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-r-md transition-colors`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="container-mobile py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Mobile Filter Options */}
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => updateFilter('category', filters.category === category ? '' : category)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors touch-target ${
                        filters.category === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Device Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.deviceTypes.map((deviceType) => (
                    <button
                      key={deviceType}
                      onClick={() => updateFilter('deviceType', filters.deviceType === deviceType ? '' : deviceType)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-colors touch-target ${
                        filters.deviceType === deviceType
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {getDeviceIcon(deviceType)}
                      <span className="capitalize">{deviceType}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus-ring"
                >
                  {filterOptions.sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse" />
      )}
    </div>
  );
}
