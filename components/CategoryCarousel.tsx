"use client";

import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CategoryItem, imgUrl } from "@/lib/api";

export default function CategoryCarousel({
  categories,
  locale,
}: {
  categories: CategoryItem[];
  locale: string;
}) {
  const t = useTranslations("carousel");
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".cat-card-link");
    const cardWidth = card ? card.offsetWidth + 24 : 260;
    track.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  }

  const btnStyle: React.CSSProperties = {
    position: "absolute", top: "35%", transform: "translateY(-50%)", zIndex: 2,
    background: "#ffffff", border: "1px solid #E8E3DC", width: "40px", height: "40px",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <button style={{ ...btnStyle, left: "-20px" }} onClick={() => scroll("left")} aria-label={t("previous")}>←</button>

        <div ref={trackRef} style={{ display: "flex", gap: "24px", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }} className="carousel-track">
          {categories.map((cat) => {
            const img = cat.image?.[0];
            const imgSrc = img?.formats?.small?.url || img?.url || "";
            const name = (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
            const fullDesc = locale === "zh" ? cat.short_desc_zh || cat.short_desc_en || "" : cat.short_desc_en || "";
            const descText = fullDesc.length > 50 ? fullDesc.slice(0, 50).trimEnd() + "…" : fullDesc;

            return (
              <Link
                key={cat.documentId ?? cat.id}
                href={`/collection?category=${cat.documentId ?? cat.id}`}
                className="cat-card-link"
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", cursor: "pointer", border: "none", flex: "0 0 calc(20% - 20px)", scrollSnapAlign: "start", minWidth: "180px" }}
              >
                <div className="cat-card" style={{ border: "1px solid var(--color-accent)", background: "var(--color-surface)", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ position: "relative", width: "100%", paddingBottom: "100%", overflow: "hidden", background: "#F5F3EF", flexShrink: 0 }}>
                    {imgSrc ? (
                      <Image src={imgUrl(imgSrc)} alt={name} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 20vw" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />
                    )}
                  </div>
                  <div style={{ padding: "12px 16px 16px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "0 0 6px", lineHeight: 1.2 }}>
                      {name}
                    </h3>
                    {descText && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: "0 0 10px", lineHeight: 1.5 }}>{descText}</p>}
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A87533" }}>{t("explore")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button style={{ ...btnStyle, right: "-20px" }} onClick={() => scroll("right")} aria-label={t("next")}>→</button>
      </div>

      <style>{`
        .carousel-track::-webkit-scrollbar { display: none; }
        .cat-card { transition: opacity 0.2s; }
        .cat-card:hover { opacity: 0.85; }
        @media (max-width: 900px) { .cat-card-link { flex: 0 0 calc(33.33% - 16px) !important; } }
        @media (max-width: 640px) { .cat-card-link { flex: 0 0 calc(50% - 12px) !important; } }
      `}</style>
    </>
  );
}
