type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit({
  key,
  limit,
  windowInSeconds,
}: {
  key: string;
  limit: number;
  windowInSeconds: number;
}) {
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.expiresAt > now) {
    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        reset: existing.expiresAt,
      };
    } else {
      existing.count += 1;
      store.set(key, existing);
      return {
        allowed: true,
        remaining: limit - existing.count,
        reset: existing.expiresAt,
      };
    }
  }

  // First request or expired window
  store.set(key, {
    count: 1,
    expiresAt: now + windowInSeconds * 1000,
  });

  return {
    allowed: true,
    remaining: limit - 1,
    reset: now + windowInSeconds * 1000,
  };
}
