import { Analytics } from './analytics';

// Conversion optimization utilities
export class ConversionOptimizer {
  private static experiments = new Map<string, any>();
  private static userSegments = new Map<string, string>();

  // A/B testing framework
  static runExperiment(experimentId: string, variants: Array<{
    id: string;
    weight: number;
    component: any;
  }>): any {
    // Get or create user segment
    const userSegment = this.getUserSegment(experimentId);
    
    // Find variant for this user
    const variant = this.getVariantForUser(experimentId, variants, userSegment);
    
    // Track experiment exposure
    this.trackExperimentExposure(experimentId, variant.id);
    
    return variant.component;
  }

  // Get user segment for experiment
  private static getUserSegment(experimentId: string): string {
    const storageKey = `experiment_${experimentId}`;
    
    // Check if user already has a segment
    let segment = localStorage.getItem(storageKey);
    
    if (!segment) {
      // Generate new segment based on user ID or random
      segment = Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, segment);
    }
    
    this.userSegments.set(experimentId, segment);
    return segment;
  }

  // Get variant for user based on segment
  private static getVariantForUser(
    experimentId: string, 
    variants: Array<{ id: string; weight: number; component: any }>,
    userSegment: string
  ): { id: string; weight: number; component: any } {
    // Use consistent hashing to assign variant
    const hash = this.hashString(userSegment + experimentId);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const threshold = (hash % 100) / 100 * totalWeight;
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (threshold <= currentWeight) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return variants[0];
  }

  // Simple hash function for consistent assignment
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Track experiment exposure
  private static trackExperimentExposure(experimentId: string, variantId: string): void {
    Analytics.trackPageView(`/experiment/${experimentId}/${variantId}`);
  }

  // Track conversion for experiment
  static trackConversion(experimentId: string, conversionType: string, value?: number): void {
    const userSegment = this.userSegments.get(experimentId);
    if (userSegment) {
      // Track conversion with experiment context
      Analytics.trackDownload(`experiment_${experimentId}`, conversionType);
    }
  }
}

