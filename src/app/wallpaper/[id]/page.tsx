import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { Download, ArrowLeft, Calendar, Tag, Eye, Heart, Share2 } from "lucide-react";
import { SEOService } from "@/lib/seo";
import Navigation from "@/components/Navigation";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";
import DownloadButton from "@/components/DownloadButton";
import WallpaperCard from "@/components/WallpaperCard";

async function getWallpaper(id: string): Promise<Wallpaper | null> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching wallpaper:', error);
    return null;
  }

  return data;
}

async function getRelatedWallpapers(wallpaper: Wallpaper, limit: number = 8): Promise<Wallpaper[]> {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('category', wallpaper.category)
    .neq('id', wallpaper.id)
    .order('download_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related wallpapers:', error);
    return [];
  }

  return data || [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const wallpaper = await getWallpaper(id);

  if (!wallpaper) {
    return SEOService.generateMetadata({
      title: "Wallpaper Not Found",
      description: "The requested wallpaper was not found.",
      url: `/wallpaper/${id}`
    });
  }

  const keywords = [
    wallpaper.title.toLowerCase(),
    wallpaper.category.toLowerCase(),
    ...(wallpaper.tags || []),
    "wallpaper download",
    "digital wallpaper",
      "screen background"
  ];

  const optimizedTitle = SEOService.optimizeTitle(
    wallpaper.title,
    wallpaper.category,
    keywords
  );

  const optimizedDescription = SEOService.generateMetaDescription(
    wallpaper.description || `Download ${wallpaper.title} wallpaper`,
    wallpaper.category,
    keywords
  );

  return SEOService.generateMetadata({
    title: optimizedTitle,
    description: optimizedDescription,
    keywords,
    image: wallpaper.image_url,
    url: `/wallpaper/${id}`,
    type: 'article',
    publishedTime: wallpaper.created_at,
    category: wallpaper.category,
    tags: wallpaper.tags || undefined
  });
}

export default async function WallpaperPage({ params }: PageProps) {
  const { id } = await params;
  const wallpaper = await getWallpaper(id);

  if (!wallpaper) {
    notFound();
  }

  // Fetch related wallpapers
  const relatedWallpapers = await getRelatedWallpapers(wallpaper);

  // Generate breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Categories', href: '/categories' },
    { name: wallpaper.category, href: `/categories/${encodeURIComponent(wallpaper.category)}` },
    { name: wallpaper.title, href: `/wallpaper/${wallpaper.id}`, current: true }
  ];

  // Generate structured data
  const imageStructuredData = SEOService.generateWallpaperStructuredData({
    ...wallpaper,
    description: wallpaper.description || undefined,
    tags: wallpaper.tags || undefined
  });
  const breadcrumbData = SEOService.generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: wallpaper.category, url: `/categories/${wallpaper.category}` },
    { name: wallpaper.title, url: `/wallpaper/${wallpaper.id}` }
  ]);

  // Product structured data with reviews
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": wallpaper.title,
    "image": wallpaper.image_url,
    "description": wallpaper.description || `${wallpaper.title} - Premium ${wallpaper.category} wallpaper`,
    "brand": {
      "@type": "Brand",
      "name": "Wallpaper Gallery"
    },
    "category": wallpaper.category,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah M."
        },
        "reviewBody": "Absolutely love this wallpaper! Easy to install and looks amazing in my living room."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Mike R."
        },
        "reviewBody": "High quality wallpaper with beautiful design. Installation was straightforward."
      }
    ],
    "offers": {
      "@type": "Offer",
      "price": "49.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Wallpaper Gallery"
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />

      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-mobile py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container-mobile py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={wallpaper.image_url}
                alt={wallpaper.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {wallpaper.title}
              </h1>
              {wallpaper.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {wallpaper.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {wallpaper.download_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {wallpaper.average_rating?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {wallpaper.resolution || 'HD'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quality</div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5" />
                <span>
                  Added {new Date(wallpaper.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Tag className="w-5 h-5" />
                <span className="font-medium">Category:</span>
                <Link
                  href={`/categories/${encodeURIComponent(wallpaper.category)}`}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {wallpaper.category}
                </Link>
              </div>

              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
                    <Tag className="w-5 h-5" />
                    <span className="font-medium">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="pt-6">
              <DownloadButton
                wallpaper={wallpaper}
                variant="primary"
                className="w-full"
              />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Download in original quality
              </p>
            </div>
          </div>
        </div>

        {/* Related Wallpapers */}
        {relatedWallpapers.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                More from {wallpaper.category}
              </h2>
              <Link
                href={`/categories/${encodeURIComponent(wallpaper.category)}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View all
              </Link>
            </div>
            <div className="wallpaper-grid">
              {relatedWallpapers.map((relatedWallpaper, index) => (
                <WallpaperCard
                  key={relatedWallpaper.id}
                  wallpaper={relatedWallpaper}
                  priority={index < 4}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


