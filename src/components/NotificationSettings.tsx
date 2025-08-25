'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  Check, 
  X,
  Clock,
  Star,
  TrendingUp,
  Heart,
  Users
} from 'lucide-react';
import { NotificationService, EmailService } from '@/lib/notifications';
import { AuthService } from '@/lib/auth';

interface NotificationPreferences {
  pushNotifications: {
    enabled: boolean;
    newWallpapers: boolean;
    recommendations: boolean;
    trending: boolean;
    social: boolean;
    marketing: boolean;
  };
  emailNotifications: {
    enabled: boolean;
    welcome: boolean;
    monthlyHighlights: boolean;
    reEngagement: boolean;
    newFeatures: boolean;
    marketing: boolean;
  };
  frequency: {
    push: 'immediate' | 'daily' | 'weekly';
    email: 'immediate' | 'daily' | 'weekly' | 'monthly';
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationSettingsProps {
  className?: string;
}

export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotifications: {
      enabled: false,
      newWallpapers: true,
      recommendations: true,
      trending: false,
      social: true,
      marketing: false
    },
    emailNotifications: {
      enabled: true,
      welcome: true,
      monthlyHighlights: true,
      reEngagement: true,
      newFeatures: true,
      marketing: false
    },
    frequency: {
      push: 'immediate',
      email: 'weekly'
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    checkPushSupport();
  }, []);

  const loadSettings = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load user preferences from backend
        const userProfile = await AuthService.getUserProfile(currentUser.id);
        if (userProfile?.preferences) {
          // Merge with notification preferences
          setPreferences(prev => ({
            ...prev,
            emailNotifications: {
              ...prev.emailNotifications,
              enabled: userProfile.preferences.emailNotifications
            }
          }));
        }
      }

      // Load from localStorage
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        const storedPrefs = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...storedPrefs }));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = async () => {
    const supported = await NotificationService.init();
    setPushSupported(supported);
    
    if (supported) {
      setPushPermission(Notification.permission);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && pushPermission !== 'granted') {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        return;
      }
      setPushPermission('granted');
      
      // Subscribe to push notifications
      await NotificationService.subscribeToPush();
    } else if (!enabled) {
      // Unsubscribe from push notifications
      await NotificationService.unsubscribeFromPush();
    }

    updatePreference('pushNotifications', 'enabled', enabled);
  };

  const updatePreference = (category: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));

      // Save to backend if user is logged in
      if (user) {
        await AuthService.updateUserProfile(user.id, {
          preferences: {
            ...user.preferences,
            emailNotifications: preferences.emailNotifications.enabled,
            pushNotifications: preferences.pushNotifications.enabled
          }
        });
      }

      // Show success notification
      if (preferences.pushNotifications.enabled) {
        await NotificationService.showNotification({
          title: 'Settings Saved!',
          body: 'Your notification preferences have been updated.',
          tag: 'settings-saved'
        });
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    if (preferences.pushNotifications.enabled) {
      await NotificationService.showNotification({
        title: 'Test Notification',
        body: 'This is how notifications will appear on your device.',
        tag: 'test-notification'
      });
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pushSupported ? 'Get instant notifications on your device' : 'Not supported on this device'}
              </p>
            </div>
          </div>
          
          {pushSupported && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications.enabled}
                onChange={(e) => handlePushToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          )}
        </div>

        {pushSupported && preferences.pushNotifications.enabled && (
          <div className="space-y-4">
            {[
              {
                key: 'newWallpapers',
                label: 'New Wallpapers',
                description: 'When new wallpapers are added',
                icon: Star
              },
              {
                key: 'recommendations',
                label: 'Personalized Recommendations',
                description: 'Wallpapers picked just for you',
                icon: Heart
              },
              {
                key: 'trending',
                label: 'Trending Content',
                description: 'Popular wallpapers and trends',
                icon: TrendingUp
              },
              {
                key: 'social',
                label: 'Social Activity',
                description: 'Likes, comments, and follows',
                icon: Users
              }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications[option.key as keyof typeof preferences.pushNotifications] as boolean}
                      onChange={(e) => updatePreference('pushNotifications', option.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={testNotification}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Send Test Notification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive updates and highlights via email
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.enabled}
              onChange={(e) => updatePreference('emailNotifications', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.emailNotifications.enabled && (
          <div className="space-y-4">
            {[
              {
                key: 'welcome',
                label: 'Welcome Series',
                description: 'Getting started tips and guides'
              },
              {
                key: 'monthlyHighlights',
                label: 'Monthly Highlights',
                description: 'Best wallpapers and trends from the month'
              },
              {
                key: 'reEngagement',
                label: 'Re-engagement',
                description: 'Reminders when you haven\'t visited in a while'
              },
              {
                key: 'newFeatures',
                label: 'New Features',
                description: 'Updates about new app features'
              }
            ].map((option) => (
              <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications[option.key as keyof typeof preferences.emailNotifications] as boolean}
                    onChange={(e) => updatePreference('emailNotifications', option.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequency Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Frequency
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How often you receive notifications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Frequency
            </label>
            <select
              value={preferences.frequency.email}
              onChange={(e) => updatePreference('frequency', 'email', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Highlights</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Push Frequency
            </label>
            <select
              value={preferences.frequency.push}
              onChange={(e) => updatePreference('frequency', 'push', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!preferences.pushNotifications.enabled}
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
