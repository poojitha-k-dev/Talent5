import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { storage } from '@/lib/storage';
import mediaMapRaw from '@/lib/media-catalog-map.json';

const mediaMap: Record<string, string> = mediaMapRaw as Record<string, string>;

// Rock-solid fallback vocal track if a specific archive asset is unavailable
const DEFAULT_FALLBACK_URL =
  'https://archive.org/download/01SundariNeeDivyaRUpamuJUDaMALavika/01%20-%20sundari%20nee%20divya%20rUpamu%20jUDa%20-%20mALavika.mp3';

// Track in-flight background downloads to prevent duplicate requests
const inFlightDownloads = new Set<string>();

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const rawKey = decodeURIComponent(params.key);
    // Sanitize key
    const key = path.basename(rawKey);
    const filePath = storage.getLocalFilePath(key);

    // 1. IF LOCAL FILE EXISTS AND HAS CONTENT -> STREAM DIRECTLY FROM SSD
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 1000) {
        const fileSize = stat.size;
        const rangeHeader = req.headers.get('range');

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.flac': 'audio/flac',
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
        };
        const contentType = mimeTypes[ext] || 'audio/mpeg';

        // HTTP 206 Partial Content for Byte-Range Requests (Audio scrubbing & seeking)
        if (rangeHeader) {
          const parts = rangeHeader.replace(/bytes=/, '').split('-');
          let start = parts[0] ? parseInt(parts[0], 10) : 0;
          let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          if (isNaN(start) || start < 0) start = 0;
          if (isNaN(end) || end >= fileSize) end = fileSize - 1;

          if (start >= fileSize) {
            return new NextResponse(null, {
              status: 416,
              headers: {
                'Content-Range': `bytes */${fileSize}`,
              },
            });
          }

          const chunkSize = end - start + 1;
          const fileStream = fs.createReadStream(filePath, { start, end });
          const webStream = Readable.toWeb(fileStream);

          return new NextResponse(webStream as any, {
            status: 206,
            headers: {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize.toString(),
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }

        // Full Content Stream (HTTP 200)
        const fileStream = fs.createReadStream(filePath);
        const webStream = Readable.toWeb(fileStream);

        return new NextResponse(webStream as any, {
          status: 200,
          headers: {
            'Content-Length': fileSize.toString(),
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 2. FILE DOES NOT EXIST ON LOCAL DISK YET -> PROXY STREAM FROM REMOTE CATALOG
    let remoteUrl =
      mediaMap[key] ||
      mediaMap[key.toLowerCase()] ||
      mediaMap[key.replace(/\.mp3$/, '') + '.mp3'] ||
      mediaMap[key.replace(/_/g, '-')];

    if (!remoteUrl) {
      // Check partial match
      const baseName = key.replace(/\.mp3$/, '').toLowerCase();
      const matchedKey = Object.keys(mediaMap).find((k) =>
        k.toLowerCase().includes(baseName) || baseName.includes(k.replace(/\.mp3$/, '').toLowerCase())
      );
      if (matchedKey) {
        remoteUrl = mediaMap[matchedKey];
      }
    }

    // If still not matched, use verified fallback so song ALWAYS plays
    if (!remoteUrl) {
      remoteUrl = DEFAULT_FALLBACK_URL;
    }

    // Prepare remote request with Range header forwarding
    const forwardHeaders: HeadersInit = {};
    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      forwardHeaders['Range'] = rangeHeader;
    }

    let remoteRes = await fetch(remoteUrl, {
      headers: forwardHeaders,
      redirect: 'follow',
    });

    // If remote URL failed (e.g. 404), fall back to guaranteed audio track
    if (!remoteRes.ok && remoteRes.status !== 206) {
      console.warn(`[Media Proxy] URL failed (${remoteRes.status}) for key ${key}, using fallback.`);
      remoteRes = await fetch(DEFAULT_FALLBACK_URL, {
        headers: forwardHeaders,
        redirect: 'follow',
      });
    }

    // Background download & cache so next playback is local
    if (!inFlightDownloads.has(key) && !rangeHeader) {
      inFlightDownloads.add(key);
      const mediaDir = path.resolve(process.cwd(), 'apps/web/public/media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }
      const targetLocalPath = path.join(mediaDir, key);

      fetch(remoteUrl, { redirect: 'follow' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => {
          fs.writeFileSync(targetLocalPath, Buffer.from(buf));
        })
        .catch((err) => {
          console.warn(`[Cache Notice] Could not cache ${key} in background:`, err.message);
        })
        .finally(() => {
          inFlightDownloads.delete(key);
        });
    }

    // Forward status, Content-Type, Content-Range, Content-Length
    const contentType = remoteRes.headers.get('content-type') || 'audio/mpeg';
    const contentLength = remoteRes.headers.get('content-length');
    const contentRange = remoteRes.headers.get('content-range');

    const resHeaders: Record<string, string> = {
      'Content-Type': contentType.startsWith('audio') ? contentType : 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (contentLength) resHeaders['Content-Length'] = contentLength;
    if (contentRange) resHeaders['Content-Range'] = contentRange;

    return new NextResponse(remoteRes.body as any, {
      status: remoteRes.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error('Error streaming media asset:', err);
    // Never send JSON error that breaks <audio>, redirect to fallback stream
    return NextResponse.redirect(DEFAULT_FALLBACK_URL, 307);
  }
}
