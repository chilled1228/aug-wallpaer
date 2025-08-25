import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/image-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const tags = formData.get('tags') as string;
    const quality = parseInt(formData.get('quality') as string) || 85;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = ImageService.validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid file', details: validation.errors },
        { status: 400 }
      );
    }

    // Compress image if needed
    const compressedFile = await ImageService.compressImage(file, quality / 100);

    // Upload and process image
    const processedImage = await ImageService.uploadImage({
      file: compressedFile,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      quality,
      generateThumbnails: true
    });

    return NextResponse.json({
      success: true,
      image: processedImage
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const width = searchParams.get('w');
  const height = searchParams.get('h');
  const quality = searchParams.get('q');
  const format = searchParams.get('f');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const optimizedUrl = ImageService.getOptimizedUrl(url, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : 85,
      format: format as any || 'webp'
    });

    return NextResponse.json({
      optimizedUrl,
      srcSet: ImageService.generateSrcSet(url)
    });

  } catch (error) {
    console.error('URL optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize URL' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');
    const category = searchParams.get('category');

    if (!imageId || !category) {
      return NextResponse.json(
        { error: 'Image ID and category are required' },
        { status: 400 }
      );
    }

    await ImageService.deleteImage(imageId, category);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
