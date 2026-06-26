/**
 * One-time backfill: normalize `items.createdAt` and `sales.soldAt` from legacy
 * ISO strings into Firestore Timestamps so date-range queries (the dashboard,
 * future exports) match them.
 *
 * Usage (from the backend/ directory):
 *   npx ts-node -r dotenv/config src/scripts/backfill-timestamps.ts --dry-run   # report only, no writes
 *   npx ts-node -r dotenv/config src/scripts/backfill-timestamps.ts             # apply forward migration
 *   npx ts-node -r dotenv/config src/scripts/backfill-timestamps.ts --reverse   # roll back Timestamps -> ISO strings
 *
 * Safe to re-run: it skips documents already in the target shape (idempotent).
 * It only ever rewrites the one date field per collection — no other data is
 * touched, and unparseable/missing values are left as-is and logged.
 */
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "../config/firebase";

const db = getDb();

const DRY_RUN = process.argv.includes("--dry-run");
const REVERSE = process.argv.includes("--reverse");

interface CollResult {
  collection: string;
  field: string;
  converted: number;
  alreadyOk: number;
  skipped: number;
  skippedIds: string[];
}

async function migrateCollection(collection: string, field: string): Promise<CollResult> {
  const snap = await db.collection(collection).get();

  const result: CollResult = { collection, field, converted: 0, alreadyOk: 0, skipped: 0, skippedIds: [] };

  for (const doc of snap.docs) {
    const value = doc.data()[field];

    if (REVERSE) {
      // Timestamp -> ISO string
      if (value instanceof Timestamp) {
        if (!DRY_RUN) await doc.ref.update({ [field]: value.toDate().toISOString() });
        result.converted++;
      } else {
        result.alreadyOk++; // already a string / missing — nothing to roll back
      }
      continue;
    }

    // Forward: ISO string -> Timestamp
    if (value instanceof Timestamp) {
      result.alreadyOk++;
      continue;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const ms = Date.parse(value);
      if (Number.isNaN(ms)) {
        result.skipped++;
        result.skippedIds.push(doc.id);
        continue;
      }
      if (!DRY_RUN) await doc.ref.update({ [field]: Timestamp.fromMillis(ms) });
      result.converted++;
    } else {
      // missing, empty, or unexpected type — leave untouched
      result.skipped++;
      result.skippedIds.push(doc.id);
    }
  }

  return result;
}

async function main(): Promise<void> {
  const mode = REVERSE ? "REVERSE (Timestamp -> ISO string)" : "FORWARD (ISO string -> Timestamp)";
  console.log(`\nBackfill timestamps — ${mode}${DRY_RUN ? "  [DRY RUN — no writes]" : ""}\n`);

  const results = [
    await migrateCollection("items", "createdAt"),
    await migrateCollection("sales", "soldAt"),
  ];

  for (const r of results) {
    console.log(
      `${r.collection}.${r.field}: converted=${r.converted}, alreadyOk=${r.alreadyOk}, skipped=${r.skipped}`
    );
    if (r.skippedIds.length) {
      console.log(`  skipped doc ids (missing/unparseable, left untouched): ${r.skippedIds.join(", ")}`);
    }
  }

  console.log(`\n${DRY_RUN ? "Dry run complete — no changes written." : "Migration complete."}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
