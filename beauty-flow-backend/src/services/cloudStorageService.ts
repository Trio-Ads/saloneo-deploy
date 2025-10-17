import AWS from 'aws-sdk';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import path from 'path';

// Storage provider types
export enum StorageProvider {
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
  LOCAL = 'local',
}

// Image optimization options
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  watermark?: {
    text?: string;
    image?: string;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity?: number;
  };
}

// Upload options
export interface UploadOptions {
  folder?: string;
  public?: boolean;
  optimize?: boolean;
  generateThumbnails?: boolean;
  thumbnailSizes?: Array<{ width: number; height: number; suffix: string }>;
  metadata?: Record<string, any>;
  tags?: string[];
  expiresIn?: number; // URL expiration in seconds
}

// File info
export interface FileInfo {
  url: string;
  cdnUrl?: string;
  publicId?: string;
  key?: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  thumbnails?: Record<string, string>;
  metadata?: Record<string, any>;
}

class CloudStorageService {
  private s3?: AWS.S3;
  private provider: StorageProvider;
  private cdnBaseUrl?: string;

  constructor() {
    this.provider = (process.env.STORAGE_PROVIDER as StorageProvider) || StorageProvider.S3;
    this.cdnBaseUrl = process.env.CDN_BASE_URL;

    // Initialize S3
    if (this.provider === StorageProvider.S3) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        endpoint: process.env.AWS_S3_ENDPOINT, // For S3-compatible services
        s3ForcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
      });
    }

    // Initialize Cloudinary
    if (this.provider === StorageProvider.CLOUDINARY) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    logger.info(`Cloud storage service initialized with provider: ${this.provider}`);
  }

  /**
   * Upload file to cloud storage
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<FileInfo> {
    try {
      // Optimize image if requested
      let processedBuffer = buffer;
      let imageInfo: { width?: number; height?: number; format?: string } = {};

      if (options.optimize && this.isImage(mimeType)) {
        const optimized = await this.optimizeImage(buffer, {
          quality: 85,
          progressive: true,
        });
        processedBuffer = optimized.buffer;
        imageInfo = optimized.info;
      }

      // Upload based on provider
      let result: FileInfo;
      switch (this.provider) {
        case StorageProvider.S3:
          result = await this.uploadToS3(processedBuffer, filename, mimeType, options);
          break;
        case StorageProvider.CLOUDINARY:
          result = await this.uploadToCloudinary(processedBuffer, filename, mimeType, options);
          break;
        default:
          throw new Error(`Unsupported storage provider: ${this.provider}`);
      }

      // Generate thumbnails if requested
      if (options.generateThumbnails && this.isImage(mimeType)) {
        result.thumbnails = await this.generateThumbnails(
          buffer,
          filename,
          options.thumbnailSizes || this.getDefaultThumbnailSizes()
        );
      }

      // Add CDN URL if available
      if (this.cdnBaseUrl && result.key) {
        result.cdnUrl = `${this.cdnBaseUrl}/${result.key}`;
      }

      // Cache file info
      await cacheService.set(`file:${result.key || result.publicId}`, result, {
        ttl: 3600 * 24, // 24 hours
      });

      logger.info(`File uploaded successfully: ${filename}`);
      return result;
    } catch (error) {
      logger.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<FileInfo> {
    if (!this.s3) {
      throw new Error('S3 client not initialized');
    }
    
    const key = this.generateKey(filename, options.folder);
    const bucket = process.env.AWS_S3_BUCKET!;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: options.public ? 'public-read' : 'private',
      Metadata: options.metadata || {},
      CacheControl: 'max-age=31536000', // 1 year
    };

    if (options.tags) {
      params.Tagging = options.tags.map(tag => `${tag}=${tag}`).join('&');
    }

    const result = await this.s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key,
      size: buffer.length,
      format: path.extname(filename).substring(1),
      metadata: options.metadata,
    };
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: this.generatePublicId(filename),
          resource_type: 'auto',
          tags: options.tags,
          context: options.metadata,
          type: options.public ? 'upload' : 'authenticated',
          transformation: options.optimize ? [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
          ] : undefined,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              size: result.bytes,
              format: result.format,
              width: result.width,
              height: result.height,
              metadata: options.metadata,
            });
          }
        }
      );

      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Delete file from cloud storage
   */
  async deleteFile(keyOrPublicId: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case StorageProvider.S3:
          if (!this.s3) {
            throw new Error('S3 client not initialized');
          }
          await this.s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: keyOrPublicId,
          }).promise();
          break;
        case StorageProvider.CLOUDINARY:
          await cloudinary.uploader.destroy(keyOrPublicId);
          break;
      }

      // Remove from cache
      await cacheService.delete(`file:${keyOrPublicId}`);

      logger.info(`File deleted: ${keyOrPublicId}`);
      return true;
    } catch (error) {
      logger.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(keyOrPublicId: string, expiresIn: number = 3600): Promise<string> {
    try {
      switch (this.provider) {
        case StorageProvider.S3:
          if (!this.s3) {
            throw new Error('S3 client not initialized');
          }
          return this.s3.getSignedUrl('getObject', {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: keyOrPublicId,
            Expires: expiresIn,
          });
        case StorageProvider.CLOUDINARY:
          return cloudinary.url(keyOrPublicId, {
            sign_url: true,
            type: 'authenticated',
            expire_at: Math.floor(Date.now() / 1000) + expiresIn,
          });
        default:
          throw new Error('Signed URLs not supported for this provider');
      }
    } catch (error) {
      logger.error('Get signed URL error:', error);
      throw error;
    }
  }

  /**
   * Optimize image using Sharp
   */
  private async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
    let pipeline = sharp(buffer);

    // Resize if dimensions provided
    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    // Convert format if specified
    if (options.format) {
      switch (options.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: options.quality || 85,
            progressive: options.progressive !== false,
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality: options.quality || 90,
            progressive: options.progressive !== false,
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({
            quality: options.quality || 85,
          });
          break;
        case 'avif':
          pipeline = pipeline.avif({
            quality: options.quality || 80,
          });
          break;
      }
    }

    // Add watermark if specified
    if (options.watermark?.text) {
      const watermarkBuffer = await this.createTextWatermark(
        options.watermark.text,
        options.watermark.opacity || 0.5
      );
      pipeline = pipeline.composite([{
        input: watermarkBuffer,
        gravity: this.getWatermarkGravity(options.watermark.position),
      }]);
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { buffer: data, info };
  }

  /**
   * Generate thumbnails
   */
  private async generateThumbnails(
    buffer: Buffer,
    filename: string,
    sizes: Array<{ width: number; height: number; suffix: string }>
  ): Promise<Record<string, string>> {
    const thumbnails: Record<string, string> = {};

    for (const size of sizes) {
      const optimized = await this.optimizeImage(buffer, {
        width: size.width,
        height: size.height,
        quality: 80,
        format: 'jpeg',
      });

      const thumbnailFilename = this.addSuffixToFilename(filename, size.suffix);
      const result = await this.uploadFile(
        optimized.buffer,
        thumbnailFilename,
        'image/jpeg',
        { optimize: false }
      );

      thumbnails[size.suffix] = result.cdnUrl || result.url;
    }

    return thumbnails;
  }

  /**
   * Create text watermark
   */
  private async createTextWatermark(text: string, opacity: number): Promise<Buffer> {
    const svg = `
      <svg width="200" height="50">
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
              font-family="Arial" font-size="20" fill="white" 
              opacity="${opacity}">${text}</text>
      </svg>
    `;
    return Buffer.from(svg);
  }

  /**
   * Helper methods
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private generateKey(filename: string, folder?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${timestamp}-${random}-${sanitized}`;
    return folder ? `${folder}/${key}` : key;
  }

  private generatePublicId(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const name = path.basename(filename, path.extname(filename));
    return `${name}_${timestamp}_${random}`;
  }

  private addSuffixToFilename(filename: string, suffix: string): string {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    return `${name}_${suffix}${ext}`;
  }

  private getWatermarkGravity(position?: string): string {
    const gravityMap: Record<string, string> = {
      'center': 'center',
      'top-left': 'northwest',
      'top-right': 'northeast',
      'bottom-left': 'southwest',
      'bottom-right': 'southeast',
    };
    return gravityMap[position || 'center'] || 'center';
  }

  private getDefaultThumbnailSizes() {
    return [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 300, height: 300, suffix: 'small' },
      { width: 600, height: 600, suffix: 'medium' },
    ];
  }

  /**
   * Get CDN URL for optimized images
   */
  getCDNUrl(
    keyOrPublicId: string,
    transformations?: ImageOptimizationOptions
  ): string {
    if (this.provider === StorageProvider.CLOUDINARY && transformations) {
      const transforms: any[] = [];
      
      if (transformations.width || transformations.height) {
        transforms.push({
          width: transformations.width,
          height: transformations.height,
          crop: transformations.fit || 'fill',
        });
      }
      
      if (transformations.quality) {
        transforms.push({ quality: transformations.quality });
      }
      
      if (transformations.format) {
        transforms.push({ fetch_format: transformations.format });
      }
      
      return cloudinary.url(keyOrPublicId, {
        transformation: transforms,
        secure: true,
      });
    }
    
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl}/${keyOrPublicId}`;
    }
    
    return keyOrPublicId;
  }
}

// Export singleton instance
export const cloudStorageService = new CloudStorageService();
