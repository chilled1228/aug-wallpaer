import Image from "next/image";
import Link from "next/link";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { Star, Calendar, TrendingUp, Heart } from "lucide-react";

export const metadata = {
  title: "Wallpaper Collections | Curated Digital Designs | Wallpaper Gallery",
  description: "Explore our curated digital wallpaper collections featuring trending designs, seasonal favorites, and premium selections. Discover coordinated wallpaper sets for your devices.",
  keywords: ["wallpaper collections", "curated wallpapers", "trending wallpapers", "digital wallpaper sets"],
};

async function getFeaturedWallpapers(): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching wallpapers:', error);
    return [];
  }

  return data || [];
}

async function getTrendingWallpapers(): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .contains('tags', ['trending'])
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching trending wallpapers:', error);
    return [];
  }

  return data || [];
}

const collections = [
  {
    id: "trending-2025",
    title: "Trending 2025",
    description: "The most popular wallpaper designs of the year",
    icon: TrendingUp,
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400"
  },
  {
    id: "seasonal-favorites",
    title: "Seasonal Favorites",
    description: "Wallpapers that capture the essence of each season",
    icon: Calendar,
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400"
  },
  {
    id: "premium-selection",
    title: "Premium Selection",
    description: "Our finest wallpapers for luxury interiors",
    icon: Star,
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400"
  },
  {
    id: "customer-favorites",
    title: "Customer Favorites",
    description: "Most loved wallpapers by our community",
    icon: Heart,
    color: "bg-pink-500",
    textColor: "text-pink-600 dark:text-pink-400"
  }
];

export default async function CollectionsPage() {
  const featuredWallpapers = await getFeaturedWallpapers();
  const trendingWallpapers = await getTrendingWallpapers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Wallpaper Collections
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Discover curated collections of premium digital wallpapers, trending designs, and seasonal favorites
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Collections Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => {
              const IconComponent = collection.icon;
              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className={`${collection.color} h-32 flex items-center justify-center`}>
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-semibold ${collection.textColor} group-hover:underline`}>
                      {collection.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {collection.description}
                    </p>
                    <span className="inline-block mt-4 text-blue-600 dark:text-blue-400 font-medium">
                      Explore Collection →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trending Wallpapers */}
        {trendingWallpapers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {trendingWallpapers.map((wallpaper) => (
                <Link
                  key={wallpaper.id}
                  href={`/wallpaper/${wallpaper.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                    <Image
                      src={wallpaper.image_url}
                      alt={wallpaper.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Trending
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                      {wallpaper.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {wallpaper.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Additions */}
        <section>
          <div className="flex items-center mb-8">
            <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Latest Additions
            </h2>
          </div>
          {featuredWallpapers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No wallpapers available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredWallpapers.map((wallpaper) => (
                <Link
                  key={wallpaper.id}
                  href={`/wallpaper/${wallpaper.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                    <Image
                      src={wallpaper.image_url}
                      alt={wallpaper.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200">
                      {wallpaper.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {wallpaper.category}
                    </p>
                    {wallpaper.tags && wallpaper.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {wallpaper.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
