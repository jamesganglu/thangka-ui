import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoriesByParentId, getTangkasByCategory, getLevel1Categories, imgUrl, toPlainText, slugify, CategoryItem, ThangkaItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; slug: string; subslug: string; subsubslug: string }>;
}

async function resolveChain(locale: string, slug: string, subslug: string, subsubslug: string) {
  let level1: CategoryItem | null = null;
  let level2: CategoryItem | null = null;
  let level3: CategoryItem | null = null;

  try {
    const all = await getLevel1Categories();
    level1 = all.find((c) => slugify(c.name_en) === slug) ?? null;
  } catch { /* ignore */ }

  if (level1) {
    try {
      const level2cats = await getCategoriesByParentId(String(level1.id));
      level2 = level2cats.find((c) => slugify(c.name_en) === subslug) ?? null;
    } catch { /* ignore */ }
  }

  if (level2) {
    try {
      const level3cats = await getCategoriesByParentId(String(level2.id));
      level3 = level3cats.find((c) => slugify(c.name_en) === subsubslug) ?? null;
    } catch { /* ignore */ }
  }

  return { level1, level2, level3 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, subslug, subsubslug } = await params;
  const { level3 } = await resolveChain(locale, slug, subslug, subsubslug);

  const name = level3 ? (locale === "zh" ? level3.name_zh || level3.name_en : level3.name_en) || subsubslug : subsubslug;
  const description = level3 ? toPlainText(locale === "zh" ? level3.description_zh || level3.description_en : level3.description_en).slice(0, 160) : "";
  const img = level3?.image?.[0];
  const ogImage = img ? imgUrl(img.formats?.medium?.url ?? img.url) : undefined;

  return {
    title: name,
    description: description || `Explore ${name} thangka paintings.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/collection/${slug}/${subslug}/${subsubslug}`,
      languages: { en: `${siteUrl}/en/collection/${slug}/${subslug}/${subsubslug}`, zh: `${siteUrl}/zh/collection/${slug}/${subslug}/${subsubslug}`, "x-default": `${siteUrl}/en/collection/${slug}/${subslug}/${subsubslug}` },
    },
    openGraph: {
      title: name,
      description: description || `Explore ${name} thangka paintings.`,
      url: `${siteUrl}/${locale}/collection/${slug}/${subslug}/${subsubslug}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: name }] } : {}),
    },
  };
}

export default async function CollectionLevel4Page({ params }: Props) {
  const { locale, slug, subslug, subsubslug } = await params;
  const t = await getTranslations("collection");

  const { level1, level2, level3 } = await resolveChain(locale, slug, subslug, subsubslug);

  if (!level1 || !level2 || !level3) notFound();

  let subcategories: CategoryItem[] = [];
  let thangkas: ThangkaItem[] = [];

  try { subcategories = await getCategoriesByParentId(String(level3.id)); } catch { /* no subcategories */ }
  if (subcategories.length === 0) {
    try { thangkas = await getTangkasByCategory(level3.documentId); } catch { /* CMS not connected */ }
  }

  function catName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }
  function catDesc(cat: CategoryItem) {
    return toPlainText(locale === "zh" ? cat.description_zh || cat.description_en : cat.description_en);
  }
  function thangkaName(t: ThangkaItem) {
    return (locale === "zh" ? t.name_zh || t.name_en : t.name_en) || "";
  }

  const desc = catDesc(level3);
  const parentImg = level3.image?.[0];
  const parentImgSrc = imgUrl(parentImg?.formats?.medium?.url ?? parentImg?.url ?? "");

  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      <div style={{ padding: "20px 0 0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#6F6A63" }}>
            <Link href="/collection" style={{ color: "#6F6A63", textDecoration: "none" }}>{t("breadcrumb")}</Link>
            {" / "}
            <Link href={`/collection/${slug}`} style={{ color: "#6F6A63", textDecoration: "none" }}>{catName(level1)}</Link>
            {" / "}
            <Link href={`/collection/${slug}/${subslug}`} style={{ color: "#6F6A63", textDecoration: "none" }}>{catName(level2)}</Link>
            {" / "}
            <span style={{ color: "#2B2520" }}>{catName(level3)}</span>
          </nav>
        </div>
      </div>

      <div style={{ padding: "32px 0 36px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }} className="cat-hero">
            <div style={{ flex: "1 1 0", paddingTop: "8px" }}>
              <span className="eyebrow">{t("category")}</span>
              <h1 className="page-title">
                {catName(level3)}
              </h1>
              <div className="page-title-underline page-title-underline--mb-16" />
              {desc && <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>{desc}</p>}
            </div>
            <div style={{ position: "relative", flex: "1 1 0", aspectRatio: "3/4", background: "#F5F3EF", overflow: "hidden" }}>
              {parentImgSrc ? <Image src={parentImgSrc} alt={catName(level3)} fill style={{ objectFit: "cover" }} sizes="50vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
            </div>
          </div>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        {subcategories.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }} className="cat-grid">
            {[...subcategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
              const img = cat.image?.[0];
              const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
              const catDescText = catDesc(cat);
              return (
                <div key={cat.id} className="cat-card" style={{ border: "1px solid var(--color-accent)", background: "var(--color-surface)", display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", width: "100%", paddingBottom: "133%", overflow: "hidden", background: "#F5F3EF", flexShrink: 0 }}>
                    {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 50vw, 25vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
                  </div>
                  <div style={{ padding: "12px 16px 16px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "0 0 6px", lineHeight: 1.2 }}>{catName(cat)}</h3>
                    {catDescText && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: "0 0 10px", lineHeight: 1.5 }}>{catDescText.length > 50 ? catDescText.slice(0, 50).trimEnd() + "…" : catDescText}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : thangkas.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="thangka-grid">
            {thangkas.map((thangka) => {
              const imgSrc = imgUrl(thangka.image?.formats?.medium?.url ?? thangka.image?.url ?? "");
              return (
                <Link key={thangka.documentId ?? thangka.id} href={`/thangka/${slugify(thangka.name_en)}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="cat-card thangka-card" style={{ border: "1px solid var(--color-accent)", background: "var(--color-surface)", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                    <div style={{ position: "relative", width: "100%", paddingBottom: "133%", overflow: "hidden", background: "#F5F3EF", flexShrink: 0 }}>
                      {imgSrc ? <Image src={imgSrc} alt={thangkaName(thangka)} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, 33vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
                    </div>
                    <div style={{ padding: "12px 16px 16px", textAlign: "left" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "0 0 6px", lineHeight: 1.2 }}>{thangkaName(thangka)}</h3>
                      {(thangka.size || thangka.era) && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: 0, lineHeight: 1.5 }}>{[thangka.size, thangka.era].filter(Boolean).join(" · ")}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#6F6A63", fontSize: "15px" }}>{t("noItems")}</p>
        )}
      </div>

      <style>{`
        .thangka-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .thangka-card:hover { border-color: #2B2520 !important; box-shadow: 0 4px 16px rgba(43,37,32,0.10); }
        @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, 1fr) !important; } .thangka-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .cat-grid { grid-template-columns: 1fr !important; } .thangka-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .cat-hero { flex-direction: column !important; } .cat-hero > div:last-child { width: 100% !important; aspect-ratio: 4/3; } }
      `}</style>
    </main>
  );
}
