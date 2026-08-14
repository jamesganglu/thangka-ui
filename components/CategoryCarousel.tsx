"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
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
  const loop = categories.length > 1;
  const items = loop ? [...categories, ...categories, ...categories] : categories;

  // Start scrolled into the middle copy so there's room to scroll both ways.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop) return;
    track.scrollLeft = track.scrollWidth / 3;
  }, [loop, categories.length]);

  // After each scroll settles, silently re-center if we drifted into a clone
  // copy, so the next click can keep scrolling in the same direction forever.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop) return;
    let timeout: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!track) return;
        const setWidth = track.scrollWidth / 3;
        if (track.scrollLeft < setWidth * 0.5) {
          track.scrollLeft += setWidth;
        } else if (track.scrollLeft > setWidth * 1.5) {
          track.scrollLeft -= setWidth;
        }
      }, 120);
    }
    track.addEventListener("scroll", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [loop]);

  function scroll(dir: "left" | "right") {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".cat-card-link");
    const cardWidth = card ? card.offsetWidth + 24 : 260;
    track.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  }

  return (
    <div className="carousel-wrapper">
      <button className="carousel-nav-btn carousel-nav-btn--prev" onClick={() => scroll("left")} aria-label={t("previous")}>←</button>

      <div ref={trackRef} className="carousel-track">
        {items.map((cat, idx) => {
          const img = cat.image?.[0];
          const imgSrc = img?.formats?.small?.url || img?.url || "";
          const name = (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
          const descText = locale === "zh" ? cat.short_desc_zh || cat.short_desc_en || "" : cat.short_desc_en || "";

          return (
            <Link
              key={`${cat.documentId ?? cat.id}-${idx}`}
              href={`/collection?category=${cat.documentId ?? cat.id}`}
              className="cat-card-link"
            >
              <div className="cat-card">
                <div className="cat-card-image">
                  {imgSrc ? (
                    <Image src={imgUrl(imgSrc)} alt={name} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 20vw" />
                  ) : (
                    <div className="cat-card-image-placeholder" />
                  )}
                </div>
                <div className="cat-card-body">
                  <h3 className="cat-card-title">
                    {name}
                  </h3>
                  {descText && <p className="cat-card-desc">{descText}</p>}
                  <span className="cat-card-explore">{t("explore")}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <button className="carousel-nav-btn carousel-nav-btn--next" onClick={() => scroll("right")} aria-label={t("next")}>→</button>
    </div>
  );
}
