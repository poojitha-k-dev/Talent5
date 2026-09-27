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
  'audio/mpeg': ['.mp3'],
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-wav': ['.wav'],
  'audio/flac': ['.flac'],
  'audio/x-flac': ['.flac'],
  'audio/aac': ['.aac'],
  'audio/m4a': ['.m4a'],
  'audio/x-m4a': ['.m4a'],
  'audio/mp4': ['.m4a', '.mp4'],
  'audio/ogg': ['.ogg'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const MAX_FILE_SIZES = {
  AUDIO: 100 * 1024 * 1024,
  VIDEO: 250 * 1024 * 1024,
  IMAGE: 15 * 1024 * 1024,
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
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
    };
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
        error: `File size exceeds maximum limit.`,
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
    const safeKey = key.replace(/\.\./g, '');
    const candidatePaths = [
      path.resolve(process.cwd(), 'apps/frontend/public/media', safeKey),
      path.resolve(process.cwd(), '../frontend/public/media', safeKey),
      path.resolve(process.cwd(), '../../apps/frontend/public/media', safeKey),
      path.resolve(process.cwd(), 'public/media', safeKey),
      path.resolve(process.cwd(), '../public/media', safeKey),
      path.resolve(__dirname, '../../../../apps/frontend/public/media', safeKey),
      path.resolve(__dirname, '../../../frontend/public/media', safeKey),
      path.resolve(process.cwd(), 'public/uploads', safeKey),
      path.resolve(process.cwd(), '../frontend/public/uploads', safeKey),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // Default fallback
    return path.resolve(process.cwd(), 'apps/frontend/public/media', safeKey);
  }
}

export const storage = new StorageService();
