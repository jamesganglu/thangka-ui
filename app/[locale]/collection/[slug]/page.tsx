import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoriesByParentId, getLevel1Categories, imgUrl, toPlainText, slugify, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  let parentCategory: CategoryItem | null = null;
  try {
    const all = await getLevel1Categories();
    parentCategory = all.find((c) => slugify(c.name_en) === slug) ?? null;
  } catch { /* ignore */ }

  if (!parentCategory) return {};

  const name = (locale === "zh" ? parentCategory.name_zh || parentCategory.name_en : parentCategory.name_en) || slug;
  const description = toPlainText(locale === "zh" ? parentCategory.description_zh || parentCategory.description_en : parentCategory.description_en).slice(0, 160) || `Explore ${name} thangka paintings in our collection.`;
  const img = parentCategory.image?.[0];
  const ogImage = img ? imgUrl(img.formats?.medium?.url ?? img.url) : undefined;

  return {
    title: name,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/collection/${slug}`,
      languages: { en: `${siteUrl}/en/collection/${slug}`, zh: `${siteUrl}/zh/collection/${slug}`, "x-default": `${siteUrl}/en/collection/${slug}` },
    },
    openGraph: {
      title: name,
      description,
      url: `${siteUrl}/${locale}/collection/${slug}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: name }] } : {}),
    },
  };
}

export default async function CollectionCategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("collection");

  let parentCategory: CategoryItem | null = null;
  let subcategories: CategoryItem[] = [];

  try {
    const all = await getLevel1Categories();
    parentCategory = all.find((c) => slugify(c.name_en) === slug) ?? null;
  } catch { /* CMS not connected */ }

  if (!parentCategory) notFound();

  try {
    subcategories = await getCategoriesByParentId(String(parentCategory.id));
  } catch { /* CMS not connected */ }

  function catName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }
  function catDesc(cat: CategoryItem) {
    return (locale === "zh" ? cat.short_desc_zh || cat.short_desc_en : cat.short_desc_en) || "";
  }

  const desc = catDesc(parentCategory);
  const parentImg = parentCategory.image?.[0];
  const parentImgSrc = imgUrl(parentImg?.formats?.medium?.url ?? parentImg?.url ?? "");

  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      <div style={{ padding: "20px 0 0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#6F6A63" }}>
            <Link href="/collection" style={{ color: "#6F6A63", textDecoration: "none" }}>{t("breadcrumb")}</Link>
            {" / "}
            <span style={{ color: "#2B2520" }}>{catName(parentCategory)}</span>
          </nav>
        </div>
      </div>

      <div style={{ padding: "32px 0 36px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }} className="cat-hero">
            <div style={{ flex: "1 1 0", paddingTop: "8px" }}>
              <span className="eyebrow">{t("category")}</span>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 12px" }}>
                {catName(parentCategory)}
              </h1>
              <div style={{ width: "70px", height: "2px", background: "var(--color-accent)", marginBottom: "16px" }} />
              {desc && <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>{desc}</p>}
            </div>
            <div style={{ position: "relative", flex: "1 1 0", aspectRatio: "3/4", background: "#F5F3EF", overflow: "hidden" }}>
              {parentImgSrc ? <Image src={parentImgSrc} alt={catName(parentCategory)} fill style={{ objectFit: "cover" }} sizes="50vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
            </div>
          </div>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        {subcategories.length === 0 ? (
          <p style={{ color: "#6F6A63", fontSize: "15px" }}>{t("noSubcategories")}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }} className="cat-grid">
            {[...subcategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
              const img = cat.image?.[0];
              const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
              const catDescText = catDesc(cat);
              const hasChildren = cat.categories && cat.categories.length > 0;

              return (
                <Link key={cat.id} href={`/collection/${slug}/${slugify(cat.name_en)}`} className="cat-card" style={{ border: "1px solid var(--color-accent)", background: "var(--color-surface)", display: "flex", flexDirection: "column", textDecoration: "none" }}>
                  <div style={{ position: "relative", width: "100%", paddingBottom: "133%", overflow: "hidden", background: "#F5F3EF", flexShrink: 0 }}>
                    {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 50vw, 25vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
                  </div>
                  <div style={{ padding: "12px 16px 16px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "0 0 6px", lineHeight: 1.2 }}>
                      {catName(cat)}
                    </h3>
                    {catDescText && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6F6A63", margin: "0 0 10px", lineHeight: 1.5 }}>{catDescText}</p>}
                    {hasChildren && <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A87533" }}>{t("explore")}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .cat-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .cat-hero { flex-direction: column !important; } .cat-hero > div:last-child { width: 100% !important; aspect-ratio: 4/3; } }
      `}</style>
    </main>
  );
}
