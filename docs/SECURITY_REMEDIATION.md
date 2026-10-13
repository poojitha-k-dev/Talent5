# Talent5 — Security Remediation Report

This document records the security issues identified in a static (SAST) review
of the repository and the exact changes made to remediate them.

- **Branch:** `sast-security-review` (not merged to `main`)
- **Commits:** `bf81e75`, `34075de`, `1e40375`, `d0f952d`
- **Scope:** static code fixes only. See "Verification status" and "Outstanding"
  for what was NOT fully verified and what remains for the owner to do.

> Important: This is not a claim that the repository is free of vulnerabilities.
> It documents the findings that were identified and the fixes applied. No build,
> test, dependency audit, or runtime verification was performed in the environment
> where these fixes were authored (Node.js/npm/Docker/scanners were unavailable).

---

## 1. Summary table

| # | Issue | Severity | Status | Key file(s) |
|---|-------|----------|--------|-------------|
| 1 | Hardcoded secrets (JWT, webhook) with insecure fallbacks | Critical | Fixed | `backend/src/lib/auth.ts`, `payout-gateway.ts` |
| 2 | Hardcoded production DB connection string | Critical | Fixed | `backend/src/lib/db.ts` |
| 3 | Hardcoded secrets in `scripts/` (DB creds, JWT, webhook) | Critical | Fixed | ~22 files in `scripts/` |
| 4 | Hardcoded demo/seed passwords in frontend | High | Fixed | `AdminLoginGate.tsx`, `AuthModal.tsx`, `login/page.tsx` |
| 5 | Webhook signature verified over re-serialized body | High | Fixed | `webhooks.routes.ts`, `payout-gateway.ts`, `server.ts` |
| 6 | DB TLS certificate validation disabled | High | Fixed | `backend/src/lib/db.ts`, `scripts/*` |
| 7 | CORS reflected any origin with credentials | High | Fixed | `backend/src/server.ts` |
| 8 | OAuth state/CSRF unused; open redirect; token in URL; PII logging | High | Fixed | `backend/src/routes/auth.routes.ts` |
| 9 | Broken access control (IDOR) on private playlists | Medium | Fixed | `playlists.routes.ts` |
| 10 | Schema column mismatches in likes/comments/follows | High (correctness) | Fixed | `social.routes.ts`, `library.routes.ts` |
| 11 | Admin `:id` handlers re-dispatched through the router | High | Fixed | `admin.routes.ts` |
| 12 | Weak password policy + non-CSPRNG OTP | Medium | Fixed | `auth.routes.ts`, `admin.routes.ts`, `reset-tokens.ts` |
| 13 | Path traversal guard weakness | Medium | Fixed | `backend/src/lib/storage.ts` |
| 14 | Server-side request forgery (media proxy) | Medium | Fixed | `media.routes.ts` |
| 15 | Verbose error messages leaked to clients | Low | Fixed | all route files + `auth.ts`, `health.routes.ts` |
| 16 | Missing security headers | Low | Fixed | `server.ts`, `nginx.conf` |
| 17 | Docker: DB port exposed, inline secrets, no hardening | Medium | Fixed | `docker-compose.yml` |
| 18 | No rate limiting | Medium | Fixed | `backend/src/lib/rate-limit.ts` + routes |
| 19 | CSP/CORP could block cross-origin media | Low | Fixed | `media.routes.ts` |
| 20 | Dependency risks (Prisma RC) / no audit run | Informational | Partially addressed | `package.json`, `SECURITY.md` |
| 21 | Mock Google login / dev OTP gated only by NODE_ENV | Low | Fixed | `auth.routes.ts` |

---

## 2. Findings and changes in detail

### #1 Hardcoded JWT and webhook secrets
- **Before:** `JWT_SECRET` and `PAYMENT_WEBHOOK_SECRET` fell back to hardcoded literals in source.
- **Change:** Removed the fallbacks. `auth.ts` now throws at startup if `JWT_SECRET` is missing or `< 32` chars. `payout-gateway.ts` loads the webhook secret via a getter that throws if unset.
- **Files:** `backend/src/lib/auth.ts`, `backend/src/lib/payout-gateway.ts`.

