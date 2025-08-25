'use client';

import { useState } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy, 
  Download,
  Check,
  X,
  MessageCircle,
  Send
} from 'lucide-react';
import { Analytics } from '@/lib/analytics';

interface SocialShareProps {
  wallpaper: {
    id: string;
    title: string;
    image_url: string;
    category: string;
  };
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: any;
  color: string;
  shareUrl: (url: string, title: string, imageUrl: string) => string;
}

const sharePlatforms: SharePlatform[] = [
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (url, title) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
  },
  {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    shareUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=wallpaper,design`
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'Pinterest',
    icon: Instagram,
    color: 'bg-red-600 hover:bg-red-700',
    shareUrl: (url, title, imageUrl) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`
  }
];

export default function SocialShare({ 
  wallpaper, 
  isOpen, 
  onClose,
  className = '' 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/wallpaper/${wallpaper.id}`;
  const shareTitle = `Check out this amazing ${wallpaper.category} wallpaper: ${wallpaper.title}`;

  const handlePlatformShare = async (platform: SharePlatform) => {
    try {
      const url = platform.shareUrl(shareUrl, shareTitle, wallpaper.image_url);
      window.open(url, '_blank', 'width=600,height=400');
      
      // Track share
      await Analytics.trackPageView(`/share/${platform.name.toLowerCase()}/${wallpaper.id}`);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Track copy
      await Analytics.trackPageView(`/share/copy/${wallpaper.id}`);
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper.title,
          text: shareTitle,
          url: shareUrl
        });
        
        // Track native share
        await Analytics.trackPageView(`/share/native/${wallpaper.id}`);
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  const handleDirectMessage = () => {
    const message = customMessage || shareTitle;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Wallpaper
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallpaper Preview */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <img
              src={wallpaper.image_url}
              alt={wallpaper.title}
              className="w-16 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {wallpaper.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {wallpaper.category}
              </p>
            </div>
          </div>

          {/* Native Share (if supported) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          )}

          {/* Social Platforms */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Share on social media
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {sharePlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformShare(platform)}
                    className={`flex items-center justify-center space-x-2 p-3 text-white rounded-lg transition-colors ${platform.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Message */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Send direct message
            </h4>
            <div className="space-y-3">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message (optional)"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
              />
              <button
                onClick={handleDirectMessage}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Copy link
            </h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Download and Share */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Share this wallpaper with friends and help them discover amazing designs!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Share Button Component
interface QuickShareButtonProps {
  wallpaper: {
    id: string;
    title: string;
    image_url: string;
    category: string;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export function QuickShareButton({ 
  wallpaper, 
  size = 'md',
  variant = 'icon',
  className = '' 
}: QuickShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleQuickShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try native share first
    if (navigator.share) {
      try {
        const shareUrl = `${window.location.origin}/wallpaper/${wallpaper.id}`;
        await navigator.share({
          title: wallpaper.title,
          text: `Check out this amazing ${wallpaper.category} wallpaper: ${wallpaper.title}`,
          url: shareUrl
        });
        
        // Track native share
        await Analytics.trackPageView(`/share/native/${wallpaper.id}`);
        return;
      } catch (error) {
        // Fall back to modal if native share fails or is cancelled
      }
    }

    // Show share modal
    setShowModal(true);
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleQuickShare}
          className={`inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${className}`}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        
        <SocialShare
          wallpaper={wallpaper}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleQuickShare}
        className={`
          ${getButtonSize()}
          flex items-center justify-center
          rounded-full
          bg-white bg-opacity-90 hover:bg-opacity-100
          text-gray-900
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${className}
        `}
        title="Share wallpaper"
      >
        <Share2 className={getIconSize()} />
      </button>
      
      <SocialShare
        wallpaper={wallpaper}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
