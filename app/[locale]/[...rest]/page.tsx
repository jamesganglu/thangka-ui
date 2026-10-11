import { notFound } from "next/navigation";

// Catches any path under a locale that doesn't match a defined route (e.g.
// a typo'd URL), so it falls through to the sibling not-found.tsx instead of
// Next.js's bare default 404 page.
export default function CatchAll() {
  notFound();
}
