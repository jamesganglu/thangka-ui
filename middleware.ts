import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Stamp the request with its own pathname so Server Components (which
  // have no usePathname()) can read it back via headers() — used to key
  // the per-request CMS API call log shown on the not-found page.
  request.headers.set("x-pathname", request.nextUrl.pathname);
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