### #2 Hardcoded production DB connection string
- **Before:** `db.ts` fell back to a real Supabase connection string (with credentials).
- **Change:** Requires `DATABASE_URL`; throws if unset. No credential in source.
- **Files:** `backend/src/lib/db.ts`.

### #3 Hardcoded secrets in `scripts/`
- **Before:** ~17 scripts embedded the Supabase connection string; 3 test scripts embedded the JWT/webhook secrets; many used `ssl: { rejectUnauthorized: false }`.
- **Change:** All now read `process.env.DATABASE_URL` / `JWT_SECRET` / `PAYMENT_WEBHOOK_SECRET` and exit if unset; TLS verification enforced with an optional `DATABASE_CA_CERT`.
- **Files:** `scripts/add-perf-indexes.mjs`, `backfill_ai_moderation_reports.{mjs,ts}`, `backfill_plagiarism_reports.{mjs,ts}`, `cleanup_test_records.mjs`, `curate_modern_catalog.mjs`, `enable_supabase_rls.mjs`, `find_user.mjs`, `inspect_applications_schema.mjs`, `inspect_supabase_rls.mjs`, `inspect_tables.mjs`, `migrate_audio_to_supabase_storage.mjs`, `migrate_creator_applications_ai.mjs`, `migrate_creator_applications_plagiarism.mjs`, `migrate_to_supabase.mjs`, `normalize_scores.mjs`, `reset_admin_password.mjs`, `seed_competition_entries.mjs`, `test-phase1.js`, `test-phase5-6.js`, `test-phase-advanced.js`.

### #4 Hardcoded demo/seed passwords in frontend
- **Before:** `AdminLoginGate.tsx`, `AuthModal.tsx`, and `login/page.tsx` embedded demo account passwords (e.g. admin/creator/listener) and auto-submitted them.
- **Change:** Demo buttons now prefill the email only; the password must be typed manually; auto-submit removed.
- **Files:** `frontend/src/components/admin/AdminLoginGate.tsx`, `frontend/src/components/auth/AuthModal.tsx`, `frontend/src/app/login/page.tsx`.

### #5 Webhook signature verification
- **Before:** HMAC verified over `JSON.stringify(req.body)` (re-serialized), which does not match the sender's raw bytes.
- **Change:** Captured the raw request body via `express.json({ verify })` and verify the HMAC over the exact received bytes; added an explicit length check before `crypto.timingSafeEqual`.
- **Files:** `backend/src/server.ts`, `backend/src/routes/webhooks.routes.ts`, `backend/src/lib/payout-gateway.ts`.

### #6 DB TLS certificate validation
- **Before:** `ssl: { rejectUnauthorized: false }` for all remote DB connections (app + scripts).
- **Change:** `rejectUnauthorized: true` enforced for remote connections, with optional CA via `DATABASE_CA_CERT` / `DATABASE_CA_CERT_FILE`. No option to disable verification. Local (loopback) connections keep plaintext as before.
- **Files:** `backend/src/lib/db.ts`, all affected `scripts/*`.

### #7 CORS
- **Before:** CORS origin callback returned `true` for any origin, with `credentials: true`.
- **Change:** Allowlist built from `CORS_ORIGINS` (then `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`); unknown browser origins rejected; requests with no Origin (curl/server-to-server) still allowed.
- **Files:** `backend/src/server.ts`.

### #8 OAuth hardening
- **Before:** `state` carried a CSRF nonce that was never validated; `redirect` was unchecked (open redirect); the JWT was placed in the redirect URL; email/google_id were logged.
- **Change:** CSRF nonce bound to an httpOnly cookie and validated on callback; `redirect` sanitized to safe relative paths; session delivered only via httpOnly cookie (token removed from URL); PII logging removed.
- **Files:** `backend/src/routes/auth.routes.ts`.

