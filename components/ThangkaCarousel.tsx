"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThangkaItem, imgUrl, thangkaSlug } from "@/lib/api";

export default function ThangkaCarousel({
  thangkas,
  locale,
}: {
  thangkas: ThangkaItem[];
  locale: string;
}) {
  const t = useTranslations("carousel");
  const trackRef = useRef<HTMLDivElement>(null);
  const loop = thangkas.length > 1;
  const items = loop ? [...thangkas, ...thangkas, ...thangkas] : thangkas;

  // Start scrolled into the middle copy so there's room to scroll both ways.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop) return;
    track.scrollLeft = track.scrollWidth / 3;
  }, [loop, thangkas.length]);

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

  function thangkaName(item: ThangkaItem) {
    return (locale === "zh" ? item.name_zh || item.name_en : item.name_en) || "";
  }

  return (
    <div className="carousel-wrapper thangka-carousel">
      <button className="carousel-nav-btn carousel-nav-btn--prev" onClick={() => scroll("left")} aria-label={t("previous")}>←</button>

      <div ref={trackRef} className="carousel-track">
        {items.map((thangka, idx) => {
          const imgSrc = imgUrl(thangka.image?.formats?.medium?.url ?? thangka.image?.url ?? "");
          const name = thangkaName(thangka);
          const meta = [thangka.size, thangka.material, thangka.era].filter(Boolean).join(" · ");

          return (
            <Link
              key={`${thangka.documentId ?? thangka.id}-${idx}`}
              href={`/thangka/${thangkaSlug(thangka)}`}
              className="cat-card-link"
            >
              <div className="cat-card thangka-card">
                <div className="cat-card-thumb cat-card-thumb--tall">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={name} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 20vw" />
                  ) : (
                    <div className="cat-card-image-placeholder" />
                  )}
                </div>
                <div className="thangka-card-body">
                  {thangka.identify && <span className="eyebrow thangka-card-identify">{thangka.identify}</span>}
                  <h3 className="cat-card-title">{name}</h3>
                  {meta && <p className="thangka-card-meta">{meta}</p>}
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
