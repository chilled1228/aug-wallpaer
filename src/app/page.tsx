import Image from "next/image";
import Link from "next/link";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { Home as HomeIcon, Palette, Droplets, Hammer, Star, ArrowRight, TrendingUp, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import { Analytics } from "@/lib/analytics";

async function getWallpapers(): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching wallpapers:', error);
    return [];
  }

  return data || [];
}

async function getFeaturedWallpapers(): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('featured', true)
    .order('download_count', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured wallpapers:', error);
    return [];
  }

  return data || [];
}

async function getTrendingWallpapers(): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .rpc('get_trending_wallpapers', { days_back: 7, limit_count: 8 });

  if (error) {
    console.error('Error fetching trending wallpapers:', error);
    return [];
  }

  return data || [];
}

const quickLinks = [
  {
    title: "Browse by Device",
    description: "Find wallpapers optimized for your device",
    icon: HomeIcon,
    href: "/categories",
    color: "bg-blue-500",
    popular: ["Desktop", "Mobile", "Tablet", "Dual Monitor"]
  },
  {
    title: "Browse by Style",
    description: "Discover designs that match your aesthetic",
    icon: Palette,
    href: "/categories",
    color: "bg-purple-500",
    popular: ["Modern", "Abstract", "Nature", "Minimalist"]
  },
  {
    title: "Browse by Color",
    description: "Find wallpapers by your favorite colors",
    icon: Droplets,
    href: "/categories",
    color: "bg-indigo-500",
    popular: ["Dark", "Light", "Colorful", "Monochrome"]
  },
  {
    title: "Browse by Resolution",
    description: "Choose the perfect quality for your screen",
    icon: Hammer,
    href: "/categories",
    color: "bg-green-500",
    popular: ["4K", "HD", "Mobile", "Ultrawide"]
  }
];

export default async function Home() {
  const [wallpapers, featuredWallpapers, trendingWallpapers] = await Promise.all([
    getWallpapers(),
    getFeaturedWallpapers(),
    getTrendingWallpapers()
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="container-mobile relative">
          <div className="py-12 md:py-20 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Premium Digital
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Wallpapers
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Download stunning wallpapers for your desktop, mobile, and tablet.
              Discover high-quality designs in 4K, HD, and mobile-optimized resolutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/categories"
                className="touch-target bg-white text-blue-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center focus-ring"
              >
                Browse Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/search"
                className="touch-target border-2 border-white text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors focus-ring"
              >
                Search Wallpapers
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold">10K+</div>
                <div className="text-sm opacity-75">Wallpapers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">4K</div>
                <div className="text-sm opacity-75">Quality</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">Free</div>
                <div className="text-sm opacity-75">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Wallpapers */}
      {featuredWallpapers.length > 0 && (
        <section className="container-mobile py-12 md:py-16">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Featured Wallpapers
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hand-picked premium wallpapers for the best experience
            </p>
          </div>

          <div className="wallpaper-grid">
            {featuredWallpapers.map((wallpaper, index) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                priority={index < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Navigation */}
      <section className="bg-white dark:bg-gray-800 py-12 md:py-16">
        <div className="container-mobile">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find the perfect wallpaper for your device and style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="group bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden focus-ring"
                >
                  <div className={`${link.color} p-4 md:p-6 text-center`}>
                    <IconComponent className="h-8 md:h-12 w-8 md:w-12 text-white mx-auto mb-2 md:mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      {link.title}
                    </h3>
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                      {link.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Popular:</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {link.popular.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:underline flex items-center">
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Wallpapers */}
      {trendingWallpapers.length > 0 && (
        <section className="container-mobile py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Trending Now
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Most popular wallpapers this week
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden md:inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline focus-ring rounded px-2 py-1"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="wallpaper-grid">
            {trendingWallpapers.map((wallpaper, index) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                priority={index < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Wallpapers */}
      <section className="bg-white dark:bg-gray-800 py-12 md:py-16">
        <div className="container-mobile">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Latest Wallpapers
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Discover our newest additions to the collection
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden md:inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline focus-ring rounded px-2 py-1"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {wallpapers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No wallpapers available yet
              </p>
              <p className="text-gray-400 dark:text-gray-500">
                Check back soon for amazing new wallpapers!
              </p>
            </div>
          ) : (
            <div className="wallpaper-grid">
              {wallpapers.map((wallpaper, index) => (
                <WallpaperCard
                  key={wallpaper.id}
                  wallpaper={wallpaper}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/collections"
              className="touch-target inline-flex items-center bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus-ring"
            >
              View All Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-12 md:py-16">
        <div className="container-mobile text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Perfect Wallpaper
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Browse our extensive collection of high-quality wallpapers for desktop, mobile, and tablet.
              All wallpapers are available in multiple resolutions for the perfect fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="touch-target bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus-ring"
              >
                Search Wallpapers
              </Link>
              <Link
                href="/collections"
                className="touch-target border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors focus-ring"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
