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
    <header style={{ background: "#ffffff", borderBottom: "1px solid #E8E3DC", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/assets/thangkas_logo.png" alt="" width={60} height={60} style={{ objectFit: "contain" }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "18px", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.2, color: "#2B2520" }}>
            TIBETAN<br />THANGKAS
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }} className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "14px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive(item.path) ? "#A87533" : "#2B2520",
                borderBottom: isActive(item.path) ? "2px solid #A87533" : "2px solid transparent",
                paddingBottom: "3px",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {t(item.key)}
            </Link>
          ))}

          {/* Locale switcher */}
          <button
            onClick={switchLocale}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#A87533",
              background: "none",
              border: "1px solid #A87533",
              padding: "4px 10px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {locale === "en" ? "中文" : "EN"}
          </button>

          {/* Search icon */}
          <button aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer", color: "#2B2520", padding: "4px", display: "flex", alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{ background: "none", border: "none", cursor: "pointer", display: "none", padding: "4px", color: "#2B2520" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div style={{ background: "#ffffff", borderTop: "1px solid #E8E3DC", padding: "16px 0" }} className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: "'Cinzel', serif",
                fontSize: "14px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive(item.path) ? "#A87533" : "#2B2520",
                padding: "12px 40px",
                borderLeft: isActive(item.path) ? "3px solid #A87533" : "3px solid transparent",
              }}
            >
              {t(item.key)}
            </Link>
          ))}
          <button
            onClick={() => { switchLocale(); setMenuOpen(false); }}
            style={{ display: "block", fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#A87533", padding: "12px 40px", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
          >
            {locale === "en" ? "中文" : "English"}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
