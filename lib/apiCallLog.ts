import { headers } from "next/headers";

export interface ApiCallRecord {
  path: string;
  status: number | "error";
}

// There's no supported way to pass data from a page straight into the
// notFound() boundary that replaces it, so instead we key a small in-memory
// log by the request's pathname (set as a header by middleware, since
// headers() is the one thing reliably readable from both the page that made
// the CMS call and the not-found page that replaces it for the same
// request). Entries are pruned after a few seconds; two concurrent requests
// to the exact same pathname could interleave their logs, which is an
// acceptable trade-off for this debug-only display.
interface LogEntry {
  calls: ApiCallRecord[];
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

export async function recordApiCall(record: ApiCallRecord) {
  const pathname = await currentPathname();
  if (!pathname) return;
  prune();
  const entry = logsByPathname.get(pathname) ?? { calls: [], timestamp: Date.now() };
  entry.calls.push(record);
  entry.timestamp = Date.now();
  logsByPathname.set(pathname, entry);
}

export async function getApiCalls(): Promise<ApiCallRecord[]> {
  const pathname = await currentPathname();
  if (!pathname) return [];
  return logsByPathname.get(pathname)?.calls ?? [];
}
