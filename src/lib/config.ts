// Application configuration
export const config = {
  // App metadata
  app: {
    name: 'Wallpaper Gallery',
    description: 'Premium digital wallpapers for desktop, mobile, and tablet',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://wallpapergallery.com',
    version: '1.0.0'
  },

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // Cloudflare R2 configuration
  storage: {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!
  },

  // AI configuration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY
  },

  // Performance budget targets
  performance: {
    // Core Web Vitals targets
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    fcp: 1500, // First Contentful Paint (ms)
    tti: 3000, // Time to Interactive (ms)

    // Resource budgets
    totalPageWeight: 2 * 1024 * 1024, // 2MB
    imageWeight: 500 * 1024,          // 500KB per page
    jsWeight: 300 * 1024,             // 300KB compressed
    cssWeight: 100 * 1024,            // 100KB compressed
    fontWeight: 200 * 1024            // 200KB with subset optimization
  },

  // Image optimization settings
  images: {
    // Supported formats in order of preference
    formats: ['avif', 'webp', 'jpeg'],
    
    // Quality settings
    quality: {
      thumbnail: 80,
      preview: 85,
      download: 95
    },

    // Size breakpoints
    breakpoints: {
      mobile: 400,
      tablet: 800,
      desktop: 1200,
      large: 1920
    },

    // Compression targets
    compression: {
      thumbnail: 50 * 1024,  // 50KB
      preview: 200 * 1024,   // 200KB
      // Downloads maintain original quality
    }
  },

  // SEO configuration
  seo: {
    defaultTitle: 'Digital Wallpaper Gallery | HD & 4K Wallpapers for Desktop & Mobile',
    defaultDescription: 'Download stunning HD and 4K wallpapers for your desktop, mobile, and tablet. Browse our curated collection of high-quality digital wallpapers across various categories.',
    keywords: [
      'wallpapers', 'desktop wallpapers', 'mobile wallpapers', 
      '4K wallpapers', 'HD wallpapers', 'digital wallpapers',
      'background images', 'screen backgrounds', 'wallpaper download',
      'free wallpapers', 'high resolution wallpapers', 'computer wallpapers'
    ],
    openGraph: {
      type: 'website',
      siteName: 'Wallpaper Gallery',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Wallpaper Gallery - Premium Digital Wallpapers'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wallpapergallery',
      creator: '@wallpapergallery'
    }
  },

  // Analytics configuration
  analytics: {
    // Google Analytics 4
    ga4: {
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    },
    
    // Vercel Analytics
    vercel: {
      enabled: process.env.NODE_ENV === 'production'
    },

    // Custom analytics tracking
    events: {
      pageView: 'page_view',
      download: 'wallpaper_download',
      search: 'wallpaper_search',
      rating: 'wallpaper_rating',
      favorite: 'wallpaper_favorite'
    }
  },

  // Feature flags
  features: {
    userAccounts: true,
    socialSharing: true,
    ratings: true,
    favorites: true,
    collections: true,
    search: true,
    filters: true,
    recommendations: true,
    analytics: true,
    comments: false, // Phase 4 feature
    uploads: false,  // Phase 4 feature
    premium: false   // Future feature
  },

  // API rate limiting
  rateLimit: {
    downloads: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50 // limit each IP to 50 downloads per windowMs
    },
    search: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30 // limit each IP to 30 searches per minute
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    }
  },

  // Cache configuration
  cache: {
    // Static assets
    static: {
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 86400 // 1 day
    },
    
    // API responses
    api: {
      wallpapers: 300,     // 5 minutes
      categories: 3600,    // 1 hour
      trending: 900,       // 15 minutes
      search: 300          // 5 minutes
    },

    // Images
    images: {
      maxAge: 31536000,    // 1 year
      staleWhileRevalidate: 86400 // 1 day
    }
  },

  // Security configuration
  security: {
    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:', process.env.R2_PUBLIC_URL || ''],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", process.env.NEXT_PUBLIC_SUPABASE_URL || '', 'https://api.gemini.com']
    },

    // CORS settings
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [process.env.NEXT_PUBLIC_APP_URL || 'https://wallpapergallery.com']
        : ['http://localhost:3000'],
      credentials: true
    }
  },

  // Monitoring and alerting
  monitoring: {
    // Error thresholds
    errorRate: 0.01, // 1% error rate threshold
    
    // Performance thresholds
    responseTime: 2000, // 2 second response time threshold
    
    // Availability
    uptime: 0.999, // 99.9% uptime target
    
    // Business metrics
    conversionRate: 0.08, // 8% minimum conversion rate
    bounceRate: 0.40      // 40% maximum bounce rate
  },

  // Development settings
  dev: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    enablePerformanceLogging: true,
    enableAnalyticsInDev: false,
    mockExternalServices: process.env.NODE_ENV === 'test'
  }
};

// Environment validation
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize configuration
if (typeof window === 'undefined') {
  // Server-side validation
  validateEnvironment();
}
