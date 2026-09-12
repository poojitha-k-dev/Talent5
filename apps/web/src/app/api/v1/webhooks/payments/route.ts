import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, processPayoutWebhook, PayoutWebhookPayload } from '@/lib/payout-gateway';

export async function POST(req: NextRequest) {
  try {
    const signature =
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-razorpay-signature') ||
      req.headers.get('x-cashfree-signature');

    const rawBody = await req.text();

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed.' } },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody) as PayoutWebhookPayload;

    const result = await processPayoutWebhook(payload);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error processing payment webhook:', err);
    return NextResponse.json(
      { success: false, error: { code: 'WEBHOOK_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
