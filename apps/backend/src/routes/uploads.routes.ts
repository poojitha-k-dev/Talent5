import { Router, Request, Response } from 'express';
import { storage } from '../lib/storage';
import { getUserFromRequest } from '../lib/auth';

const router = Router();

// POST /api/v1/uploads/ticket
router.post('/ticket', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be signed in to upload media to Talent5.',
        },
      });
    }

    const { fileName, contentType, sizeBytes, prefix = 'creators' } = req.body;

    if (!fileName || !contentType || typeof sizeBytes !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'fileName, contentType, and numeric sizeBytes are required for generating an upload ticket.',
        },
      });
    }

    const validation = storage.validateMedia(contentType, sizeBytes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: validation.error,
        },
      });
    }

    const ticket = await storage.generateUploadTicket(fileName, contentType, sizeBytes);

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err: any) {
    console.error('Upload ticket error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_TICKET_ERROR',
        message: err.message || 'Failed to generate secure upload ticket.',
      },
    });
  }
});

export default router;
