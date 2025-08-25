# Wallpaper Blog Setup Guide

This is a Next.js 15 wallpaper gallery application with Supabase backend and Cloudflare R2 storage.

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Cloudflare R2 account (optional, for image storage)

## Setup Instructions

### 1. Environment Configuration

1. Copy `.env.local` and update with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Get these values from your Supabase project dashboard:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### 2. Database Setup

1. In your Supabase project, go to the SQL Editor
2. Run the SQL commands from `database-setup.sql`
3. This will create the `wallpapers` table with sample data

### 3. Image Storage (Cloudflare R2)

1. Create a Cloudflare R2 bucket
2. Configure public access for the bucket
3. Upload your wallpaper images
4. Update the `image_url` field in your database with the R2 public URLs

### 4. Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Global layout with metadata
│   ├── page.tsx                # Homepage with wallpaper grid
│   ├── wallpaper/[id]/page.tsx # Individual wallpaper page
│   ├── api/wallpapers/route.ts # API endpoint for wallpapers
│   └── not-found.tsx           # 404 page
├── lib/
│   └── supabase.ts             # Supabase client configuration
```

## Features

✅ **Homepage Gallery**
- Responsive grid layout
- Wallpaper thumbnails with metadata
- Category and tag display

✅ **Individual Wallpaper Pages**
- Full-size wallpaper display
- Download functionality
- SEO-optimized metadata
- OpenGraph support

✅ **Database Integration**
- Supabase for metadata storage
- Optimized queries with indexing
- Row Level Security enabled

✅ **Modern UI**
- Tailwind CSS styling
- Dark mode support
- Responsive design
- Lucide React icons

## Adding New Wallpapers

Since there's no admin interface, add wallpapers manually:

1. Upload image to Cloudflare R2
2. Get the public URL
3. Insert into Supabase using the dashboard or SQL:

```sql
INSERT INTO wallpapers (title, description, tags, category, image_url)
VALUES (
  'Your Wallpaper Title',
  'Description of the wallpaper',
  ARRAY['tag1', 'tag2', 'tag3'],
  'category_name',
  'https://your-r2-url.com/image.jpg'
);
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## SEO Features

- Dynamic metadata generation
- OpenGraph tags for social sharing
- Semantic HTML structure
- Fast loading with Next.js optimization

## Performance

- Image optimization with Next.js Image component
- Server-side rendering for better SEO
- Efficient database queries
- Responsive images with proper sizing

## Customization

- Update colors in `tailwind.config.js`
- Modify layout in `src/app/layout.tsx`
- Add new categories or features as needed
- Customize metadata and branding
