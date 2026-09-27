import { Router, Request, Response } from 'express';
import { verifyWebhookSignature, processPayoutWebhook, PayoutWebhookPayload } from '../lib/payout-gateway';

const router = Router();

// POST /api/v1/webhooks/payments
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const signature =
      (req.headers['x-webhook-signature'] as string) ||
      (req.headers['x-razorpay-signature'] as string) ||
      (req.headers['x-cashfree-signature'] as string);

    // In Express with json body parser, we can serialize body or check req.body
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed.' },
      });
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody) as PayoutWebhookPayload;

    const result = await processPayoutWebhook(payload);

    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error processing payment webhook:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_ERROR', message: err.message },
    });
  }
});

export default router;