// Friction reduction utilities
export class FrictionReducer {
  // Detect and reduce form friction
  static optimizeForm(formElement: HTMLFormElement): void {
    // Auto-focus first input
    const firstInput = formElement.querySelector('input, select, textarea') as HTMLElement;
    if (firstInput) {
      firstInput.focus();
    }

    // Add real-time validation
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', this.validateField);
      input.addEventListener('input', this.clearFieldError);
    });

    // Optimize for mobile
    this.optimizeForMobile(formElement);
  }

  // Validate individual field
  private static validateField(event: Event): void {
    const field = event.target as HTMLInputElement;
    const errorElement = document.getElementById(`${field.name}-error`);
    
    if (!field.checkValidity()) {
      field.classList.add('error');
      if (errorElement) {
        errorElement.textContent = field.validationMessage;
        errorElement.style.display = 'block';
      }
    } else {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  }

  // Clear field error on input
  private static clearFieldError(event: Event): void {
    const field = event.target as HTMLInputElement;
    const errorElement = document.getElementById(`${field.name}-error`);
    
    if (field.classList.contains('error')) {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  }

  // Optimize form for mobile devices
  private static optimizeForMobile(formElement: HTMLFormElement): void {
    const inputs = formElement.querySelectorAll('input');
    
    inputs.forEach(input => {
      // Set appropriate input types for mobile keyboards
      switch (input.name.toLowerCase()) {
        case 'email':
          input.type = 'email';
          break;
        case 'phone':
        case 'tel':
          input.type = 'tel';
          break;
        case 'url':
        case 'website':
          input.type = 'url';
          break;
      }

      // Add autocomplete attributes
      if (input.name.toLowerCase().includes('name')) {
        input.setAttribute('autocomplete', 'name');
      } else if (input.name.toLowerCase().includes('email')) {
        input.setAttribute('autocomplete', 'email');
      }
    });
  }

  // Reduce download friction
  static optimizeDownloadFlow(): void {
    // Preload download links
    const downloadButtons = document.querySelectorAll('[data-download-url]');
    downloadButtons.forEach(button => {
      const url = button.getAttribute('data-download-url');
      if (url) {
        this.preloadDownload(url);
      }
    });

    // Add one-click download handlers
    downloadButtons.forEach(button => {
      button.addEventListener('click', this.handleOneClickDownload);
    });
  }

  // Preload download for faster response
  private static preloadDownload(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Handle one-click download
  private static handleOneClickDownload(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const url = button.getAttribute('data-download-url');
    
    if (url) {
      // Create and trigger download immediately
      const link = document.createElement('a');
      link.href = url;
      link.download = button.getAttribute('data-filename') || 'wallpaper.jpg';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success feedback
      button.classList.add('download-success');
      setTimeout(() => {
        button.classList.remove('download-success');
      }, 2000);
    }
  }
}

// User experience optimization
export class UXOptimizer {
  // Optimize page loading experience
  static optimizePageLoad(): void {
    // Show loading indicators
    this.showLoadingIndicators();
    
    // Optimize critical rendering path
    this.optimizeCriticalPath();
    
    // Implement progressive loading
    this.implementProgressiveLoading();
  }

  // Show loading indicators for better perceived performance
  private static showLoadingIndicators(): void {
    // Add skeleton loaders
    const contentAreas = document.querySelectorAll('[data-loading]');
    contentAreas.forEach(area => {
      area.classList.add('skeleton-loading');
    });

    // Remove skeleton loaders when content loads
    window.addEventListener('load', () => {
      contentAreas.forEach(area => {
        area.classList.remove('skeleton-loading');
      });
    });
  }

  // Optimize critical rendering path
  private static optimizeCriticalPath(): void {
    // Inline critical CSS
    const criticalCSS = this.getCriticalCSS();
    if (criticalCSS) {
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    }

    // Defer non-critical resources
    this.deferNonCriticalResources();
  }

  // Get critical CSS for above-the-fold content
  private static getCriticalCSS(): string {
    // This would typically be generated during build time
    return `
      .skeleton-loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .download-success {
        background-color: #10b981 !important;
        transform: scale(1.05);
        transition: all 0.2s ease;
      }
    `;
  }

  // Defer non-critical resources
  private static deferNonCriticalResources(): void {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      script.setAttribute('defer', '');
    });

    // Lazy load non-critical images
    const images = document.querySelectorAll('img[data-lazy]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  // Implement progressive loading
  private static implementProgressiveLoading(): void {
    // Load content in priority order
    const priorities = ['critical', 'important', 'normal', 'low'];
    
    priorities.forEach((priority, index) => {
      setTimeout(() => {
        const elements = document.querySelectorAll(`[data-priority="${priority}"]`);
        elements.forEach(element => {
          element.classList.add('loaded');
        });
      }, index * 100);
    });
  }

  // Optimize for mobile gestures
  static optimizeMobileGestures(): void {
    // Add swipe gestures for image galleries
    this.addSwipeGestures();
    
    // Optimize touch targets
    this.optimizeTouchTargets();
    
    // Add pull-to-refresh
    this.addPullToRefresh();
  }

  // Add swipe gestures
  private static addSwipeGestures(): void {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Detect horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right
          this.handleSwipeRight();
        } else {
          // Swipe left
          this.handleSwipeLeft();
        }
      }
    });
  }

  // Handle swipe gestures
  private static handleSwipeRight(): void {
    // Navigate to previous image or page
    const prevButton = document.querySelector('[data-nav="prev"]') as HTMLElement;
    if (prevButton) {
      prevButton.click();
    }
  }

  private static handleSwipeLeft(): void {
    // Navigate to next image or page
    const nextButton = document.querySelector('[data-nav="next"]') as HTMLElement;
    if (nextButton) {
      nextButton.click();
    }
  }

  // Optimize touch targets for mobile
  private static optimizeTouchTargets(): void {
    const touchTargets = document.querySelectorAll('button, a, [role="button"]');
    
    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      
      // Ensure minimum touch target size (44px)
      if (rect.width < 44 || rect.height < 44) {
        (target as HTMLElement).style.minWidth = '44px';
        (target as HTMLElement).style.minHeight = '44px';
        (target as HTMLElement).style.display = 'inline-flex';
        (target as HTMLElement).style.alignItems = 'center';
        (target as HTMLElement).style.justifyContent = 'center';
      }
    });
  }

  // Add pull-to-refresh functionality
  private static addPullToRefresh(): void {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (isPulling) {
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 100) {
          // Show refresh indicator
          this.showRefreshIndicator();
        }
      }
    });

    document.addEventListener('touchend', () => {
      if (isPulling && currentY - startY > 100) {
        // Trigger refresh
        window.location.reload();
      }
      
      isPulling = false;
      this.hideRefreshIndicator();
    });
  }

  // Show refresh indicator
  private static showRefreshIndicator(): void {
    let indicator = document.getElementById('refresh-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'refresh-indicator';
      indicator.textContent = 'Release to refresh';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        z-index: 9999;
        font-size: 14px;
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
  }

  // Hide refresh indicator
  private static hideRefreshIndicator(): void {
    const indicator = document.getElementById('refresh-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

// Initialize optimizations
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    UXOptimizer.optimizePageLoad();
    FrictionReducer.optimizeDownloadFlow();
    
    // Mobile-specific optimizations
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      UXOptimizer.optimizeMobileGestures();
    }
  });
}
