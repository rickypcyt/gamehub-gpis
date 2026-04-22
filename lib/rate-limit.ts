// Simple in-memory rate limiter for login attempts
// In production, use Redis or similar for distributed systems

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
  blockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.blockedUntil && now > entry.blockedUntil) {
      // Unblock after block duration
      rateLimitStore.delete(key);
    } else if (!entry.blocked && now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
      // Reset after window expires
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First attempt
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      blocked: false,
      blockedUntil: null,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  if (entry.blocked) {
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: entry.blockedUntil 
      };
    }
    // Unblock if time has passed
    rateLimitStore.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS, resetAt: now + RATE_LIMIT_WINDOW };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset the window
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      blocked: false,
      blockedUntil: null,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blocked = true;
    entry.blockedUntil = now + BLOCK_DURATION;
    return { 
      allowed: false, 
      remaining: 0, 
      resetAt: entry.blockedUntil 
    };
  }

  // Increment attempt
  entry.attempts++;
  return { 
    allowed: true, 
    remaining: MAX_ATTEMPTS - entry.attempts, 
    resetAt: entry.firstAttempt + RATE_LIMIT_WINDOW 
  };
}

export function getRateLimitStatus(identifier: string): { blocked: boolean; resetAt: number | null; attempts: number } {
  const entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    return { blocked: false, resetAt: null, attempts: 0 };
  }

  if (entry.blocked && entry.blockedUntil && Date.now() < entry.blockedUntil) {
    return { blocked: true, resetAt: entry.blockedUntil, attempts: entry.attempts };
  }

  return { blocked: false, resetAt: entry.firstAttempt + RATE_LIMIT_WINDOW, attempts: entry.attempts };
}
