import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { config } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.app.url
  
  // Get all wallpapers for dynamic routes
  const { data: wallpapers } = await supabase
    .from('wallpapers')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/installation-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = [
    // Device categories
    'desktop', 'mobile', 'tablet', 'dual-monitor', 'ultrawide'
  ].map(slug => ({
    url: `${baseUrl}/categories/device/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })).concat([
    // Style categories
    'abstract', 'nature', 'minimalist', 'gaming', 'space'
  ].map(slug => ({
    url: `${baseUrl}/categories/style/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))).concat([
    // Color categories
    'dark', 'light', 'colorful', 'monochrome'
  ].map(slug => ({
    url: `${baseUrl}/categories/color/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))).concat([
    // Resolution categories
    '4k', 'hd', '8k', 'retina'
  ].map(slug => ({
    url: `${baseUrl}/categories/resolution/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })))

  // Dynamic wallpaper routes
  const wallpaperRoutes: MetadataRoute.Sitemap = wallpapers?.map((wallpaper) => ({
    url: `${baseUrl}/wallpaper/${wallpaper.id}`,
    lastModified: new Date(wallpaper.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) || []

  return [...staticRoutes, ...categoryRoutes, ...wallpaperRoutes]
}
