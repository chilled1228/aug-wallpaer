-- Create the wallpapers table
CREATE TABLE IF NOT EXISTS wallpapers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster ordering
CREATE INDEX IF NOT EXISTS idx_wallpapers_created_at ON wallpapers(created_at DESC);

-- Create an index on category for filtering
CREATE INDEX IF NOT EXISTS idx_wallpapers_category ON wallpapers(category);

-- Enable Row Level Security (RLS) - since this is a public read-only site, we'll allow public reads
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access" ON wallpapers
  FOR SELECT USING (true);

-- Insert some sample data (optional - remove if you want to start with an empty database)
INSERT INTO wallpapers (title, description, tags, category, image_url) VALUES
  (
    'Mountain Sunset',
    'A breathtaking view of mountains during golden hour',
    ARRAY['nature', 'mountains', 'sunset', 'landscape'],
    'nature',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
  ),
  (
    'Minimal Geometric',
    'Clean geometric patterns in soft colors',
    ARRAY['minimal', 'geometric', 'abstract', 'clean'],
    'minimal',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop'
  ),
  (
    'Ocean Waves',
    'Peaceful ocean waves meeting the shore',
    ARRAY['ocean', 'waves', 'blue', 'peaceful'],
    'nature',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop'
  );

-- Note: Replace the image URLs above with your actual R2 URLs when you upload real wallpapers

-- Enhanced schema for user engagement and analytics
CREATE TABLE IF NOT EXISTS wallpaper_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  user_ip TEXT,
  user_agent TEXT,
  resolution TEXT,
  device_type TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_wallpaper_id ON wallpaper_downloads(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON wallpaper_downloads(downloaded_at DESC);

-- User favorites table (for registered users)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Will be populated when auth is implemented
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallpaper_id)
);

-- Wallpaper ratings and reviews
CREATE TABLE IF NOT EXISTS wallpaper_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_wallpaper_id ON wallpaper_ratings(wallpaper_id);

-- Analytics tracking table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- Search queries tracking
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER,
  user_ip TEXT,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON search_queries(searched_at DESC);

-- Enable RLS for all new tables
ALTER TABLE wallpaper_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpaper_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access where appropriate
CREATE POLICY "Allow public read access" ON wallpaper_downloads FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON wallpaper_downloads FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON wallpaper_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON wallpaper_ratings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON search_queries FOR INSERT WITH CHECK (true);

-- Add additional fields to wallpapers table for enhanced functionality
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS resolution TEXT DEFAULT '1920x1080';
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS file_size INTEGER; -- in bytes
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS color_palette TEXT[]; -- dominant colors
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop'; -- desktop, mobile, tablet, all

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_wallpapers_resolution ON wallpapers(resolution);
CREATE INDEX IF NOT EXISTS idx_wallpapers_device_type ON wallpapers(device_type);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured ON wallpapers(featured);
CREATE INDEX IF NOT EXISTS idx_wallpapers_download_count ON wallpapers(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_wallpapers_average_rating ON wallpapers(average_rating DESC);

-- Database functions for analytics
CREATE OR REPLACE FUNCTION increment_download_count(wallpaper_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE wallpapers
  SET download_count = download_count + 1
  WHERE id = wallpaper_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_average_rating(wallpaper_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE wallpapers
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM wallpaper_ratings
    WHERE wallpaper_ratings.wallpaper_id = wallpapers.id
  )
  WHERE id = wallpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending wallpapers (high downloads in recent period)
CREATE OR REPLACE FUNCTION get_trending_wallpapers(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  image_url TEXT,
  recent_downloads BIGINT,
  total_downloads INTEGER,
  average_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.title,
    w.category,
    w.image_url,
    COUNT(wd.id) as recent_downloads,
    w.download_count as total_downloads,
    w.average_rating
  FROM wallpapers w
  LEFT JOIN wallpaper_downloads wd ON w.id = wd.wallpaper_id
    AND wd.downloaded_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY w.id, w.title, w.category, w.image_url, w.download_count, w.average_rating
  ORDER BY recent_downloads DESC, w.average_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
