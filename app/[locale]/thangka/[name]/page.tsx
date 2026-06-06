import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getThangkaBySlug, getCategoryWithAncestors, getTangkasByCategory, imgUrl, toPlainText, slugify, CategoryItem, ThangkaItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string; name: string }>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#2B2520", fontWeight: 700, minWidth: "90px", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#2B2520", lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  );
}

function buildAncestorChain(cat: CategoryItem): CategoryItem[] {
  const chain: CategoryItem[] = [];
  let current: CategoryItem | null | undefined = cat;
  while (current) {
    chain.unshift(current);
    current = current.category ?? null;
  }
  return chain;
}

function categoryUrl(chain: CategoryItem[], index: number): string {
  if (index === 0) return `/collection/${slugify(chain[0].name_en)}`;
  return `/collection/${slugify(chain[0].name_en)}/${slugify(chain[1].name_en)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name } = await params;

  let thangka;
  try { thangka = await getThangkaBySlug(name); } catch { return {}; }
  if (!thangka) return {};

  const displayName = (locale === "zh" ? thangka.name_zh || thangka.name_en : thangka.name_en) || "";
  const title = [thangka.identify, displayName].filter(Boolean).join(" · ");
  const description = (toPlainText(locale === "zh" ? thangka.description_zh || thangka.description_en : thangka.description_en).slice(0, 160)) || `${title} — authentic Tibetan thangka painting.`;
  const ogImage = imgUrl(thangka.image?.formats?.large?.url ?? thangka.image?.formats?.medium?.url ?? thangka.image?.url ?? "");

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/thangka/${name}`,
      languages: { en: `${siteUrl}/en/thangka/${name}`, zh: `${siteUrl}/zh/thangka/${name}`, "x-default": `${siteUrl}/en/thangka/${name}` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/thangka/${name}`,
      type: "article",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
      ...(ogImage ? { images: [{ url: ogImage, alt: displayName }] } : {}),
    },
  };
}

export default async function ThangkaDetailPage({ params }: Props) {
  const { locale, name } = await params;
  const t = await getTranslations("thangka");
  const tCollection = await getTranslations("collection");

  let thangka;
  try { thangka = await getThangkaBySlug(name); } catch { notFound(); }
  if (!thangka) notFound();

  // Fetch full ancestor chain for the first category
  let ancestorChain: CategoryItem[] = [];
  if (thangka.category?.documentId) {
    try {
      const catWithAncestors = await getCategoryWithAncestors(thangka.category.documentId);
      ancestorChain = buildAncestorChain(catWithAncestors);
    } catch { /* ignore */ }
  }

  // Fetch top 4 thangkas from the same sub category, excluding current
  let relatedThangkas: ThangkaItem[] = [];
  const leafCat = ancestorChain[ancestorChain.length - 1];
  if (leafCat?.id) {
    try {
      const all = await getTangkasByCategory(leafCat.documentId);
      relatedThangkas = all.filter((t) => t.documentId !== thangka.documentId).slice(0, 4);
    } catch { /* ignore */ }
  }

  const imgSrc = imgUrl(
    thangka.image?.formats?.large?.url ??
    thangka.image?.formats?.medium?.url ??
    thangka.image?.url ??
    ""
  );

  const displayName = (locale === "zh" ? thangka.name_zh || thangka.name_en : thangka.name_en) || "";
  const desc = toPlainText(locale === "zh" ? thangka.description_zh || thangka.description_en : thangka.description_en);

  function catDisplayName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }

  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "20px 0 0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#6F6A63", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
            <Link href="/collection" style={{ color: "#6F6A63", textDecoration: "none" }}>
              {tCollection("breadcrumb")}
            </Link>

            {ancestorChain.map((cat, i) => (
              <span key={cat.documentId} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#A9A39C" }}>/</span>
                <Link href={categoryUrl(ancestorChain, i)} style={{ color: "#6F6A63", textDecoration: "none" }}>
                  {catDisplayName(cat)}
                </Link>
              </span>
            ))}

            <span style={{ color: "#A9A39C" }}>/</span>
            <span style={{ color: "#2B2520" }}>{displayName}</span>
          </nav>
        </div>
      </div>

      {/* Detail layout */}
      <div style={{ padding: "40px 0 72px" }}>
        <div className="container">
          <div className="thangka-detail-layout" style={{ display: "flex", gap: "64px", alignItems: "flex-start" }}>
            <div className="thangka-detail-image" style={{ flex: "0 0 48%", position: "sticky", top: "24px" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "133%", background: "#F5F3EF", overflow: "hidden" }}>
                {imgSrc ? (
                  <Image src={imgSrc} alt={displayName || "Thangka"} fill style={{ objectFit: "contain" }} sizes="(max-width: 768px) 100vw, 48vw" priority />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />
                )}
              </div>
            </div>

            <div className="thangka-detail-info" style={{ flex: 1, paddingTop: "8px" }}>
              {thangka.identify && <span className="eyebrow" style={{ fontSize: "clamp(28px, 3vw, 38px)", marginBottom: "16px" }}>{thangka.identify}</span>}
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 24px", lineHeight: 1.1 }}>
                {displayName}
              </h1>

              {/* Metadata rows */}
              <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {ancestorChain[0] && (
                  <MetaRow label={t("category")} value={catDisplayName(ancestorChain[0])} />
                )}
                {ancestorChain.length > 1 && (
                  <MetaRow label={t("subject")} value={catDisplayName(ancestorChain[ancestorChain.length - 1])} />
                )}
                {thangka.identify && (
                  <MetaRow label={t("identify")} value={thangka.identify} />
                )}
                {thangka.size && (
                  <MetaRow label={t("size")} value={thangka.size} />
                )}
              </div>


              {desc && (
                <div style={{ marginBottom: "28px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#6F6A63", lineHeight: 1.75, margin: 0 }}>{desc}</p>
                </div>
              )}

            </div>
          </div>

          {/* Related images grid */}
          {!!thangka.relatedImages?.length && (
            <div id="related-images" style={{ marginTop: "64px", border: "1px solid var(--color-light)", padding: "24px" }}>
              <span className="eyebrow" style={{ marginBottom: "20px" }}>Details</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="related-grid">
                {thangka.relatedImages.map((img) => {
                  const src = imgUrl(img.formats?.medium?.url ?? img.formats?.large?.url ?? img.url);
                  return (
                    <Link key={img.documentId} href={`/thangka/${name}/image/${img.documentId}`} style={{ display: "block", textDecoration: "none" }}>
                      <div style={{ position: "relative", width: "100%", paddingBottom: "133%", background: "#F5F3EF", overflow: "hidden" }} className="related-img">
                        <Image
                          src={src}
                          alt={img.alternativeText || ""}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        {/* Related thangkas from same sub category */}
        {relatedThangkas.length > 0 && (
          <div id="related-thangkas" style={{ marginTop: "48px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: 0 }}>
                Related Thangkas
              </h2>
              {ancestorChain.length > 0 && (
                <Link href={categoryUrl(ancestorChain, ancestorChain.length - 1)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A87533", textDecoration: "none" }}>
                  View All
                </Link>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="related-thangkas-grid">
              {relatedThangkas.map((rt) => {
                const rtImg = imgUrl(rt.image?.formats?.medium?.url ?? rt.image?.url ?? "");
                const rtName = (locale === "zh" ? rt.name_zh || rt.name_en : rt.name_en) || "";
                return (
                  <Link key={rt.documentId} href={`/thangka/${slugify(rt.name_en)}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="related-img" style={{ position: "relative", width: "100%", paddingBottom: "133%", background: "#F5F3EF", overflow: "hidden" }}>
                      {rtImg ? (
                        <Image src={rtImg} alt={rtName} fill style={{ objectFit: "cover" }} sizes="25vw" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />
                      )}
                    </div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "10px 0 4px" }}>
                      {[rt.identify, rtName].filter(Boolean).join(" · ")}
                    </p>
                    {rt.size && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: "0 0 2px", lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600, color: "#2B2520" }}>Size</span> {rt.size}
                      </p>
                    )}
                    {rt.material && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: 0, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600, color: "#2B2520" }}>Material</span> {rt.material}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      <style>{`
        .related-img { transition: opacity 0.2s; }
        .related-img:hover { opacity: 0.85; }
        @media (max-width: 768px) {
          .thangka-detail-layout { flex-direction: column !important; gap: 32px !important; }
          .thangka-detail-image { position: static !important; flex: none !important; width: 100%; }
          .thangka-detail-info { flex: none !important; width: 100%; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .related-thangkas-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .related-grid { grid-template-columns: 1fr !important; }
          .related-thangkas-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}
