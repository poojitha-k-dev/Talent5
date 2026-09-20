import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_KEY', message: 'Upload key query param is required.' } },
        { status: 400 }
      );
    }

    const filePath = storage.getLocalFilePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!req.body) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_BODY', message: 'No file body payload received.' } },
        { status: 400 }
      );
    }

    // Stream directly to disk using standard WHATWG stream chunks to prevent memory buffering
    const reader = req.body.getReader();
    const fileWriteStream = fs.createWriteStream(filePath);
    let bytesWritten = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesWritten += value.byteLength || value.length;
          fileWriteStream.write(Buffer.from(value));
        }
      }
    } finally {
      fileWriteStream.end();
    }

    await new Promise<void>((resolve, reject) => {
      fileWriteStream.on('finish', () => resolve());
      fileWriteStream.on('error', (err) => reject(err));
    });

    const publicUrl = `/api/v1/media/stream/${encodeURIComponent(key)}`;

    return NextResponse.json({
      success: true,
      data: {
        key,
        sizeBytes: bytesWritten,
        publicUrl,
      },
    });
  } catch (err: any) {
    console.error('Error handling media file upload:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_FAILED', message: err.message } },
      { status: 500 }
    );
  }
}
