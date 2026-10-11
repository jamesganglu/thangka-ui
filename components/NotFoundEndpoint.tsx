"use client";

import { usePathname } from "next/navigation";

// Renders the path that was actually requested. Split out as its own client
// component so server components can still sit above it (e.g. to import
// global CSS) without needing "use client" themselves.
export default function NotFoundEndpoint() {
  const pathname = usePathname();

  return <code className="not-found-path">{pathname}</code>;
}
