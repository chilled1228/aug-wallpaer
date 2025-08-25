import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultResolution: 'mobile' | 'desktop' | '4k';
    autoDownload: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  stats: {
    totalDownloads: number;
    favoriteCount: number;
    joinedAt: string;
    lastActiveAt: string;
  };
}

export class AuthService {
  private static supabaseClient = supabase;

  // Sign up with email and password
  static async signUp(email: string, password: string, metadata?: {
    full_name?: string;
    username?: string;
  }) {
    try {
      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, metadata);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Update last active timestamp
      if (data.user) {
        await this.updateLastActive(data.user.id);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error };
    }
  }

  // Sign in with OAuth providers
  static async signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return { error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabaseClient.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  // Create user profile
  private static async createUserProfile(user: User, metadata?: {
    full_name?: string;
    username?: string;
  }) {
    try {
      const profile: Partial<UserProfile> = {
        id: user.id,
        email: user.email!,
        full_name: metadata?.full_name || user.user_metadata?.full_name,
        username: metadata?.username || user.user_metadata?.username,
        avatar_url: user.user_metadata?.avatar_url,
        preferences: {
          theme: 'system',
          defaultResolution: 'desktop',
          autoDownload: false,
          emailNotifications: true,
          pushNotifications: false
        },
        stats: {
          totalDownloads: 0,
          favoriteCount: 0,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        }
      };

      const { error } = await this.supabaseClient
        .from('user_profiles')
        .insert([profile]);

      if (error) throw error;
    } catch (error) {
      console.error('Create user profile error:', error);
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { profile: null, error };
    }
  }

  // Update last active timestamp
  private static async updateLastActive(userId: string) {
    try {
      await this.supabaseClient
        .from('user_profiles')
        .update({
          'stats.lastActiveAt': new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Update last active error:', error);
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabaseClient.auth.onAuthStateChange(callback);
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session;
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(p => p.permission);
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  // Check if user has permission
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }
}

// Favorites service
export class FavoritesService {
  private static supabaseClient = supabase;

  // Add wallpaper to favorites
  static async addToFavorites(userId: string, wallpaperId: string) {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_favorites')
        .insert([{
          user_id: userId,
          wallpaper_id: wallpaperId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update user stats
      await this.updateFavoriteCount(userId);

      return { favorite: data, error: null };
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { favorite: null, error };
    }
  }

  // Remove wallpaper from favorites
  static async removeFromFavorites(userId: string, wallpaperId: string) {
    try {
      const { error } = await this.supabaseClient
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('wallpaper_id', wallpaperId);

      if (error) throw error;

      // Update user stats
      await this.updateFavoriteCount(userId);

      return { error: null };
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { error };
    }
  }

  // Check if wallpaper is favorited
  static async isFavorited(userId: string, wallpaperId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('wallpaper_id', wallpaperId)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  // Get user's favorite wallpapers
  static async getUserFavorites(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_favorites')
        .select(`
          wallpaper_id,
          created_at,
          wallpapers (
            id,
            title,
            description,
            image_url,
            category,
            tags,
            download_count,
            average_rating,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { favorites: data, error: null };
    } catch (error) {
      console.error('Get user favorites error:', error);
      return { favorites: [], error };
    }
  }

  // Update favorite count in user stats
  private static async updateFavoriteCount(userId: string) {
    try {
      const { count } = await this.supabaseClient
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      await this.supabaseClient
        .from('user_profiles')
        .update({ 'stats.favoriteCount': count || 0 })
        .eq('id', userId);
    } catch (error) {
      console.error('Update favorite count error:', error);
    }
  }

  // Get favorite statistics
  static async getFavoriteStats(userId: string) {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_favorites')
        .select(`
          wallpapers (category)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Calculate category distribution
      const categoryStats: Record<string, number> = {};
      data.forEach((fav: any) => {
        const category = fav.wallpapers?.category;
        if (category) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        }
      });

      return {
        totalFavorites: data.length,
        categoryDistribution: categoryStats,
        error: null
      };
    } catch (error) {
      console.error('Get favorite stats error:', error);
      return {
        totalFavorites: 0,
        categoryDistribution: {},
        error
      };
    }
  }
}
