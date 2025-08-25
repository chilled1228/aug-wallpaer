import { Analytics } from './analytics';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  audience: {
    type: 'all' | 'segment' | 'custom';
    criteria?: any;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    date?: Date;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
}

export class NotificationService {
  private static isSupported = typeof window !== 'undefined' && 'Notification' in window;
  private static permission: NotificationPermission = 'default';
  private static registration: ServiceWorkerRegistration | null = null;

  // Initialize notification service
  static async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      }

      // Check current permission
      this.permission = Notification.permission;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      this.permission = await Notification.requestPermission();
      
      // Track permission result
      await Analytics.trackPageView('/notification/permission', undefined, {
        permission: this.permission
      });

      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Show local notification
  static async showNotification(payload: NotificationPayload): Promise<boolean> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      if (this.registration) {
        // Use service worker for better control
        await this.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          image: payload.image,
          badge: payload.badge || '/badge-72x72.png',
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          requireInteraction: false,
          silent: false
        });
      } else {
        // Fallback to basic notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          tag: payload.tag,
          data: payload.data
        });
      }

      // Track notification shown
      await Analytics.trackPageView('/notification/shown', undefined, {
        title: payload.title,
        tag: payload.tag
      });

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Send push notification (server-side)
  static async sendPushNotification(
    userId: string, 
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // In production, this would call your backend API
      // which would use web push protocol to send notifications
      
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          payload
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  static async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Utility function for VAPID key conversion
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

  // Smart notification triggers
  static async triggerNewWallpaperNotification(wallpaper: any): Promise<void> {
    await this.showNotification({
      title: 'New Wallpaper Available!',
      body: `Check out "${wallpaper.title}" in ${wallpaper.category}`,
      icon: '/icon-192x192.png',
      image: wallpaper.image_url,
      tag: 'new-wallpaper',
      data: { wallpaperId: wallpaper.id, type: 'new-wallpaper' },
      actions: [
        { action: 'view', title: 'View Now', icon: '/icons/view.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  static async triggerPersonalizedRecommendation(recommendations: any[]): Promise<void> {
    if (recommendations.length === 0) return;

    await this.showNotification({
      title: 'New Recommendations for You!',
      body: `We found ${recommendations.length} wallpapers you might love`,
      icon: '/icon-192x192.png',
      tag: 'recommendations',
      data: { type: 'recommendations', count: recommendations.length },
      actions: [
        { action: 'view', title: 'View Recommendations' },
        { action: 'dismiss', title: 'Not Now' }
      ]
    });
  }

  static async triggerTrendingAlert(category: string): Promise<void> {
    await this.showNotification({
      title: `Trending in ${category}!`,
      body: 'Discover the most popular wallpapers right now',
      icon: '/icon-192x192.png',
      tag: 'trending',
      data: { type: 'trending', category },
      actions: [
        { action: 'view', title: 'See Trending' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }
}

export class EmailService {
  private static templates: Map<string, EmailTemplate> = new Map();
  private static campaigns: Map<string, EmailCampaign> = new Map();

  // Initialize email templates
  static init(): void {
    this.loadEmailTemplates();
  }

  private static loadEmailTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Series',
        subject: 'Welcome to WallpaperGallery! 🎨',
        template: `
          <h1>Welcome {{name}}!</h1>
          <p>Thank you for joining our community of wallpaper enthusiasts.</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>Browse thousands of high-quality wallpapers</li>
            <li>Save your favorites</li>
            <li>Get personalized recommendations</li>
            <li>Share with friends</li>
          </ul>
          <a href="{{app_url}}/explore" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Start Exploring
          </a>
        `,
        variables: ['name', 'app_url']
      },
      {
        id: 'monthly_highlights',
        name: 'Monthly Highlights',
        subject: 'This Month\'s Best Wallpapers 📱',
        template: `
          <h1>Monthly Highlights</h1>
          <p>Hi {{name}},</p>
          <p>Here are the most popular wallpapers from this month:</p>
          {{#wallpapers}}
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <img src="{{image_url}}" alt="{{title}}" style="width: 100%; max-width: 300px; border-radius: 6px;">
            <h3>{{title}}</h3>
            <p>{{download_count}} downloads</p>
            <a href="{{app_url}}/wallpaper/{{id}}">View Wallpaper</a>
          </div>
          {{/wallpapers}}
        `,
        variables: ['name', 'wallpapers', 'app_url']
      },
      {
        id: 're_engagement',
        name: 'Re-engagement Campaign',
        subject: 'We miss you! New wallpapers await 🌟',
        template: `
          <h1>We Miss You!</h1>
          <p>Hi {{name}},</p>
          <p>It's been a while since your last visit. We've added amazing new wallpapers that we think you'll love!</p>
          <p>Based on your preferences for {{favorite_category}}, here are some recommendations:</p>
          {{#recommendations}}
          <div style="margin: 15px 0;">
            <img src="{{image_url}}" alt="{{title}}" style="width: 200px; border-radius: 6px;">
            <h4>{{title}}</h4>
          </div>
          {{/recommendations}}
          <a href="{{app_url}}/recommendations" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            See Your Recommendations
          </a>
        `,
        variables: ['name', 'favorite_category', 'recommendations', 'app_url']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Send email
  static async sendEmail(
    to: string,
    templateId: string,
    variables: Record<string, any>
  ): Promise<boolean> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // In production, use a service like SendGrid, Mailgun, or AWS SES
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject: this.processTemplate(template.subject, variables),
          html: this.processTemplate(template.template, variables),
          templateId
        })
      });

      // Track email sent
      await Analytics.trackPageView('/email/sent', undefined, {
        template: templateId,
        recipient: to
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Process template with variables
  private static processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    // Simple variable replacement
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    // Handle arrays (basic Mustache-like syntax)
    Object.entries(variables).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const sectionRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
        processed = processed.replace(sectionRegex, (match, sectionTemplate) => {
          return value.map(item => {
            let itemTemplate = sectionTemplate;
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              const itemRegex = new RegExp(`{{${itemKey}}}`, 'g');
              itemTemplate = itemTemplate.replace(itemRegex, String(itemValue));
            });
            return itemTemplate;
          }).join('');
        });
      }
    });

    return processed;
  }

  // Automated email campaigns
  static async sendWelcomeEmail(user: any): Promise<boolean> {
    return await this.sendEmail(user.email, 'welcome', {
      name: user.full_name || user.username,
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'https://wallpaper-gallery.com'
    });
  }

  static async sendMonthlyHighlights(user: any, wallpapers: any[]): Promise<boolean> {
    return await this.sendEmail(user.email, 'monthly_highlights', {
      name: user.full_name || user.username,
      wallpapers: wallpapers.slice(0, 5),
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'https://wallpaper-gallery.com'
    });
  }

  static async sendReEngagementEmail(user: any, recommendations: any[]): Promise<boolean> {
    return await this.sendEmail(user.email, 're_engagement', {
      name: user.full_name || user.username,
      favorite_category: user.preferences?.favoriteCategory || 'nature',
      recommendations: recommendations.slice(0, 3),
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'https://wallpaper-gallery.com'
    });
  }

  // Campaign management
  static createCampaign(campaign: Omit<EmailCampaign, 'id'>): string {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.campaigns.set(id, { ...campaign, id });
    return id;
  }

  static async executeCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    try {
      // Get audience based on criteria
      const audience = await this.getAudience(campaign.audience);
      
      // Send emails to audience
      const results = await Promise.all(
        audience.map(user => this.sendEmail(user.email, campaign.templateId, {
          name: user.full_name || user.username,
          app_url: process.env.NEXT_PUBLIC_APP_URL
        }))
      );

      // Update campaign status
      campaign.status = 'sent';
      this.campaigns.set(campaignId, campaign);

      return results.every(result => result);
    } catch (error) {
      console.error('Failed to execute campaign:', error);
      return false;
    }
  }

  private static async getAudience(audienceConfig: any): Promise<any[]> {
    // In production, this would query your user database
    // For now, return mock audience
    return [
      { email: 'user1@example.com', full_name: 'John Doe' },
      { email: 'user2@example.com', full_name: 'Jane Smith' }
    ];
  }
}

// Initialize services
if (typeof window !== 'undefined') {
  NotificationService.init();
  EmailService.init();
}
