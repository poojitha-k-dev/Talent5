import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to upload media to Talent5.',
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fileName, contentType, sizeBytes, prefix = 'creators' } = body;

    if (!fileName || !contentType || typeof sizeBytes !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'fileName, contentType, and numeric sizeBytes are required for generating an upload ticket.',
          },
        },
        { status: 400 }
      );
    }

    const validation = storage.validateMedia(contentType, sizeBytes);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    const ticket = await storage.generateUploadTicket(fileName, contentType, sizeBytes);

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (err: any) {
    console.error('Upload ticket error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_TICKET_ERROR',
          message: err.message || 'Failed to generate secure upload ticket.',
        },
      },
      { status: 500 }
    );
  }
}
