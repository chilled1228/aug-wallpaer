import Link from "next/link";
import { Home, Palette, Droplets, Hammer, ArrowRight, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Wallpaper Categories | Browse by Device, Style, Color & Resolution",
  description: "Explore our comprehensive digital wallpaper collection organized by device type, design style, color palette, and resolution. Find the perfect wallpaper for your screen.",
  keywords: ["wallpaper categories", "desktop wallpapers", "mobile wallpapers", "wallpaper styles", "4K wallpapers", "HD wallpapers"],
};

const categories = {
  byDevice: {
    title: "By Device",
    description: "Find wallpapers optimized for your specific device",
    icon: Home,
    items: [
      { name: "Desktop Wallpapers", slug: "desktop", description: "High-resolution wallpapers for computers and laptops" },
      { name: "Mobile Wallpapers", slug: "mobile", description: "Perfect wallpapers for smartphones and mobile devices" },
      { name: "Tablet Wallpapers", slug: "tablet", description: "Optimized wallpapers for iPad and Android tablets" },
      { name: "Dual Monitor Wallpapers", slug: "dual-monitor", description: "Ultra-wide wallpapers for dual monitor setups" },
      { name: "Ultrawide Wallpapers", slug: "ultrawide", description: "Stunning wallpapers for ultrawide monitors" },
    ]
  },
  byStyle: {
    title: "By Style",
    description: "Discover wallpapers that match your design aesthetic",
    icon: Palette,
    items: [
      { name: "Abstract Wallpapers", slug: "abstract", description: "Artistic and creative abstract designs" },
      { name: "Nature Wallpapers", slug: "nature", description: "Beautiful landscapes and natural scenes" },
      { name: "Minimalist Wallpapers", slug: "minimalist", description: "Clean, simple designs for modern aesthetics" },
      { name: "Gaming Wallpapers", slug: "gaming", description: "Epic gaming-themed wallpapers and artwork" },
      { name: "Space Wallpapers", slug: "space", description: "Stunning cosmic and astronomical imagery" },
    ]
  },
  byColor: {
    title: "By Color",
    description: "Browse wallpapers by your preferred color palette",
    icon: Droplets,
    items: [
      { name: "Dark Wallpapers", slug: "dark", description: "Perfect for dark mode and OLED displays" },
      { name: "Light Wallpapers", slug: "light", description: "Bright and clean wallpapers for light themes" },
      { name: "Colorful Wallpapers", slug: "colorful", description: "Vibrant and eye-catching colorful designs" },
      { name: "Monochrome Wallpapers", slug: "monochrome", description: "Classic black and white wallpapers" },
    ]
  },
  byResolution: {
    title: "By Resolution",
    description: "Choose wallpapers based on quality and resolution",
    icon: Hammer,
    items: [
      { name: "4K Wallpapers", slug: "4k", description: "Ultra high-definition 4K wallpapers for crisp displays" },
      { name: "HD Wallpapers", slug: "hd", description: "High-definition 1080p wallpapers for standard screens" },
      { name: "8K Wallpapers", slug: "8k", description: "Cutting-edge 8K resolution for the latest displays" },
      { name: "Retina Wallpapers", slug: "retina", description: "High-DPI wallpapers optimized for Retina displays" },
    ]
  }
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container-mobile py-12 md:py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Wallpaper Categories
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
              Browse our extensive collection of digital wallpapers organized by device, style, color, and resolution
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile py-8 md:py-12">
        <div className="space-y-12 md:space-y-16">
          {Object.entries(categories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <section key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-6 md:mb-8">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {category.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/categories/${key.replace('by', '').toLowerCase()}/${item.slug}`}
                        className="group block p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 focus-ring"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                          <span>Browse Collection</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 md:mt-16 text-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Use our advanced search to find wallpapers by specific keywords, colors, or styles.
          </p>
          <Link
            href="/search"
            className="touch-target inline-flex items-center bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus-ring"
          >
            Advanced Search
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
