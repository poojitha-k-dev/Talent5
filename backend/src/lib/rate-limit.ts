import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting middleware.
 *
 * Prefers the `express-rate-limit` package when it is installed. If it is not
 * available (e.g. dependencies not yet installed in an environment), it falls
 * back to a minimal, dependency-free in-memory limiter so the application still
 * starts and still enforces a limit. The fallback is per-process only and is
 * NOT suitable for multi-instance production — install express-rate-limit (and
 * ideally a shared store such as Redis) for real deployments.
 */

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

// Attempt to load express-rate-limit lazily. require is used (not import) so a
// missing module degrades gracefully instead of breaking the build/runtime.
function tryLoadExpressRateLimit(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('express-rate-limit');
    return mod && (mod.default || mod);
  } catch {
    return null;
  }
}

const expressRateLimit = tryLoadExpressRateLimit();

/**
 * Minimal fixed-window in-memory limiter used only when express-rate-limit is
 * not installed. Keyed by client IP (honoring X-Forwarded-For first hop).
 */
function fallbackLimiter(options: RateLimitOptions): Middleware {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Periodically clear expired entries to bound memory.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, Math.max(options.windowMs, 60_000));
  // Do not keep the event loop alive solely for the sweep timer.
  if (typeof sweep.unref === 'function') sweep.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const fwd = (req.headers['x-forwarded-for'] as string) || '';
    const key = (fwd.split(',')[0].trim() || req.socket.remoteAddress || 'unknown').toLowerCase();
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > options.max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: options.message || 'Too many requests. Please try again later.' },
      });
    }
    return next();
  };
}

/**
 * Create a rate-limit middleware with the given options.
 */
export function createRateLimiter(options: RateLimitOptions): Middleware {
  if (expressRateLimit) {
    return expressRateLimit({
      windowMs: options.windowMs,
      max: options.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: options.message || 'Too many requests. Please try again later.' },
      },
    });
  }
  return fallbackLimiter(options);
}

// Shared limiters for sensitive endpoints.

// Authentication: protect against credential stuffing / brute force.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please wait a few minutes and try again.',
});

// Password reset request / verification: protect against OTP brute force and
// email bombing.
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset attempts. Please wait before trying again.',
});

// Write-heavy social actions (likes, comments, follows): abuse / spam control.
export const writeActionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'You are performing actions too quickly. Please slow down.',
});

// Payment webhook endpoint: burst protection (does not replace signature checks).
export const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Webhook rate limit exceeded.',
});
