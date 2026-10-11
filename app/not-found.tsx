import "./globals.css";
import NotFoundEndpoint from "@/components/NotFoundEndpoint";

// Fallback for paths outside the [locale] segment (e.g. middleware skips
// them, such as /api/* or dotted paths) that have no matching route. Kept
// locale-free since this renders outside the NextIntlClientProvider.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="page-main">
          <div className="container section not-found-section">
            <span className="eyebrow">404</span>
            <h1 className="page-title">Page not found</h1>
            <div className="page-title-underline page-title-underline--mb-24" />
            <p className="muted-copy">We couldn&apos;t find the page you requested.</p>
            <NotFoundEndpoint />
            <div className="not-found-actions">
              <a href="/" className="back-link">← Back to Home</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
