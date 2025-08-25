# Wallpaper Publisher Application

A Python Tkinter desktop application for uploading and managing wallpapers with AI-powered metadata generation.

## Features

### 🖼️ Image Management
- **Image Selection**: Browse and select wallpaper images (JPEG, PNG, BMP, GIF, TIFF)
- **Live Preview**: See a thumbnail preview of selected images
- **Validation**: Automatic image format validation

### 🤖 AI-Powered Metadata Generation
- **Google Gemini Integration**: Uses Gemini 2.0 Flash model for intelligent metadata generation
- **Automatic Generation**: Creates SEO-optimized titles, descriptions, categories, and tags
- **Editable Results**: Review and modify AI-generated metadata before publishing

### ☁️ Cloud Integration
- **Cloudflare R2 Storage**: Uploads images to your R2 bucket with unique filenames
- **Supabase Database**: Stores wallpaper metadata with proper indexing
- **Public URLs**: Generates public URLs for uploaded images

### 🔒 Security & Configuration
- **Environment Variables**: Uses the same `.env.local` file as your Next.js application
- **Secure API Keys**: Keeps sensitive credentials secure
- **Row Level Security**: Respects Supabase RLS policies

## Prerequisites

- Python 3.7 or higher
- Configured `.env.local` file with Supabase and Cloudflare R2 credentials
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

### 1. Automatic Setup (Recommended)
```bash
python setup_wallpaper_publisher.py
```

### 2. Manual Setup
```bash
pip install -r wallpaper_publisher_requirements.txt
```

## Usage

### 1. Start the Application
```bash
python wallpaper_publisher.py
```

### 2. Configure Gemini API Key
- Enter your Google Gemini API key in the application
- The key is not stored permanently for security

### 3. Upload Wallpapers
1. **Select Image**: Click "Select Wallpaper Image" to choose a file
2. **Generate Metadata**: Click "Generate Metadata with AI" to auto-generate:
   - SEO-optimized title
   - Relevant description
   - Appropriate category
   - Related tags
3. **Review & Edit**: Modify the generated metadata if needed
4. **Publish**: Click "Publish Wallpaper" to upload to R2 and save to database

## Application Interface

### Main Sections

#### 🖼️ Image Selection
- File browser for selecting wallpaper images
- Displays selected filename
- Shows image preview

#### 🤖 AI Metadata Generation  
- Gemini API key input field
- Generate button (enabled when image and API key are provided)
- Uses advanced AI to analyze images and create metadata

#### ✏️ Metadata Editing
- **Title**: SEO-optimized wallpaper title
- **Category**: Dropdown with predefined categories (nature, minimal, abstract, urban, space, art)
- **Tags**: Comma-separated list of relevant tags
- **Description**: Detailed description for SEO

#### 📊 Progress & Status
- Progress bar for upload operations
- Status messages with color coding
- Real-time feedback

## Environment Configuration

The application reads from your existing `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-url.r2.dev
```

## AI Metadata Generation

### Gemini 2.0 Flash Model
- **Advanced Analysis**: Analyzes image content, colors, composition, and style
- **SEO Optimization**: Generates titles and descriptions optimized for search engines
- **Smart Categorization**: Automatically selects the most appropriate category
- **Relevant Tagging**: Creates 3-5 relevant tags based on image content

### Generated Metadata Format
```json
{
  "title": "Mountain Sunset Landscape - 4K Nature Wallpaper",
  "description": "Breathtaking mountain sunset with golden hour lighting perfect for desktop backgrounds",
  "category": "nature",
  "tags": ["mountains", "sunset", "landscape", "golden hour", "nature"]
}
```

## Error Handling

### Common Issues & Solutions

#### ❌ "Missing environment variables"
- Ensure `.env.local` file exists in the project directory
- Verify all required variables are uncommented and have values

#### ❌ "Failed to initialize services"
- Check Supabase URL and API key
- Verify R2 credentials and bucket exists
- Ensure internet connectivity

#### ❌ "AI generation failed"
- Verify Gemini API key is correct
- Check if you have API quota remaining
- Ensure image file is not corrupted

#### ❌ "Upload failed"
- Check R2 bucket permissions
- Verify bucket name and public URL
- Ensure sufficient storage quota

## File Structure

```
wallpaper_publisher.py              # Main application
setup_wallpaper_publisher.py        # Setup script
wallpaper_publisher_requirements.txt # Python dependencies
WALLPAPER_PUBLISHER_README.md       # This documentation
.env.local                          # Environment configuration (shared with Next.js)
```

## Integration with Next.js Application

The Python application seamlessly integrates with your existing Next.js wallpaper gallery:

- **Shared Configuration**: Uses the same `.env.local` file
- **Database Compatibility**: Inserts data in the same format as your web application
- **Storage Integration**: Uploads to the same R2 bucket
- **Immediate Availability**: Published wallpapers appear instantly in your web gallery

## Security Best Practices

- ✅ API keys are entered at runtime, not stored in files
- ✅ Uses environment variables for sensitive configuration
- ✅ Respects Supabase Row Level Security policies
- ✅ Generates unique filenames to prevent conflicts
- ✅ Validates file types and sizes

## Troubleshooting

### Debug Mode
Add debug prints by modifying the `update_status` calls in the code.

### Log Files
Check the console output for detailed error messages.

### Testing Connection
The application tests Supabase and R2 connections on startup.

## Contributing

To extend the application:

1. **Add New Categories**: Modify the `category_combo` values
2. **Custom AI Prompts**: Edit the prompt in `_generate_metadata_thread`
3. **Additional Metadata Fields**: Add new UI elements and database fields
4. **Batch Processing**: Implement multiple file selection and processing

## License

This application is part of the Wallpaper Gallery project and follows the same licensing terms.
