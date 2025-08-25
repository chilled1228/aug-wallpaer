import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { ArrowLeft, Monitor, Lightbulb, Download } from "lucide-react";

const deviceCategories = {
  "desktop": {
    title: "Desktop Wallpapers",
    description: "High-resolution wallpapers perfect for desktop computers and laptops. Featuring stunning 4K and HD designs optimized for widescreen displays.",
    keywords: ["desktop wallpaper", "computer wallpaper", "4K desktop wallpaper", "HD desktop backgrounds"],
    tips: [
      "4K wallpapers provide the sharpest detail on high-resolution monitors",
      "Consider your monitor's aspect ratio when choosing wallpapers",
      "Dark wallpapers can reduce eye strain during long work sessions",
      "Dual monitor setups work best with panoramic or matching wallpapers"
    ]
  },
  "mobile": {
    title: "Mobile Wallpapers",
    description: "Stunning wallpapers designed specifically for smartphones. Perfect for iPhone, Android, and other mobile devices with optimized portrait orientations.",
    keywords: ["mobile wallpaper", "phone wallpaper", "iPhone wallpaper", "Android wallpaper"],
    tips: [
      "Portrait orientation works best for most mobile devices",
      "AMOLED displays benefit from dark wallpapers to save battery",
      "Consider how wallpapers look with your app icons",
      "High contrast wallpapers improve text readability"
    ]
  },
  "tablet": {
    title: "Tablet Wallpapers",
    description: "Beautiful wallpapers optimized for tablets and iPad devices. Designed to look stunning on both portrait and landscape orientations.",
    keywords: ["tablet wallpaper", "iPad wallpaper", "Android tablet wallpaper", "tablet backgrounds"],
    tips: [
      "Tablet wallpapers should work in both orientations",
      "Consider the device's bezel size when choosing designs",
      "Retina displays benefit from high-resolution images",
      "Avoid busy patterns that interfere with app visibility"
    ]
  },
  "dual-monitor": {
    title: "Dual Monitor Wallpapers",
    description: "Ultra-wide wallpapers designed for dual monitor setups. Seamless panoramic images that span across multiple displays beautifully.",
    keywords: ["dual monitor wallpaper", "ultrawide wallpaper", "panoramic wallpaper", "multi-monitor backgrounds"],
    tips: [
      "Ensure wallpapers match your combined resolution",
      "Panoramic landscapes work exceptionally well",
      "Consider the gap between monitors in your setup",
      "Test wallpapers with your specific monitor arrangement"
    ]
  },
  "ultrawide": {
    title: "Ultrawide Wallpapers",
    description: "Stunning wallpapers designed for ultrawide monitors. Perfect for 21:9 and 32:9 aspect ratios with immersive panoramic views.",
    keywords: ["ultrawide wallpaper", "21:9 wallpaper", "32:9 wallpaper", "widescreen wallpaper"],
    tips: [
      "21:9 and 32:9 aspect ratios require specific wallpapers",
      "Panoramic photography works beautifully on ultrawide displays",
      "Gaming wallpapers often support ultrawide formats",
      "Check your exact resolution before downloading"
    ]
  }
};

async function getWallpapersByDevice(device: string): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .contains('tags', [device])
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
  const category = deviceCategories[slug as keyof typeof deviceCategories];
  
  if (!category) {
    return {
      title: "Device Not Found",
      description: "The requested device category was not found."
    };
  }

  return {
    title: `${category.title} | HD & 4K Downloads | Wallpaper Gallery`,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      type: "website",
    },
  };
}

export default async function DeviceCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = deviceCategories[slug as keyof typeof deviceCategories];

  if (!category) {
    notFound();
  }

  const wallpapers = await getWallpapersByDevice(slug);

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
              By Device
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
            <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.title}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl">
            {category.description}
          </p>
        </div>
      </header>

      {/* Tips Section */}
      <section className="bg-blue-50 dark:bg-blue-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Tips for {category.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.tips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
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
              No wallpapers available in this category yet. Check back soon!
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
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
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
