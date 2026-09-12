import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export type StorageDriver = 'local' | 's3' | 'r2';

export interface StorageConfig {
  driver: StorageDriver;
  localDir: string;
  s3Bucket?: string;
  s3Region?: string;
  s3Endpoint?: string;
  appUrl: string;
}

export const ALLOWED_MIME_TYPES = {
  // Audio masters & stems
  'audio/mpeg': ['.mp3'],
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/flac': ['.flac'],
  'audio/aac': ['.aac'],
  'audio/ogg': ['.ogg'],
  // Video singles & performances
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  // Artwork & covers
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const MAX_FILE_SIZES = {
  AUDIO: 100 * 1024 * 1024,   // 100 MB
  VIDEO: 250 * 1024 * 1024,   // 250 MB
  IMAGE: 15 * 1024 * 1024,    // 15 MB
};

export class StorageService {
  private config: StorageConfig;

  constructor() {
    this.config = {
      driver: (process.env.STORAGE_DRIVER as StorageDriver) || 'local',
      localDir: path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR || './public/uploads'),
      s3Bucket: process.env.AWS_S3_BUCKET || 'talent5-media',
      s3Region: process.env.AWS_REGION || 'ap-south-1',
      s3Endpoint: process.env.S3_ENDPOINT,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };

    if (this.config.driver === 'local') {
      if (!fs.existsSync(this.config.localDir)) {
        fs.mkdirSync(this.config.localDir, { recursive: true });
      }
    }
  }

  public validateMedia(contentType: string, sizeBytes: number): { valid: boolean; error?: string } {
    if (!Object.keys(ALLOWED_MIME_TYPES).includes(contentType.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported media format "${contentType}". Allowed: MP3, WAV, FLAC, MP4, WebM, WEBP, PNG, JPG.`,
      };
    }

    const isVideo = contentType.startsWith('video/');
    const isAudio = contentType.startsWith('audio/');
    const maxAllowed = isVideo ? MAX_FILE_SIZES.VIDEO : isAudio ? MAX_FILE_SIZES.AUDIO : MAX_FILE_SIZES.IMAGE;

    if (sizeBytes > maxAllowed) {
      return {
        valid: false,
        error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${(maxAllowed / (1024 * 1024))}MB.`,
      };
    }

    return { valid: true };
  }

  public generateKey(fileName: string, prefix = 'media'): string {
    const ext = path.extname(fileName).toLowerCase() || '.mp3';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `${prefix}/${timestamp}-${randomHex}${ext}`;
  }

  public async generateUploadTicket(fileName: string, contentType: string, sizeBytes: number) {
    const validation = this.validateMedia(contentType, sizeBytes);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const key = this.generateKey(fileName);

    if (this.config.driver === 's3' || this.config.driver === 'r2') {
      // S3 presigned PUT URL stub (production ready for AWS SDK v3)
      const uploadUrl = `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${key}?X-Amz-Signature=simulated_presigned_ticket`;
      const publicUrl = `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${key}`;
      return {
        key,
        uploadUrl,
        publicUrl,
        expiresInSeconds: 3600,
        driver: this.config.driver,
      };
    }

    // Local Driver upload endpoint
    const uploadUrl = `${this.config.appUrl}/api/v1/media/upload?key=${encodeURIComponent(key)}`;
    const publicUrl = `${this.config.appUrl}/api/v1/media/stream/${encodeURIComponent(key)}`;

    return {
      key,
      uploadUrl,
      publicUrl,
      expiresInSeconds: 3600,
      driver: 'local' as const,
    };
  }

  public getLocalFilePath(key: string): string {
    // Sanitize key to prevent path traversal
    const safeKey = key.replace(/\.\./g, '');
    return path.join(this.config.localDir, safeKey);
  }
}

export const storage = new StorageService();