### #9 Playlist IDOR
- **Before:** `GET /playlists/:id` returned any playlist (including PRIVATE) via `SELECT p.*` with no ownership/visibility check.
- **Change:** PRIVATE playlists are returned only to their owner (otherwise 404); explicit column list instead of `p.*`.
- **Files:** `backend/src/routes/playlists.routes.ts`.

### #10 Schema column mismatches
- **Before:** `likes` INSERT used `targetId`/`ip_address`/`is_valid`; `comments` used `song_id`/`text`; `follows` used `artist_id` — none of which exist in `infrastructure/database/schema.sql`.
- **Change:** Aligned to the schema: `likes(target_id, ip_hash, risk_score)`, `comments(target_type, target_id, content)`, `follows(target_type='ARTIST', target_id)`. Also added comment input validation (length cap, control-char strip).
- **Files:** `backend/src/routes/social.routes.ts`, `backend/src/routes/library.routes.ts`.
- **Note:** Aligned to the committed schema; **must be tested against the live DB** in case it differs.

### #11 Admin `:id` router re-dispatch
- **Before:** `PATCH/DELETE /users/:id` called `(router as any).handle(fakeReq, res)`, re-running middleware against a cloned request.
- **Change:** Extracted `handleUpdateUser` / `handleDeleteUser` and call them directly from both the collection and `:id` routes.
- **Files:** `backend/src/routes/admin.routes.ts`.

### #12 Password policy & OTP
- **Change:** Minimum password length raised from 6 to 8 (backend + admin + frontend reset flow). Reset OTP now generated with `crypto.randomInt` (CSPRNG) instead of `Math.random`. `reset-tokens.ts` (currently unused) also hardened with CSPRNG + constant-time comparison.
- **Files:** `backend/src/routes/auth.routes.ts`, `admin.routes.ts`, `backend/src/lib/reset-tokens.ts`, `frontend/src/app/login/page.tsx`.

### #13 Path traversal
- **Before:** `getLocalFilePath` sanitized with `key.replace(/\.\./g, '')` (bypassable).
- **Change:** Normalize + reduce to basename + enforce the resolved path stays within an allowed base directory.
- **Files:** `backend/src/lib/storage.ts`.

### #14 Media proxy SSRF
- **Change:** The media stream proxy now validates the remote URL against an https host allowlist (`archive.org`, `cdn.freesound.org`, Google Cloud Storage, extendable via `MEDIA_FETCH_ALLOWED_HOSTS`), falls back to the known-good default otherwise, and uses `redirect: 'manual'` to prevent redirect-to-internal.
- **Files:** `backend/src/routes/media.routes.ts`.

### #15 Verbose error disclosure
- **Before:** Many routes returned raw `err.message` (including DB errors) to clients.
- **Change:** All route handlers now log details server-side and return generic client messages. The global error handler is production-safe.
- **Files:** every file in `backend/src/routes/`, plus `backend/src/lib/auth.ts`, `backend/src/lib/db.ts`.

### #16 Security headers
- **Change:** Added `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Resource-Policy`, a JSON-oriented `Content-Security-Policy`, and HSTS (production) at the API; added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `server_tokens off` at nginx.
- **Files:** `backend/src/server.ts`, `infrastructure/nginx/nginx.conf`.

### #17 Docker hardening
- **Change:** Postgres no longer publishes `5432` to the host (internal `expose` only); compose secrets referenced via `${VAR}` / required-var syntax instead of literals; `security_opt: no-new-privileges` on all services.
- **Files:** `docker-compose.yml`.

### #18 Rate limiting
- **Change:** New `backend/src/lib/rate-limit.ts` providing limiters (uses `express-rate-limit` when installed, with a dependency-free in-memory fallback). Applied to:
  - auth: `/login`, `/register`, `/change-password` — 10 / 15 min
  - password reset: `/forgot-password`, `/reset-password` — 5 / hour
  - social writes: `/like`, `/comments`, `/follow` — 30 / min
  - webhook: `/payments` — 60 / min
  Added `app.set('trust proxy', 1)` for correct client IPs behind nginx; added `express-rate-limit` to `backend/package.json`.
