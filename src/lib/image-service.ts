import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.storage.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
});

export interface ImageUploadOptions {
  file: File;
  category: string;
  tags?: string[];
  quality?: number;
  generateThumbnails?: boolean;
}

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ProcessedImage {
  id: string;
  originalUrl: string;
  variants: ImageVariant[];
  metadata: {
    originalWidth: number;
    originalHeight: number;
    originalSize: number;
    format: string;
    colorPalette?: string[];
  };
}

export class ImageService {
  // Upload and process image
  static async uploadImage(options: ImageUploadOptions): Promise<ProcessedImage> {
    const { file, category, tags = [], quality = 85, generateThumbnails = true } = options;
    
    // Generate unique ID
    const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    try {
      // Upload original image
      const originalKey = `wallpapers/${category}/${imageId}.${fileExtension}`;
      const uploadCommand = new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: originalKey,
        Body: await file.arrayBuffer(),
        ContentType: file.type,
        Metadata: {
          category,
          tags: tags.join(','),
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(uploadCommand);
      
      const originalUrl = `${config.storage.publicUrl}/${originalKey}`;
      
      // Get image metadata
      const metadata = await this.getImageMetadata(file);
      
      // Generate variants if requested
      const variants: ImageVariant[] = [];
      
      if (generateThumbnails) {
        const sizes = [400, 800, 1200, 1920];
        
        for (const size of sizes) {
          // In a real implementation, you'd use an image processing service
          // For now, we'll create URL variants that can be processed by Next.js
          variants.push({
            url: originalUrl,
            width: size,
            height: Math.round((size * metadata.originalHeight) / metadata.originalWidth),
            format: 'webp',
            size: Math.round(file.size * (size / metadata.originalWidth))
          });
        }
      }

      return {
        id: imageId,
        originalUrl,
        variants,
        metadata
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Get image metadata
  static async getImageMetadata(file: File): Promise<ProcessedImage['metadata']> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Extract dominant colors (simplified)
          const colorPalette = this.extractColors(ctx, img.width, img.height);
          
          resolve({
            originalWidth: img.width,
            originalHeight: img.height,
            originalSize: file.size,
            format: file.type,
            colorPalette
          });
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Extract dominant colors from image
  static extractColors(ctx: CanvasRenderingContext2D, width: number, height: number): string[] {
    // Sample pixels from the image
    const sampleSize = 10;
    const colors: { [key: string]: number } = {};
    
    for (let x = 0; x < width; x += sampleSize) {
      for (let y = 0; y < height; y += sampleSize) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
        colors[hex] = (colors[hex] || 0) + 1;
      }
    }
    
    // Return top 5 colors
    return Object.entries(colors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);
  }

  // Generate optimized image URL
  static getOptimizedUrl(baseUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}): string {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;

    // If using Cloudflare Images or similar service, build transformation URL
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('f', format);
    params.set('q', quality.toString());
    params.set('fit', fit);

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate responsive image srcset
  static generateSrcSet(baseUrl: string, sizes: number[] = [400, 800, 1200, 1920]): string {
    return sizes
      .map(size => `${this.getOptimizedUrl(baseUrl, { width: size })} ${size}w`)
      .join(', ');
  }

  // Generate blur placeholder
  static async generateBlurPlaceholder(imageUrl: string): Promise<string> {
    try {
      // Create a small version of the image for blur placeholder
      const blurUrl = this.getOptimizedUrl(imageUrl, {
        width: 40,
        height: 40,
        quality: 20,
        format: 'jpeg'
      });
      
      // Convert to base64 data URL
      const response = await fetch(blurUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating blur placeholder:', error);
      // Return a simple gray placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
    }
  }

  // Delete image and all variants
  static async deleteImage(imageId: string, category: string): Promise<void> {
    try {
      const key = `wallpapers/${category}/${imageId}`;
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Get signed URL for secure uploads
  static async getUploadUrl(fileName: string, category: string): Promise<string> {
    const key = `wallpapers/${category}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  }

  // Validate image file
  static validateImageFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Advanced image compression with multiple strategies
  static async compressImage(file: File, options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'webp' | 'png';
    progressive?: boolean;
  } = {}): Promise<File> {
    const {
      quality = 0.8,
      maxWidth = 2048,
      maxHeight = 2048,
      format = 'jpeg',
      progressive = true
    } = options;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        // Resize if needed
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Apply image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image with optimal settings
          ctx.drawImage(img, 0, 0, width, height);

          // Apply sharpening filter for better quality
          if (format === 'jpeg' || format === 'webp') {
            this.applySharpeningFilter(ctx, width, height);
          }

          const mimeType = `image/${format}`;

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob],
                this.generateOptimizedFileName(file.name, format), {
                type: mimeType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, mimeType, quality);
        } else {
          resolve(file);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Apply sharpening filter to improve compressed image quality
  private static applySharpeningFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const output = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * sharpenKernel[kernelIdx];
            }
          }
          const outputIdx = (y * width + x) * 4 + c;
          output[outputIdx] = Math.max(0, Math.min(255, sum));
        }
        // Copy alpha channel
        const alphaIdx = (y * width + x) * 4 + 3;
        output[alphaIdx] = data[alphaIdx];
      }
    }

    const outputImageData = new ImageData(output, width, height);
    ctx.putImageData(outputImageData, 0, 0);
  }

  // Generate optimized filename
  private static generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${nameWithoutExt}_optimized_${timestamp}.${format}`;
  }

  // Batch compress multiple images
  static async compressMultipleImages(
    files: File[],
    options: Parameters<typeof ImageService.compressImage>[1] = {}
  ): Promise<File[]> {
    const compressionPromises = files.map(file => this.compressImage(file, options));
    return Promise.all(compressionPromises);
  }
}
