interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Simple in-memory TTL cache for expensive/frequently-hit read endpoints.
 * Single-process only (matches this backend's single-Express-instance
 * deployment) — not shared across server instances.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const value = await compute();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Invalidate a single cache key. */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Invalidate every cache key starting with `prefix`. */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
