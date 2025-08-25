'use client';

import Link from 'next/link';
import { 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  Download,
  Grid3X3,
  Search,
  Bookmark
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { name: 'Categories', href: '/categories', icon: Grid3X3 },
      { name: 'Search', href: '/search', icon: Search },
      { name: 'Collections', href: '/collections', icon: Bookmark },
      { name: 'Favorites', href: '/favorites', icon: Heart }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Download Guide', href: '/help/download' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Report Issue', href: '/contact?type=issue' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/wallpapergallery', icon: Facebook },
    { name: 'Instagram', href: 'https://instagram.com/wallpapergallery', icon: Instagram },
    { name: 'Twitter', href: 'https://twitter.com/wallpapergallery', icon: Twitter },
    { name: 'YouTube', href: 'https://youtube.com/wallpapergallery', icon: Youtube }
  ];

  return (
    <footer className="section-alt border-t border-brand-primary/10">
      <div className="container-mobile">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-brand rounded border-2 border-brand-accent flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-brand">
                WallpaperHub
              </span>
            </Link>
            <p className="text-brand-accent mb-8 max-w-sm leading-relaxed">
              Your go-to destination for premium wallpapers. Download stunning designs 
              optimized for every device - from 4K desktop displays to mobile screens.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-brand-text">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-brand-soft rounded border border-brand-accent flex items-center justify-center">
                  <Mail className="w-3 h-3 text-brand" />
                </div>
                <span>hello@wallpaperhub.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-brand-soft rounded border border-brand-accent flex items-center justify-center">
                  <Download className="w-3 h-3 text-brand" />
                </div>
                <span>Free Downloads Daily</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-brand-soft rounded border border-brand-accent flex items-center justify-center">
                  <Star className="w-3 h-3 text-brand" />
                </div>
                <span>Premium Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="text-lg font-bold text-brand mb-6">
              Browse Wallpapers
            </h3>
            <ul className="space-y-4">
              {footerLinks.browse.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-brand-text hover:text-brand transition-colors group"
                    >
                      <div className="w-5 h-5 bg-brand-surface group-hover:bg-brand-soft rounded border border-brand-accent flex items-center justify-center transition-colors">
                        <Icon className="w-3 h-3 text-brand" />
                      </div>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold text-brand mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-text hover:text-brand transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold text-brand mb-6">
              Help & Support
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-text hover:text-brand transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-brand-primary/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-brand-accent">
              © {currentYear} WallpaperHub. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-brand-surface hover:bg-brand-soft rounded border-2 border-brand-accent flex items-center justify-center text-brand hover:text-brand-accent transition-all"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="text-sm text-brand-accent flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-brand-soft" /> for wallpaper enthusiasts
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
