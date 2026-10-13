import { Router, Request, Response } from 'express';
import { verifyWebhookSignature, processPayoutWebhook, PayoutWebhookPayload } from '../lib/payout-gateway';
import { webhookLimiter } from '../lib/rate-limit';

const router = Router();

// POST /api/v1/webhooks/payments
router.post('/payments', webhookLimiter, async (req: Request, res: Response) => {
  try {
    const signature =
      (req.headers['x-webhook-signature'] as string) ||
      (req.headers['x-razorpay-signature'] as string) ||
      (req.headers['x-cashfree-signature'] as string);

    // Verify the HMAC over the EXACT raw bytes received (captured by the
    // express.json verify hook in server.ts). Re-serializing the parsed body
    // would change ordering/whitespace and break signature verification.
    const rawBuffer: Buffer | undefined = (req as any).rawBody;
    const rawBody = rawBuffer ? rawBuffer.toString('utf8') : '';

    if (!signature || !rawBody || !verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed.' },
      });
    }

    const payload = (req.body ?? JSON.parse(rawBody)) as PayoutWebhookPayload;

    const result = await processPayoutWebhook(payload);

    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error processing payment webhook:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_ERROR', message: 'Failed to process webhook.' },
    });
  }
});

export default router;
