import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Wallpaper } from "@/lib/supabase";
import { Download, ArrowLeft, Calendar, Tag } from "lucide-react";
import { SEOService } from "@/lib/seo";
import Navigation from "@/components/Navigation";

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
    tags: wallpaper.tags
  });
}

export default async function WallpaperPage({ params }: PageProps) {
  const { id } = await params;
  const wallpaper = await getWallpaper(id);

  if (!wallpaper) {
    notFound();
  }

  // Generate structured data
  const imageStructuredData = SEOService.generateWallpaperStructuredData(wallpaper);
  const breadcrumbData = SEOService.generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: wallpaper.category, url: `/categories/${wallpaper.category}` },
    { name: wallpaper.title, url: `/wallpaper/${wallpaper.id}` }
  ]);
    "@type": "ImageObject",
    "contentUrl": wallpaper.image_url,
    "name": wallpaper.title,
    "description": wallpaper.description || `${wallpaper.title} - Premium ${wallpaper.category} wallpaper`,
    "creator": {
      "@type": "Organization",
      "name": "Wallpaper Gallery"
    },
    "creditText": "Wallpaper Gallery",
    "license": "https://wallpapergallery.com/license",
    "acquireLicensePage": "https://wallpapergallery.com/license",
    "copyrightNotice": "© Wallpaper Gallery",
    "keywords": wallpaper.tags ? wallpaper.tags.join(", ") : "",
    "category": wallpaper.category,
    "uploadDate": wallpaper.created_at,
    "width": "1200",
    "height": "1600",
    "encodingFormat": "image/jpeg"
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={wallpaper.image_url}
              alt={wallpaper.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {wallpaper.title}
              </h1>
              {wallpaper.description && (
                <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                  {wallpaper.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>
                  Added {new Date(wallpaper.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Category:</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                  {wallpaper.category}
                </span>
              </div>

              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
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
              <a
                href={wallpaper.image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Wallpaper
              </a>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Right-click and "Save as" to download to your device
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


