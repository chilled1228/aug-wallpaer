import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { ArrowLeft, Monitor, Lightbulb, Zap } from "lucide-react";

const resolutionCategories = {
  "4k": {
    title: "4K Wallpapers",
    description: "Ultra high-definition 4K wallpapers (3840x2160) for the sharpest, most detailed viewing experience. Perfect for modern 4K displays and monitors.",
    keywords: ["4K wallpaper", "ultra HD wallpaper", "3840x2160 wallpaper", "high resolution wallpaper"],
    tips: [
      "4K provides 4x the detail of standard HD wallpapers",
      "Perfect for large monitors and high-DPI displays",
      "File sizes are larger but quality is unmatched",
      "Future-proof your wallpaper collection with 4K"
    ]
  },
  "hd": {
    title: "HD Wallpapers",
    description: "High-definition 1080p wallpapers (1920x1080) offering excellent quality for standard displays. The perfect balance of quality and file size.",
    keywords: ["HD wallpaper", "1080p wallpaper", "high definition wallpaper", "full HD wallpaper"],
    tips: [
      "1080p is the standard for most modern displays",
      "Smaller file sizes for faster downloads",
      "Compatible with virtually all devices",
      "Great balance between quality and performance"
    ]
  },
  "8k": {
    title: "8K Wallpapers",
    description: "Cutting-edge 8K wallpapers (7680x4320) for the ultimate in image quality. Designed for the latest 8K displays and future technology.",
    keywords: ["8K wallpaper", "7680x4320 wallpaper", "ultra high definition", "8K resolution"],
    tips: [
      "8K offers the highest available resolution",
      "Perfect for professional displays and future devices",
      "Extremely large file sizes require good internet",
      "Can be downscaled for any lower resolution display"
    ]
  },
  "retina": {
    title: "Retina Wallpapers",
    description: "High-DPI wallpapers optimized for Retina displays and other high pixel density screens. Crisp, sharp images that look perfect on Apple devices.",
    keywords: ["retina wallpaper", "high DPI wallpaper", "Apple retina wallpaper", "MacBook wallpaper"],
    tips: [
      "Optimized for Apple Retina displays",
      "Higher pixel density for sharper images",
      "Perfect for MacBooks, iMacs, and iPads",
      "Also great for other high-DPI displays"
    ]
  }
};

async function getWallpapersByResolution(resolution: string): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .contains('tags', [resolution])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wallpapers:', error);
    return [];
  }

  return data || [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = resolutionCategories[slug as keyof typeof resolutionCategories];
  
  if (!category) {
    return {
      title: "Resolution Not Found",
      description: "The requested resolution category was not found."
    };
  }

  return {
    title: `${category.title} | Ultra HD Downloads | Wallpaper Gallery`,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      type: "website",
    },
  };
}

export default async function ResolutionCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = resolutionCategories[slug as keyof typeof resolutionCategories];

  if (!category) {
    notFound();
  }

  const wallpapers = await getWallpapersByResolution(slug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
              Categories
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
              By Resolution
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white">{category.title}</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link
              href="/categories"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Link>
          </div>
          
          <div className="flex items-center mb-4">
            <Monitor className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.title}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl">
            {category.description}
          </p>
        </div>
      </header>

      {/* Quality Tips Section */}
      <section className="bg-green-50 dark:bg-green-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Quality Tips for {category.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.tips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallpapers Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Featured {category.title}
        </h2>
        
        {wallpapers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No wallpapers available in this resolution yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wallpapers.map((wallpaper) => (
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
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
      </main>
    </div>
  );
}
