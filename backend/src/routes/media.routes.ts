import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { storage } from '../lib/storage';
import mediaMapRaw from '../lib/media-catalog-map.json';

const router = Router();
const mediaMap: Record<string, string> = mediaMapRaw as Record<string, string>;

const DEFAULT_FALLBACK_URL =
  'https://archive.org/download/01SundariNeeDivyaRUpamuJUDaMALavika/01%20-%20sundari%20nee%20divya%20rUpamu%20jUDa%20-%20mALavika.mp3';

const inFlightDownloads = new Set<string>();

// GET /api/v1/media/stream/:key(*)
router.get('/stream/:key(*)', async (req: Request, res: Response) => {
  try {
    const rawKey = req.params.key;
    const key = path.basename(decodeURIComponent(rawKey));
    const filePath = storage.getLocalFilePath(key);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1000) {
      // Remote lookup
      let remoteUrl =
        mediaMap[key] ||
        mediaMap[key.toLowerCase()] ||
        mediaMap[key.replace(/\.mp3$/, '') + '.mp3'] ||
        mediaMap[key.replace(/_/g, '-')];

      if (!remoteUrl) {
        const baseName = key.replace(/\.mp3$/, '').toLowerCase();
        const matchedKey = Object.keys(mediaMap).find((k) =>
          k.toLowerCase().includes(baseName) || baseName.includes(k.replace(/\.mp3$/, '').toLowerCase())
        );
        if (matchedKey) {
          remoteUrl = mediaMap[matchedKey];
        }
      }

      if (!remoteUrl) {
        remoteUrl = DEFAULT_FALLBACK_URL;
      }

      const forwardHeaders: Record<string, string> = {};
      if (req.headers.range) {
        forwardHeaders['Range'] = req.headers.range;
      }

      let remoteRes = await fetch(remoteUrl, {
        headers: forwardHeaders,
        redirect: 'follow',
      });

      if (!remoteRes.ok && remoteRes.status !== 206) {
        remoteRes = await fetch(DEFAULT_FALLBACK_URL, {
          headers: forwardHeaders,
          redirect: 'follow',
        });
      }

      // Background download
      if (!inFlightDownloads.has(key) && !req.headers.range) {
        inFlightDownloads.add(key);
        fetch(remoteUrl, { redirect: 'follow' })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.arrayBuffer();
          })
          .then((buf) => {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, Buffer.from(buf));
          })
          .catch(() => {})
          .finally(() => inFlightDownloads.delete(key));
      }

      const contentType = remoteRes.headers.get('content-type') || 'audio/mpeg';
      const contentLength = remoteRes.headers.get('content-length');
      const contentRange = remoteRes.headers.get('content-range');

      res.status(remoteRes.status);
      res.setHeader('Content-Type', contentType.startsWith('audio') ? contentType : 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (contentRange) res.setHeader('Content-Range', contentRange);

      const arrayBuffer = await remoteRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = req.headers.range;

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

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      let start = parts[0] ? parseInt(parts[0], 10) : 0;
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= fileSize) end = fileSize - 1;

      if (start >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).end();
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err: any) {
    console.error('Streaming error:', err);
    return res.status(500).json({ success: false, error: { code: 'STREAMING_ERROR', message: err.message } });
  }
});

// GET /api/v1/media/upload-url
router.get('/upload-url', async (req: Request, res: Response) => {
  try {
    const fileName = req.query.fileName as string;
    const contentType = req.query.contentType as string;
    const sizeBytes = parseInt(req.query.sizeBytes as string, 10);

    if (!fileName || !contentType || isNaN(sizeBytes)) {
      return res.status(400).json({ success: false, message: 'fileName, contentType, sizeBytes are required' });
    }

    const ticket = await storage.generateUploadTicket(fileName, contentType, sizeBytes);
    return res.status(200).json({ success: true, data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
