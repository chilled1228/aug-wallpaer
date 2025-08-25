import Link from "next/link";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { Home as HomeIcon, Palette, Droplets, Hammer, Star, ArrowRight, TrendingUp, Zap, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";

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
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <header className="hero-wallpaper text-white relative z-10">
        <div className="container-mobile relative z-20">
          <div className="py-20 md:py-32 text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-brand-soft text-brand rounded border-2 border-white text-sm font-semibold mb-6">
                🎨 Premium Wallpaper Collection
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Download Stunning
              <span className="block text-brand-soft">
                Wallpapers
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
              Discover thousands of high-quality wallpapers for desktop, mobile, and tablet. 
              From minimalist designs to stunning photography - find your perfect backdrop.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/categories"
                className="btn-download inline-flex items-center justify-center text-lg"
              >
                <Download className="mr-3 h-5 w-5" />
                Start Downloading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/search"
                className="btn-secondary inline-flex items-center justify-center text-lg border-white text-white hover:bg-white hover:text-brand"
              >
                Search Collection
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="stat-number text-white">25K+</div>
                <div className="stat-label text-white/70">Wallpapers</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-white">4K</div>
                <div className="stat-label text-white/70">Ultra HD</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-white">100%</div>
                <div className="stat-label text-white/70">Free</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Wallpapers */}
      {featuredWallpapers.length > 0 && (
        <section className="container-mobile py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand">
                Featured Collection
              </h2>
            </div>
            <p className="text-lg text-brand-accent max-w-2xl mx-auto">
              Handpicked wallpapers that showcase the finest in digital artistry and photography
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
      <section className="section-alt py-16 md:py-24">
        <div className="container-mobile">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand mb-6">
              Browse by Category
            </h2>
            <p className="text-lg text-brand-accent max-w-2xl mx-auto">
              Discover wallpapers organized by your preferences and device type
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="card-wallpaper group hover:shadow-xl transition-all"
                >
                  <div className="bg-brand-primary p-8 text-center border-b-4 border-brand-accent">
                    <IconComponent className="h-12 w-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">
                      {link.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-brand-text mb-6 leading-relaxed">
                      {link.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {link.popular.map((item, idx) => (
                        <span
                          key={idx}
                          className="tag-category"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="text-brand font-semibold group-hover:text-brand-accent transition-colors flex items-center">
                      Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
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
        <section className="container-mobile py-16 md:py-24">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-brand-accent rounded border-2 border-brand-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand">
                  Trending This Week
                </h2>
              </div>
              <p className="text-lg text-brand-accent">
                The most downloaded wallpapers in the past 7 days
              </p>
            </div>
            <Link
              href="/collections"
              className="btn-soft hidden md:inline-flex items-center"
            >
              View All Trending
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
      <section className="section-alt py-16 md:py-24">
        <div className="container-mobile">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-brand rounded border-2 border-brand-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand">
                  Latest Uploads
                </h2>
              </div>
              <p className="text-lg text-brand-accent">
                Fresh wallpapers added to our collection
              </p>
            </div>
            <Link
              href="/collections"
              className="btn-soft hidden md:inline-flex items-center"
            >
              Browse All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {wallpapers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-brand-soft rounded border-4 border-brand-accent flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-brand mb-4">
                Coming Soon
              </h3>
              <p className="text-brand-accent text-lg mb-6 max-w-md mx-auto">
                We're curating amazing wallpapers for you. Check back soon!
              </p>
              <Link href="/search" className="btn-primary">
                Explore Categories
              </Link>
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

          <div className="text-center mt-12 md:mt-16">
            <Link
              href="/collections"
              className="btn-primary inline-flex items-center text-lg"
            >
              Explore All Collections
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-brand-primary border-t-4 border-brand-accent">
        <div className="container-mobile text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Device?
            </h2>
            <p className="text-xl text-brand-soft mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have already discovered their perfect wallpaper. 
              Start downloading high-quality designs for free today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/search"
                className="btn-download inline-flex items-center justify-center text-lg bg-white text-brand hover:bg-brand-surface"
              >
                <Download className="mr-3 h-5 w-5" />
                Start Downloading Now
              </Link>
              <Link
                href="/categories"
                className="btn-secondary inline-flex items-center justify-center text-lg border-white text-white hover:bg-white hover:text-brand"
              >
                Browse Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-brand-soft">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded border border-white/20">
                <Star className="w-5 h-5" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded border border-white/20">
                <Download className="w-5 h-5" />
                <span>Instant Download</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded border border-white/20">
                <Zap className="w-5 h-5" />
                <span>100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
