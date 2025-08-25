import { Metadata } from 'next';
import { config } from './config';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export class SEOService {
  // Generate comprehensive metadata for pages
  static generateMetadata(data: SEOData): Metadata {
    const {
      title,
      description,
      keywords = [],
      image,
      url,
      type = 'website',
      publishedTime,
      modifiedTime,
      author,
      category,
      tags = []
    } = data;

    const fullTitle = title.includes(config.app.name) 
      ? title 
      : `${title} | ${config.app.name}`;

    const fullUrl = url ? `${config.app.url}${url}` : config.app.url;
    const imageUrl = image ? (image.startsWith('http') ? image : `${config.app.url}${image}`) : `${config.app.url}/og-image.jpg`;

    return {
      title: fullTitle,
      description,
      keywords: [...keywords, ...config.seo.keywords].join(', '),
      authors: author ? [{ name: author }] : [{ name: config.app.name }],
      creator: config.app.name,
      publisher: config.app.name,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: fullTitle,
        description,
        url: fullUrl,
        siteName: config.app.name,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        locale: 'en_US',
        type,
        ...(publishedTime && { publishedTime }),
        ...(modifiedTime && { modifiedTime }),
        ...(category && { section: category }),
        ...(tags.length > 0 && { tags }),
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [imageUrl],
        creator: config.seo.twitter.creator,
        site: config.seo.twitter.site,
      },
      alternates: {
        canonical: fullUrl,
      },
      category,
    };
  }

  // Generate structured data for wallpapers
  static generateWallpaperStructuredData(wallpaper: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    category: string;
    tags?: string[];
    created_at: string;
    download_count?: number;
    average_rating?: number;
  }) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      '@id': `${config.app.url}/wallpaper/${wallpaper.id}`,
      name: wallpaper.title,
      description: wallpaper.description || `${wallpaper.title} - High-quality wallpaper`,
      contentUrl: wallpaper.image_url,
      thumbnailUrl: wallpaper.image_url,
      url: `${config.app.url}/wallpaper/${wallpaper.id}`,
      dateCreated: wallpaper.created_at,
      datePublished: wallpaper.created_at,
      creator: {
        '@type': 'Organization',
        name: config.app.name,
        url: config.app.url,
      },
      publisher: {
        '@type': 'Organization',
        name: config.app.name,
        url: config.app.url,
        logo: {
          '@type': 'ImageObject',
          url: `${config.app.url}/logo.png`,
        },
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
      acquireLicensePage: `${config.app.url}/license`,
      creditText: config.app.name,
      copyrightNotice: `© ${new Date().getFullYear()} ${config.app.name}`,
      keywords: wallpaper.tags?.join(', ') || wallpaper.category,
      genre: wallpaper.category,
      ...(wallpaper.download_count && {
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/DownloadAction',
          userInteractionCount: wallpaper.download_count,
        },
      }),
      ...(wallpaper.average_rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: wallpaper.average_rating,
          ratingCount: 1, // Would need actual rating count from database
          bestRating: 5,
          worstRating: 1,
        },
      }),
    };

    return structuredData;
  }

  // Generate breadcrumb structured data
  static generateBreadcrumbStructuredData(breadcrumbs: Array<{
    name: string;
    url: string;
  }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${config.app.url}${crumb.url}`,
      })),
    };
  }

  // Generate website structured data
  static generateWebsiteStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.app.name,
      description: config.app.description,
      url: config.app.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${config.app.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: config.app.name,
        url: config.app.url,
        logo: {
          '@type': 'ImageObject',
          url: `${config.app.url}/logo.png`,
        },
        sameAs: [
          'https://facebook.com/wallpapergallery',
          'https://instagram.com/wallpapergallery',
          'https://pinterest.com/wallpapergallery',
        ],
      },
    };
  }

  // Generate collection/category structured data
  static generateCollectionStructuredData(collection: {
    name: string;
    description: string;
    url: string;
    wallpapers: Array<{
      id: string;
      title: string;
      image_url: string;
    }>;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Collection',
      name: collection.name,
      description: collection.description,
      url: `${config.app.url}${collection.url}`,
      hasPart: collection.wallpapers.map(wallpaper => ({
        '@type': 'ImageObject',
        '@id': `${config.app.url}/wallpaper/${wallpaper.id}`,
        name: wallpaper.title,
        contentUrl: wallpaper.image_url,
        url: `${config.app.url}/wallpaper/${wallpaper.id}`,
      })),
      publisher: {
        '@type': 'Organization',
        name: config.app.name,
        url: config.app.url,
      },
    };
  }

  // Generate FAQ structured data
  static generateFAQStructuredData(faqs: Array<{
    question: string;
    answer: string;
  }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  // Generate sitemap data
  static generateSitemapUrls(wallpapers: Array<{
    id: string;
    created_at: string;
  }>, categories: string[] = []) {
    const urls = [
      {
        url: config.app.url,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${config.app.url}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${config.app.url}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${config.app.url}/collections`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ];

    // Add category pages
    categories.forEach(category => {
      urls.push({
        url: `${config.app.url}/categories/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    });

    // Add wallpaper pages
    wallpapers.forEach(wallpaper => {
      urls.push({
        url: `${config.app.url}/wallpaper/${wallpaper.id}`,
        lastModified: new Date(wallpaper.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      });
    });

    return urls;
  }

  // Optimize title for SEO
  static optimizeTitle(title: string, category?: string, keywords?: string[]): string {
    const maxLength = 60;
    let optimizedTitle = title;

    // Add category if provided
    if (category) {
      optimizedTitle = `${title} - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }

    // Add high-value keywords if space allows
    if (keywords && keywords.length > 0) {
      const keywordString = keywords.slice(0, 2).join(' ');
      const testTitle = `${optimizedTitle} | ${keywordString}`;
      
      if (testTitle.length <= maxLength) {
        optimizedTitle = testTitle;
      }
    }

    // Ensure title doesn't exceed max length
    if (optimizedTitle.length > maxLength) {
      optimizedTitle = optimizedTitle.substring(0, maxLength - 3) + '...';
    }

    return optimizedTitle;
  }

  // Generate meta description
  static generateMetaDescription(
    content: string,
    category?: string,
    keywords?: string[]
  ): string {
    const maxLength = 160;
    let description = content;

    // Add category context
    if (category) {
      description = `${description} Browse ${category} wallpapers.`;
    }

    // Add keywords naturally
    if (keywords && keywords.length > 0) {
      const keywordPhrase = keywords.slice(0, 3).join(', ');
      description = `${description} Features: ${keywordPhrase}.`;
    }

    // Ensure description doesn't exceed max length
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }

    return description;
  }
}
