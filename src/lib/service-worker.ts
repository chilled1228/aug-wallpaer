// Service Worker registration and management
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              this.notifyUpdate();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Update service worker
  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Notify user about available update
  private notifyUpdate(): void {
    // You can customize this notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is available. Refresh to update.',
        icon: '/icon-192x192.png',
        tag: 'app-update'
      });
    } else {
      // Fallback to custom UI notification
      this.showUpdateBanner();
    }
  }

  // Show update banner
  private showUpdateBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #3b82f6;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <span>A new version is available!</span>
        <button onclick="window.location.reload()" style="
          margin-left: 12px;
          background: white;
          color: #3b82f6;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: 8px;
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(banner);
  }

  // Check if service worker is active
  isActive(): boolean {
    return !!navigator.serviceWorker.controller;
  }

  // Get registration status
  getStatus(): 'unsupported' | 'registering' | 'registered' | 'error' {
    if (!this.isSupported) return 'unsupported';
    if (!this.registration) return 'registering';
    return 'registered';
  }
}

// Background sync utilities
export class BackgroundSync {
  private static syncTags = new Set<string>();

  // Register background sync
  static async register(tag: string): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background Sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      this.syncTags.add(tag);
      console.log(`Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Get registered sync tags
  static getRegisteredTags(): string[] {
    return Array.from(this.syncTags);
  }
}

// Push notification utilities
export class PushNotifications {
  private static vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // Request notification permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  static async subscribe(): Promise<PushSubscription | null> {
    if (!this.vapidPublicKey) {
      console.error('VAPID public key not configured');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log('Push subscription removed');
        return result;
      }
      
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Get current subscription
  static async getSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Convert VAPID key
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Cache management utilities
export class CacheManager {
  // Clear all caches
  static async clearAll(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  // Clear specific cache
  static async clear(cacheName: string): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const result = await caches.delete(cacheName);
      console.log(`Cache cleared: ${cacheName}`);
      return result;
    } catch (error) {
      console.error(`Failed to clear cache ${cacheName}:`, error);
      return false;
    }
  }

  // Get cache size
  static async getSize(): Promise<number> {
    if (!('caches' in window) || !('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  // Get cache quota
  static async getQuota(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.quota || 0;
    } catch (error) {
      console.error('Failed to get cache quota:', error);
      return 0;
    }
  }
}

// Initialize service worker on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const swManager = ServiceWorkerManager.getInstance();
    swManager.register();
  });
}
