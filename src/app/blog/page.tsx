import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata = {
  title: "Wallpaper Blog | Digital Design Tips, Trends & Device Optimization",
  description: "Discover expert tips for digital wallpapers, latest design trends, device optimization guides, and inspiration for personalizing your screens.",
  keywords: ["wallpaper blog", "digital wallpaper tips", "desktop customization", "mobile wallpaper trends", "screen personalization"],
};

const blogPosts = [
  {
    id: "best-4k-wallpapers-2025",
    title: "Best 4K Wallpapers for 2025: Ultra HD Collection",
    excerpt: "Discover the most stunning 4K wallpapers of 2025. From nature photography to abstract art, find ultra high-definition backgrounds for your devices.",
    category: "Collections",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    slug: "best-4k-wallpapers-2025"
  },
  {
    id: "mobile-wallpaper-optimization-guide",
    title: "Mobile Wallpaper Optimization: Perfect Fit for Any Phone",
    excerpt: "Learn how to choose and optimize wallpapers for mobile devices. Tips for iPhone, Android, and different screen sizes.",
    category: "Device Tips",
    readTime: "6 min read",
    publishDate: "2024-01-12",
    slug: "mobile-wallpaper-optimization-guide"
  },
  {
    id: "dual-monitor-wallpaper-setup",
    title: "Dual Monitor Wallpaper Setup: Complete Guide",
    excerpt: "Master the art of setting up wallpapers across multiple monitors. Create seamless panoramic backgrounds and perfect alignment.",
    category: "Device Tips",
    readTime: "10 min read",
    publishDate: "2024-01-10",
    slug: "dual-monitor-wallpaper-setup"
  },
  {
    id: "dark-mode-wallpapers-collection",
    title: "Best Dark Mode Wallpapers for OLED Displays",
    excerpt: "Explore stunning dark wallpapers perfect for OLED screens. Save battery life while enjoying beautiful, eye-friendly backgrounds.",
    category: "Collections",
    readTime: "12 min read",
    publishDate: "2024-01-08",
    slug: "dark-mode-wallpapers-collection"
  },
  {
    id: "trending-wallpaper-styles-2025",
    title: "Trending Digital Wallpaper Styles for 2025",
    excerpt: "Stay ahead of digital design trends with our guide to the hottest wallpaper styles for 2025. From minimalist to gaming aesthetics.",
    category: "Trends",
    readTime: "9 min read",
    publishDate: "2024-01-05",
    slug: "trending-wallpaper-styles-2025"
  },
  {
    id: "gaming-wallpaper-collection",
    title: "Epic Gaming Wallpapers: Level Up Your Desktop",
    excerpt: "Discover amazing gaming wallpapers featuring popular games, characters, and esports themes. Perfect for gamers and enthusiasts.",
    category: "Collections",
    readTime: "11 min read",
    publishDate: "2024-01-03",
    slug: "gaming-wallpaper-collection"
  }
];

const categories = ["All", "Collections", "Device Tips", "Trends"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Wallpaper Blog
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Expert tips, device optimization guides, and design inspiration for your digital wallpaper collection
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  category === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              Featured
            </span>
            <h2 className="text-3xl font-bold mb-4">
              {blogPosts[0].title}
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              {blogPosts[0].excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-blue-100">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(blogPosts[0].publishDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {blogPosts[0].readTime}
                </span>
              </div>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="inline-flex items-center bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.publishDate).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Get the latest wallpaper collections, design trends, and device optimization tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
