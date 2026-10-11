import { headers } from "next/headers";

export interface ResolvedEntity {
  label: string;
  documentId: string;
}

// notFound() takes no arguments and there's no supported way to pass data
// from a page into the not-found boundary that replaces it, so instead we
// key a small in-memory log by the request's pathname (set as a header by
// middleware, since headers() is the one thing reliably readable from both
// the page that resolved the entity and the not-found page that replaces it
// for the same request). Entries are pruned after a few seconds; two
// concurrent requests to the exact same pathname could interleave their
// entries, which is an acceptable trade-off for this debug-only display.
interface LogEntry {
  entities: ResolvedEntity[];
  timestamp: number;
}

const logsByPathname = new Map<string, LogEntry>();
const MAX_AGE_MS = 30_000;

function prune() {
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const [key, entry] of logsByPathname) {
    if (entry.timestamp < cutoff) logsByPathname.delete(key);
  }
}

async function currentPathname(): Promise<string | null> {
  try {
    return (await headers()).get("x-pathname");
  } catch {
    return null;
  }
}

/**
 * Record that this ancestor/entity was successfully resolved, in case a
 * later lookup in the same request fails and ends up at the not-found page
 * — e.g. a valid category whose requested subcategory doesn't exist, or a
 * thangka resolved from its slug whose full record then fails to load.
 */
export async function recordResolvedEntity(label: string, documentId: string) {
  const pathname = await currentPathname();
  if (!pathname) return;
  prune();
  const entry = logsByPathname.get(pathname) ?? { entities: [], timestamp: Date.now() };
  entry.entities.push({ label, documentId });
  entry.timestamp = Date.now();
  logsByPathname.set(pathname, entry);
}

/** The most specific entity successfully resolved before the 404, if any. */
export async function getLastResolvedEntity(): Promise<ResolvedEntity | null> {
  const pathname = await currentPathname();
  if (!pathname) return null;
  const entities = logsByPathname.get(pathname)?.entities ?? [];
  return entities[entities.length - 1] ?? null;
}
