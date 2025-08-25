import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { ArrowLeft, Droplets, Lightbulb, Eye } from "lucide-react";

const colorCategories = {
  "dark": {
    title: "Dark Wallpapers",
    description: "Elegant dark wallpapers perfect for OLED displays, dark mode enthusiasts, and reducing eye strain. Sophisticated blacks, deep grays, and rich dark tones.",
    keywords: ["dark wallpaper", "black wallpaper", "OLED wallpaper", "dark mode wallpaper"],
    tips: [
      "Dark wallpapers save battery on OLED displays",
      "Perfect for reducing eye strain in low-light environments",
      "Complement dark mode interfaces beautifully",
      "Create sophisticated, professional desktop aesthetics"
    ],
    colorClass: "bg-gray-900"
  },
  "light": {
    title: "Light Wallpapers",
    description: "Clean, bright wallpapers featuring whites, pastels, and light tones. Perfect for light mode interfaces and creating fresh, airy digital environments.",
    keywords: ["light wallpaper", "white wallpaper", "bright wallpaper", "pastel wallpaper"],
    tips: [
      "Light wallpapers work well with light mode interfaces",
      "Bright colors can energize and inspire productivity",
      "Perfect for well-lit workspaces and daytime use",
      "Clean aesthetics complement modern UI designs"
    ],
    colorClass: "bg-white border border-gray-200"
  },
  "colorful": {
    title: "Colorful Wallpapers",
    description: "Vibrant, energetic wallpapers featuring bold colors, rainbow hues, and eye-catching combinations. Perfect for adding personality and energy to your devices.",
    keywords: ["colorful wallpaper", "vibrant wallpaper", "rainbow wallpaper", "bright wallpaper"],
    tips: [
      "Colorful wallpapers showcase display color accuracy",
      "Vibrant colors can boost mood and creativity",
      "Perfect for personal devices and creative workspaces",
      "Consider your app icon colors when choosing backgrounds"
    ],
    colorClass: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"
  },
  "monochrome": {
    title: "Monochrome Wallpapers",
    description: "Classic black and white wallpapers with timeless appeal. Elegant grayscale designs that work with any interface theme or color scheme.",
    keywords: ["monochrome wallpaper", "black and white wallpaper", "grayscale wallpaper", "classic wallpaper"],
    tips: [
      "Monochrome wallpapers are timeless and versatile",
      "Work perfectly with any app icon color scheme",
      "Great for professional and minimalist aesthetics",
      "Black and white photography can be particularly striking"
    ],
    colorClass: "bg-gradient-to-r from-black to-white"
  }
};

async function getWallpapersByColor(color: string): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .contains('tags', [color])
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
  const category = colorCategories[slug as keyof typeof colorCategories];
  
  if (!category) {
    return {
      title: "Color Not Found",
      description: "The requested color category was not found."
    };
  }

  return {
    title: `${category.title} | Premium Collection | Wallpaper Gallery`,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      type: "website",
    },
  };
}

export default async function ColorCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = colorCategories[slug as keyof typeof colorCategories];

  if (!category) {
    notFound();
  }

  const wallpapers = await getWallpapersByColor(slug);

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
              By Color
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
            <div className="flex items-center mr-4">
              <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div className={`w-8 h-8 rounded-full ${category.colorClass} mr-3`}></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.title}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl">
            {category.description}
          </p>
        </div>
      </header>

      {/* Color Psychology Section */}
      <section className="bg-indigo-50 dark:bg-indigo-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Color Psychology & Design Tips
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.tips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
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
              No wallpapers available in this color yet. Check back soon!
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
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
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
