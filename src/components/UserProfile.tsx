'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Heart, 
  Download, 
  Calendar, 
  MapPin, 
  Globe, 
  Edit3,
  Save,
  X,
  Camera
} from 'lucide-react';
import { AuthService, FavoritesService, UserProfile as UserProfileType } from '@/lib/auth';
import WallpaperCard from './WallpaperCard';

interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
  className?: string;
}

export default function UserProfile({ 
  userId, 
  isOwnProfile = false,
  className = '' 
}: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteStats, setFavoriteStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({});
  const [activeTab, setActiveTab] = useState<'favorites' | 'stats' | 'settings'>('favorites');

  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadFavoriteStats();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userProfile = await AuthService.getUserProfile(userId);
      setProfile(userProfile);
      setEditForm(userProfile || {});
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { favorites } = await FavoritesService.getUserFavorites(userId, 12);
      setFavorites(favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStats = async () => {
    try {
      const stats = await FavoritesService.getFavoriteStats(userId);
      setFavoriteStats(stats);
    } catch (error) {
      console.error('Failed to load favorite stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { profile: updatedProfile, error } = await AuthService.updateUserProfile(
        userId, 
        editForm
      );

      if (error) {
        console.error('Failed to update profile:', error);
        return;
      }

      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-lg text-white hover:bg-opacity-70 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-10">
            <div className="flex items-end space-x-4">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="pt-4">
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="text-xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                      placeholder="Full name"
                    />
                    <input
                      type="text"
                      value={editForm.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                      placeholder="@username"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {profile.full_name || 'Anonymous User'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      @{profile.username || 'user'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="pt-4">
                {editing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm(profile);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {profile.bio || 'No bio available'}
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {editing ? (
              <>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Location"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <input
                    type="url"
                    value={editForm.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Website"
                  />
                </div>
              </>
            ) : (
              <>
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.stats.joinedAt)}</span>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.stats.favoriteCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.stats.totalDownloads}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.floor((Date.now() - new Date(profile.stats.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'stats', label: 'Statistics', icon: Download },
              ...(isOwnProfile ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? "You haven't favorited any wallpapers yet" : "No favorites to show"}
                  </p>
                </div>
              ) : (
                <div className="wallpaper-grid">
                  {favorites.map((favorite) => (
                    <WallpaperCard
                      key={favorite.wallpaper_id}
                      wallpaper={favorite.wallpapers}
                      showStats={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {favoriteStats && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Favorite Categories
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(favoriteStats.categoryDistribution).map(([category, count]) => {
                        const percentage = (count as number / favoriteStats.totalFavorites) * 100;
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {category}
                            </span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && isOwnProfile && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates about new wallpapers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.preferences.emailNotifications}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        emailNotifications: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Auto Download
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically download wallpapers when clicked
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.preferences.autoDownload}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        autoDownload: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
