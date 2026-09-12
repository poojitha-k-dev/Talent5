import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required for media uploads.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fileName, contentType, sizeBytes } = body;

    if (!fileName || !contentType || !sizeBytes) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'fileName, contentType, and sizeBytes are required.' } },
        { status: 400 }
      );
    }

    const ticket = await storage.generateUploadTicket(fileName, contentType, sizeBytes);

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_TICKET_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
