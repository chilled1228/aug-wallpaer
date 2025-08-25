
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, Grid, List, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { supabase, type Wallpaper } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import SearchInterface from "@/components/SearchInterface";
import { Analytics } from "@/lib/analytics";

export const metadata = {
  title: "Search Wallpapers | Find Perfect Designs | Wallpaper Gallery",
  description: "Search our extensive wallpaper collection by room, style, color, and material. Use advanced filters to find the perfect wallpaper for your space.",
  keywords: ["search wallpapers", "wallpaper finder", "filter wallpapers", "wallpaper search"],
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface SearchFilters {
  category?: string;
  tags?: string;
  deviceType?: string;
  resolution?: string;
  sortBy?: string;
}

async function searchWallpapers(query?: string, filters?: SearchFilters): Promise<Wallpaper[]> {
  let supabaseQuery = supabase
    .from('wallpapers')
    .select('*');

  // Apply search query
  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
  }

  // Apply filters
  if (filters?.category) {
    supabaseQuery = supabaseQuery.eq('category', filters.category);
  }

  if (filters?.deviceType && filters.deviceType !== 'all') {
    supabaseQuery = supabaseQuery.eq('device_type', filters.deviceType);
  }

  if (filters?.resolution) {
    supabaseQuery = supabaseQuery.ilike('resolution', `%${filters.resolution}%`);
  }

  if (filters?.tags) {
    supabaseQuery = supabaseQuery.contains('tags', [filters.tags]);
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'popular':
      supabaseQuery = supabaseQuery.order('download_count', { ascending: false });
      break;
    case 'rating':
      supabaseQuery = supabaseQuery.order('average_rating', { ascending: false });
      break;
    case 'title_asc':
      supabaseQuery = supabaseQuery.order('title', { ascending: true });
      break;
    case 'title_desc':
      supabaseQuery = supabaseQuery.order('title', { ascending: false });
      break;
    case 'oldest':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: true });
      break;
    case 'newest':
    default:
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error('Error searching wallpapers:', error);
    return [];
  }

  return data || [];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const deviceType = typeof params.device === 'string' ? params.device : '';
  const resolution = typeof params.resolution === 'string' ? params.resolution : '';
  const sortBy = typeof params.sort === 'string' ? params.sort : 'newest';
  const tags = typeof params.tags === 'string' ? params.tags : '';

  const filters: SearchFilters = {
    category: category || undefined,
    deviceType: deviceType || undefined,
    resolution: resolution || undefined,
    sortBy: sortBy || undefined,
    tags: tags || undefined
  };

  const wallpapers = await searchWallpapers(query, filters);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Search Interface */}
      <SearchInterface
        initialQuery={query}
        initialFilters={filters}
        resultsCount={wallpapers.length}
      />

      {/* Results Section */}
      <div className="container-mobile py-6 md:py-8">
        {wallpapers.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {query ? 'No wallpapers found' : 'Start your search'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {query
                ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                : 'Enter a search term above to discover amazing wallpapers'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="touch-target inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus-ring"
              >
                Browse Categories
              </Link>
              <Link
                href="/collections"
                className="touch-target inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors focus-ring"
              >
                View Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="wallpaper-grid">
            {wallpapers.map((wallpaper, index) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                priority={index < 8}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
