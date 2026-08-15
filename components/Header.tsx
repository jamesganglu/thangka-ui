"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { path: "/collection", key: "collection" },
  { path: "/about", key: "about" },
  { path: "/tibetan-history", key: "tibetanHistory" },
  { path: "/buddhism", key: "buddhism" },
  { path: "/contact", key: "contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function switchLocale() {
    router.replace(pathname, { locale: locale === "en" ? "zh" : "en" });
  }

  function isActive(path: string) {
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Logo */}
        <Link href="/" className="header-logo-link">
          <Image src="/assets/thangkas_logo.png" alt="" width={60} height={60} className="header-logo-img" />
          <div className="header-logo-text">
            TIBETAN<br />THANGKAS
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-link${isActive(item.path) ? " nav-link--active" : ""}`}
            >
              {t(item.key)}
            </Link>
          ))}

          {/* Locale switcher */}
          <button onClick={switchLocale} className="locale-switch-btn">
            {locale === "en" ? "中文" : "EN"}
          </button>

          {/* Search icon */}
          <button aria-label="Search" className="icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className={`mobile-nav-link${isActive(item.path) ? " mobile-nav-link--active" : ""}`}
            >
              {t(item.key)}
            </Link>
          ))}
          <button
            onClick={() => { switchLocale(); setMenuOpen(false); }}
            className="mobile-locale-btn"
          >
            {locale === "en" ? "中文" : "English"}
          </button>
        </div>
      )}
    </header>
  );
}
