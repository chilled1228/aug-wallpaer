'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Grid3X3, 
  Heart, 
  User,
  Download,
  Star,
  Bookmark
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Featured wallpapers'
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Grid3X3,
      description: 'Browse by category'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Find specific wallpapers'
    },
    {
      name: 'Collections',
      href: '/collections',
      icon: Bookmark,
      description: 'Curated collections'
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Heart,
      description: 'Your saved wallpapers'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`nav-brand ${className}`}>
        <div className="container-mobile">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-xl font-bold text-brand hover:text-brand-accent transition-colors"
            >
              <div className="w-10 h-10 bg-brand rounded border-2 border-brand-accent flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block text-brand">
                WallpaperHub
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all touch-target focus-ring ${
                      isActive(item.href)
                        ? 'bg-brand-soft text-brand border-2 border-brand'
                        : 'text-brand-text hover:text-brand hover:bg-brand-surface border-2 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden touch-target focus-ring p-2 rounded text-brand hover:text-brand-accent hover:bg-brand-surface transition-all border-2 border-transparent hover:border-brand-accent"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="touch-target focus-ring p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors touch-target focus-ring ${
                          isActive(item.href)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm opacity-75">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Additional Mobile Menu Items */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <Link
                      href="/about"
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target focus-ring"
                    >
                      <User className="w-5 h-5" />
                      <div>
                        <div className="font-medium">About</div>
                        <div className="text-sm opacity-75">Learn more about us</div>
                      </div>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target focus-ring"
                    >
                      <Download className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Contact</div>
                        <div className="text-sm opacity-75">Get in touch</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile (Thumb-friendly) */}
      <div className="bottom-nav-brand fixed bottom-0 left-0 right-0 md:hidden z-40">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 touch-target focus-ring transition-all ${
                  isActive(item.href)
                    ? 'text-brand bg-brand-soft rounded'
                    : 'text-brand-accent hover:text-brand hover:bg-brand-surface rounded'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
}
