# Security Notes

This document records security controls and the follow-up steps that must be
performed in an environment with Node.js/npm available (the hardening was done
in an environment without them, so builds, installs, and scanners could not be
executed there).

## Rate limiting (implemented)

Rate limiting is implemented in `backend/src/lib/rate-limit.ts` and applied to:

- `POST /api/v1/auth/login`, `/register`, `/change-password` — 10 requests / 15 min per IP
- `POST /api/v1/auth/forgot-password`, `/reset-password` — 5 requests / hour per IP
- `POST /api/v1/social/like`, `/comments`, `/follow` — 30 requests / min per IP
- `POST /api/v1/webhooks/payments` — 60 requests / min per IP (in addition to HMAC signature verification)

The limiter uses the `express-rate-limit` package when installed, and otherwise
falls back to a built-in in-memory limiter so the app still enforces limits.

### Required follow-up

1. Install the dependency so the robust implementation is used:
   ```
   npm install
   ```
   (`express-rate-limit` is now in `backend/package.json`.)
2. For multi-instance / production deployments, back the limiter with a shared
   store (e.g. Redis via `rate-limit-redis`) so limits are enforced across
   instances rather than per-process.
3. `app.set('trust proxy', 1)` is set in `backend/src/server.ts` so client IPs
   are read correctly behind the nginx reverse proxy. Adjust the hop count if
   your proxy topology differs.

## Security headers / CSP / CORP

API responses set strict headers in `backend/src/server.ts`
(`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Cross-Origin-Resource-Policy: same-site`, a JSON-only `Content-Security-Policy`,
and HSTS in production). nginx mirrors the basic headers.

The media streaming route (`GET /api/v1/media/stream/...`) overrides these for
its own responses (`Cross-Origin-Resource-Policy: cross-origin` and no document
CSP) so that browser `<audio>`/`<img>`/`<video>` elements can embed media
cross-origin without being blocked.

### Required follow-up

- HSTS is emitted by the backend only in production and is only meaningful when
  TLS is terminated at the edge. Terminate TLS at nginx/your load balancer and
  confirm HSTS reaches the client. The bundled `infrastructure/nginx/nginx.conf`
  listens on plain HTTP (port 80) and does not terminate TLS.
- Verify media playback end-to-end in your real deployment topology.

## Dependency audit

A dependency audit could not be run during hardening (npm unavailable). Run it
in a Node environment:

```
npm install
npm run audit        # production deps across workspaces
npm run audit:all    # includes dev deps and the workspace root
```

Review and remediate findings with targeted upgrades (avoid
`npm audit fix --force` without reviewing breaking changes).

### Known items to review

- `prisma` was pinned from a release candidate (`^8.0.0-rc.17`) to the stable
  line (`^8.0.0`). After `npm install`, confirm the lockfile updated and the
  Prisma CLI/schema still work.
- The `postinstall` script runs `prisma skills sync` on every install; review
  whether this should run in CI/production installs.
- Reconcile cross-workspace version drift (e.g. `nodemailer`, `resend` differ
  between `backend` and `frontend`) once an audit baseline exists.

## Outstanding (not code) — credential rotation

Secrets that were previously committed remain in git history and on the remote,
and must be treated as compromised and rotated at the provider side:

- Supabase database password (and pooler role if possible)
- `JWT_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- Every value that was present in the previously committed `.env`
  (e.g. `EMAIL_APP_PASSWORD`, `RESEND_API_KEY`, any real AWS keys,
  `SUPABASE_SERVICE_ROLE_KEY`, `SEED_ADMIN_PASSWORD`)
