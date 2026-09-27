import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { storage } from '../lib/storage';

const router = Router();

// GET /api/v1/media/stream/:key(*)
router.get('/stream/:key(*)', (req: Request, res: Response) => {
  try {
    const rawKey = req.params.key;
    const key = decodeURIComponent(rawKey);
    const filePath = storage.getLocalFilePath(key);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Media asset "${key}" not found.` } });
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
