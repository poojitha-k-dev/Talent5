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

    const buffer = Buffer.from(await req.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/v1/media/stream/${encodeURIComponent(key)}`;

    return NextResponse.json({
      success: true,
      data: {
        key,
        sizeBytes: buffer.length,
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
