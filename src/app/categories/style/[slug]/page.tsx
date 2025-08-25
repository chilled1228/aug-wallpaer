import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { ArrowLeft, Palette, Lightbulb, Sparkles } from "lucide-react";

const styleCategories = {
  "abstract": {
    title: "Abstract Wallpapers",
    description: "Artistic and creative abstract designs perfect for modern digital displays. Bold colors, unique patterns, and creative compositions that make stunning desktop and mobile backgrounds.",
    keywords: ["abstract wallpaper", "artistic wallpaper", "creative wallpaper", "modern abstract backgrounds"],
    tips: [
      "Abstract patterns work great as desktop backgrounds",
      "Bold colors can energize your workspace",
      "Geometric abstracts complement modern UI designs",
      "Consider your screen's color profile when choosing abstracts"
    ]
  },
  "nature": {
    title: "Nature Wallpapers",
    description: "Stunning natural landscapes, wildlife, and botanical imagery. Bring the beauty of the outdoors to your digital devices with breathtaking nature photography.",
    keywords: ["nature wallpaper", "landscape wallpaper", "wildlife wallpaper", "botanical wallpaper"],
    tips: [
      "Landscape wallpapers work beautifully on widescreen displays",
      "Nature scenes can reduce digital eye strain",
      "Seasonal nature wallpapers keep your desktop fresh",
      "High-resolution nature photos showcase display quality"
    ]
  },
  "minimalist": {
    title: "Minimalist Wallpapers",
    description: "Clean, simple designs that embrace the beauty of simplicity. Perfect for distraction-free workspaces and modern aesthetic preferences.",
    keywords: ["minimalist wallpaper", "simple wallpaper", "clean wallpaper design", "minimal backgrounds"],
    tips: [
      "Minimalist designs reduce desktop clutter",
      "Neutral colors work well with any icon theme",
      "Simple patterns don't distract from productivity",
      "Clean designs age well and remain timeless"
    ]
  },
  "gaming": {
    title: "Gaming Wallpapers",
    description: "Epic gaming-themed wallpapers featuring popular games, characters, and gaming aesthetics. Perfect for gamers who want to showcase their passion.",
    keywords: ["gaming wallpaper", "game wallpaper", "esports wallpaper", "gaming backgrounds"],
    tips: [
      "Gaming wallpapers often support ultrawide formats",
      "Dark themes work well for gaming setups",
      "Animated elements can enhance the gaming experience",
      "Match wallpapers to your favorite games or genres"
    ]
  },
  "space": {
    title: "Space Wallpapers",
    description: "Explore the cosmos with stunning space and astronomy wallpapers. Featuring galaxies, nebulae, planets, and celestial phenomena in breathtaking detail.",
    keywords: ["space wallpaper", "astronomy wallpaper", "galaxy wallpaper", "cosmic backgrounds"],
    tips: [
      "Space wallpapers showcase display contrast beautifully",
      "Dark space themes are easy on the eyes",
      "Nebula colors can be vibrant and inspiring",
      "Planetary wallpapers work great on any device"
    ]
  }
};

async function getWallpapersByStyle(style: string): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .contains('tags', [style])
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
  const category = styleCategories[slug as keyof typeof styleCategories];
  
  if (!category) {
    return {
      title: "Style Not Found",
      description: "The requested style category was not found."
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

export default async function StyleCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = styleCategories[slug as keyof typeof styleCategories];

  if (!category) {
    notFound();
  }

  const wallpapers = await getWallpapersByStyle(slug);

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
              By Style
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
            <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.title}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl">
            {category.description}
          </p>
        </div>
      </header>

      {/* Design Tips Section */}
      <section className="bg-purple-50 dark:bg-purple-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Styling Tips for {category.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.tips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
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
              No wallpapers available in this style yet. Check back soon!
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
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
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
