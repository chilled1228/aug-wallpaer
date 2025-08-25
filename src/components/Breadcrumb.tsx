'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            {item.current || index === items.length - 1 ? (
              <span 
                className="text-gray-900 dark:text-white font-medium"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Utility function to generate breadcrumbs from pathname
export function generateBreadcrumbs(pathname: string, customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  if (customItems) {
    return customItems;
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumbs from URL segments
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const name = formatSegmentName(segment);
    
    breadcrumbs.push({
      name,
      href,
      current: index === segments.length - 1
    });
  });

  return breadcrumbs;
}

// Format URL segment to readable name
function formatSegmentName(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'wallpaper': 'Wallpapers',
    'categories': 'Categories',
    'collections': 'Collections',
    'search': 'Search',
    'favorites': 'Favorites',
    'about': 'About',
    'contact': 'Contact',
    'help': 'Help',
    'faq': 'FAQ',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service'
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Decode URI component and format
  const decoded = decodeURIComponent(segment);
  
  // Replace hyphens and underscores with spaces, then capitalize
  return decoded
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Hook for easy breadcrumb usage in pages
export function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  if (typeof window === 'undefined') {
    return [];
  }
  
  return generateBreadcrumbs(window.location.pathname, customItems);
}
