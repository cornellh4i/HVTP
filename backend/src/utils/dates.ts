import { Timestamp } from "firebase-admin/firestore";

/**
 * Coerce any timestamp-ish value into a Firestore Timestamp.
 *
 * Accepts a Firestore Timestamp, a JS Date, epoch millis, an ISO date string,
 * or a serialized Firestore Timestamp shape ({ _seconds, _nanoseconds } /
 * { seconds, nanoseconds }). Returns null when the value is missing or cannot
 * be parsed into a valid date.
 *
 * Used both on the write path (normalize createdAt / soldAt before insert) and
 * by the backfill migration.
 */
export function toTimestamp(value: unknown): Timestamp | null {
  if (value == null) return null;

  if (value instanceof Timestamp) return value;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : Timestamp.fromDate(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? Timestamp.fromMillis(value) : null;
  }

  if (typeof value === "string") {
    const ms = Date.parse(value.trim());
    return Number.isNaN(ms) ? null : Timestamp.fromMillis(ms);
  }

  if (typeof value === "object") {
    const v = value as {
      _seconds?: number;
      seconds?: number;
      _nanoseconds?: number;
      nanoseconds?: number;
    };
    const seconds = v._seconds ?? v.seconds;
    if (typeof seconds === "number" && Number.isFinite(seconds)) {
      const nanos = v._nanoseconds ?? v.nanoseconds ?? 0;
      return new Timestamp(seconds, Number.isFinite(nanos) ? nanos : 0);
    }
  }

  return null;
}

/** Best-effort milliseconds-since-epoch from any timestamp-ish value; null if unparseable. */
export function toMillis(value: unknown): number | null {
  const ts = toTimestamp(value);
  return ts ? ts.toMillis() : null;
}
