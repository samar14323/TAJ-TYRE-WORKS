interface RateLimitRecord {
  failedAttempts: number;
  lockUntil: number | null;
  firstAttemptAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries periodically
function cleanupStaleEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.lockUntil && now > record.lockUntil) {
      rateLimitStore.delete(key);
    } else if (!record.lockUntil && now - record.firstAttemptAt > 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  lockDurationMs = 15 * 60 * 1000
): { isBlocked: boolean; waitSeconds?: number; attemptsLeft?: number } {
  cleanupStaleEntries();
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    return { isBlocked: false, attemptsLeft: maxAttempts };
  }

  if (record.lockUntil && now < record.lockUntil) {
    const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { isBlocked: true, waitSeconds };
  }

  // Lock has expired
  if (record.lockUntil && now >= record.lockUntil) {
    rateLimitStore.delete(identifier);
    return { isBlocked: false, attemptsLeft: maxAttempts };
  }

  const attemptsLeft = Math.max(0, maxAttempts - record.failedAttempts);
  return { isBlocked: false, attemptsLeft };
}

export function recordFailedAttempt(
  identifier: string,
  maxAttempts = 5,
  lockDurationMs = 15 * 60 * 1000
): { isBlocked: boolean; waitSeconds?: number; attemptsLeft: number } {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = {
      failedAttempts: 1,
      lockUntil: null,
      firstAttemptAt: now,
    };
  } else {
    record.failedAttempts += 1;
  }

  if (record.failedAttempts >= maxAttempts) {
    record.lockUntil = now + lockDurationMs;
    rateLimitStore.set(identifier, record);
    const waitSeconds = Math.ceil(lockDurationMs / 1000);
    return { isBlocked: true, waitSeconds, attemptsLeft: 0 };
  }

  rateLimitStore.set(identifier, record);
  return {
    isBlocked: false,
    attemptsLeft: Math.max(0, maxAttempts - record.failedAttempts),
  };
}

export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}
