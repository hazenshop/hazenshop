const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hazen2026";
export const AUTH_COOKIE_NAME = "hazen_admin_token";

const TOKEN_SALT = "hazen-luxury-bedding-security-salt-2026";

/**
 * Universal SHA-256 hash compatible with Edge Runtime, Node.js, and browser
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a tamper-proof SHA-256 token for authenticated admin sessions
 */
export async function generateAdminToken(): Promise<string> {
  return sha256(`admin-authenticated-session:${TOKEN_SALT}:${ADMIN_PASSWORD}`);
}

/**
 * Validates whether the incoming token matches the valid expected token
 */
export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const expected = await generateAdminToken();
    return token === expected;
  } catch {
    return false;
  }
}

/**
 * In-Memory Rate Limiter for Login Endpoint (Prevent Brute-Force Attacks)
 * Max 5 failed attempts within 15 minutes per IP address.
 */
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.blockedUntil > now) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  if (record.blockedUntil <= now && record.attempts >= MAX_ATTEMPTS) {
    rateLimitStore.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  return { allowed: true, remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.attempts) };
}

export function recordFailedLogin(ip: string): { remainingAttempts: number; isLockedOut: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { attempts: 0, blockedUntil: 0 };

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + LOCKOUT_MS;
    rateLimitStore.set(ip, record);
    return { remainingAttempts: 0, isLockedOut: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
  }

  rateLimitStore.set(ip, record);
  return { remainingAttempts: MAX_ATTEMPTS - record.attempts, isLockedOut: false };
}

export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}
