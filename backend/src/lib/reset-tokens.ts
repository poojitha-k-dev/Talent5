import crypto from 'crypto';

export interface ResetEntry {
  email: string;
  token: string;
  code: string;
  expiresAt: number;
}

declare global {
  var __talent5_reset_tokens: Map<string, ResetEntry> | undefined;
  var __talent5_reset_by_email: Map<string, string> | undefined; // email -> token
}

if (!global.__talent5_reset_tokens) {
  global.__talent5_reset_tokens = new Map();
}
if (!global.__talent5_reset_by_email) {
  global.__talent5_reset_by_email = new Map();
}

const tokenStore = global.__talent5_reset_tokens;
const emailToToken = global.__talent5_reset_by_email;

/**
 * Creates a secure reset token and 6-digit code valid for 1 hour.
 */
export function createResetToken(email: string, baseUrl?: string): {
  token: string;
  code: string;
  resetLink: string;
  expiresAt: number;
} {
  const cleanEmail = email.trim().toLowerCase();

  // Clear any previous token for this email
  const existingToken = emailToToken.get(cleanEmail);
  if (existingToken) {
    tokenStore.delete(existingToken);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour TTL

  const entry: ResetEntry = {
    email: cleanEmail,
    token,
    code,
    expiresAt,
  };

  tokenStore.set(token, entry);
  emailToToken.set(cleanEmail, token);

  const domain = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${domain}/reset-password?token=${token}`;

  return {
    token,
    code,
    resetLink,
    expiresAt,
  };
}

/**
 * Verifies a reset token without consuming it (for page load validation)
 */
export function verifyResetToken(token: string): { valid: boolean; email?: string } {
  if (!token) return { valid: false };


  const entry = tokenStore.get(token);
  if (!entry) return { valid: false };

  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    emailToToken.delete(entry.email);
    return { valid: false };
  }

  return { valid: true, email: entry.email };
}

/**
 * Consumes a reset token once password has been successfully changed
 */
export function consumeResetToken(token: string): { valid: boolean; email?: string } {
  const check = verifyResetToken(token);
  if (!check.valid || !check.email) return { valid: false };

  tokenStore.delete(token);
  emailToToken.delete(check.email);
  return { valid: true, email: check.email };
}

/**
 * Validates a 6-digit code for an email
 */
export function verifyResetCode(email: string, code: string): boolean {
  const cleanEmail = email.trim().toLowerCase();

  const token = emailToToken.get(cleanEmail);
  if (!token) return false;

  const entry = tokenStore.get(token);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    emailToToken.delete(cleanEmail);
    return false;
  }

  return entry.code === code.trim();
}