- **Files:** `backend/src/lib/rate-limit.ts`, `auth.routes.ts`, `social.routes.ts`, `webhooks.routes.ts`, `server.ts`, `backend/package.json`.

### #19 CSP/CORP for media
- **Change:** Media stream responses set `Cross-Origin-Resource-Policy: cross-origin` and drop the document CSP so browser `<audio>`/`<img>`/`<video>` can embed media without being blocked.
- **Files:** `backend/src/routes/media.routes.ts`.

### #20 Dependencies
- **Change:** Pinned `prisma` from a release candidate (`^8.0.0-rc.17`) to the stable line (`^8.0.0`). Added `npm run audit` / `audit:all` scripts and documented the audit procedure in `SECURITY.md`.
- **Not done:** `npm audit` itself was not run (npm unavailable). Cross-workspace version drift (`nodemailer`, `resend`) documented, not changed.
- **Files:** `package.json`, `SECURITY.md`.

### #21 Mock login / dev OTP gating
- **Change:** Mock Google sign-in now requires `ENABLE_MOCK_AUTH=true` (and never in production); reset OTP is returned in the API response only when `EXPOSE_DEV_OTP=true` (and never in production).
- **Files:** `backend/src/routes/auth.routes.ts`, `.env.example`.

---

## 3. Verification status

| Check | Status |
|-------|--------|
| Static grep (no secrets, no `rejectUnauthorized:false`, no raw `err.message`) | Passed |
| Brace/paren balance on edited files | Passed |
| `npm install` | **Not run** (npm unavailable in authoring environment) |
| `npm run build` / `tsc` | **Not run** |
| `npm run audit` | **Not run** |
| Gitleaks (working tree / history) | Available locally; history still contains old secrets by design |
| Runtime/behavioral tests | **Not run** |

The static checks confirm the code shape of the fixes. They do **not** confirm
the code compiles or behaves correctly at runtime.

---

## 4. Outstanding (owner action required)

1. **Rotate the previously-exposed credentials.** They remain recoverable from git
   history and must be treated as compromised regardless of code fixes:
   Supabase DB password, `JWT_SECRET`, `PAYMENT_WEBHOOK_SECRET`, and every value
   that was in the previously committed `.env` (`EMAIL_APP_PASSWORD`,
   `RESEND_API_KEY`, any AWS keys, `SUPABASE_SERVICE_ROLE_KEY`, `SEED_ADMIN_PASSWORD`).
2. **Build and type-check:** `npm install && npm run build`.
3. **Dependency audit:** `npm run audit` and remediate.
4. **Test schema-aligned queries (#10)** against the live DB (likes/comments/follows).
5. **Behavioral tests:** rate limiting (429), playlist IDOR (404), CORS rejection,
   OAuth login via cookie, media playback.
6. **Consider moving the session JWT out of `localStorage`** into an httpOnly
   cookie (reduces XSS token theft). This is an architectural change and was not
   made here because it spans the whole auth flow and needs runtime testing.
7. **TLS termination + HSTS** at the edge/nginx (the bundled nginx listens on
   plain HTTP).
8. **Git history scrub** (optional) is prepared but not executed; rotation is the
   primary control.

---

## 5. False positives / not vulnerabilities (verified)

- **SQL injection:** all reviewed queries are parameterized; dynamic filters use
  placeholder indices and whitelisted `ORDER BY`.
- **XSS (frontend):** no `dangerouslySetInnerHTML`, `eval`, or raw HTML injection.
- **Command injection:** no `child_process`/`exec` in request paths.
- **Gitleaks working-tree `generic-api-key` hits** in `scripts/*` catalog/seed
  files are media/catalog IDs, not credentials.
