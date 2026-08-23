import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoriesByParentId, getTangkasByCategory, getLevel1Categories, imgUrl, toPlainText, slugify, thangkaSlug, CategoryItem, ThangkaItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";

interface Props {
  params: Promise<{ locale: string; slug: string; subslug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, subslug } = await params;

  let level1: CategoryItem | null = null;
  let level2: CategoryItem | null = null;

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

  const name = level2 ? (locale === "zh" ? level2.name_zh || level2.name_en : level2.name_en) || subslug : subslug;
  const description = level2 ? toPlainText(locale === "zh" ? level2.description_zh || level2.description_en : level2.description_en).slice(0, 160) : "";
  const img = level2?.image?.[0];
  const ogImage = img ? imgUrl(img.formats?.medium?.url ?? img.url) : undefined;

  return {
    title: name,
    description: description || `Explore ${name} thangka paintings.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/collection/${slug}/${subslug}`,
      languages: { en: `${siteUrl}/en/collection/${slug}/${subslug}`, zh: `${siteUrl}/zh/collection/${slug}/${subslug}`, "x-default": `${siteUrl}/en/collection/${slug}/${subslug}` },
    },
    openGraph: {
      title: name,
      description: description || `Explore ${name} thangka paintings.`,
      url: `${siteUrl}/${locale}/collection/${slug}/${subslug}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description || `Explore ${name} thangka paintings.`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function CollectionLevel3Page({ params }: Props) {
  const { locale, slug, subslug } = await params;
  const t = await getTranslations("collection");

  let level1: CategoryItem | null = null;
  let level2: CategoryItem | null = null;
  let subcategories: CategoryItem[] = [];
  let thangkas: ThangkaItem[] = [];

  try {
    const all = await getLevel1Categories();
    level1 = all.find((c) => slugify(c.name_en) === slug) ?? null;
  } catch { /* CMS not connected */ }

  if (!level1) notFound();

  try {
    const level2cats = await getCategoriesByParentId(String(level1.id));
    level2 = level2cats.find((c) => slugify(c.name_en) === subslug) ?? null;
  } catch { /* CMS not connected */ }

  if (!level2) notFound();

  try { subcategories = await getCategoriesByParentId(String(level2.id)); } catch { /* no subcategories */ }
  if (subcategories.length === 0) {
    try { thangkas = await getTangkasByCategory(level2.documentId); } catch { /* CMS not connected */ }
  }

  function catName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }
  function catDesc(cat: CategoryItem) {
    return toPlainText(locale === "zh" ? cat.description_zh || cat.description_en : cat.description_en);
  }
  function cardDesc(cat: CategoryItem) {
    return (locale === "zh" ? cat.short_desc_zh || cat.short_desc_en : cat.short_desc_en) || "";
  }
  function thangkaName(t: ThangkaItem) {
    return (locale === "zh" ? t.name_zh || t.name_en : t.name_en) || "";
  }

  const desc = catDesc(level2);
  const parentImg = level2.image?.[0];
  const parentImgSrc = imgUrl(parentImg?.formats?.medium?.url ?? parentImg?.url ?? "");
  const parentImgWidth = parentImg?.width || 800;
  const parentImgHeight = parentImg?.height || 600;

  return (
    <main className="page-main">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("breadcrumb"), item: `${siteUrl}/${locale}/collection` },
            { "@type": "ListItem", position: 2, name: catName(level1), item: `${siteUrl}/${locale}/collection/${slug}` },
            { "@type": "ListItem", position: 3, name: catName(level2), item: `${siteUrl}/${locale}/collection/${slug}/${subslug}` },
          ],
        }}
      />
      <div className="page-breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb-nav">
            <Link href="/collection" className="breadcrumb-link">{t("breadcrumb")}</Link>
            {" / "}
            <Link href={`/collection/${slug}`} className="breadcrumb-mid">{catName(level1)}</Link>
            {" / "}
            <span className="breadcrumb-current">{catName(level2)}</span>
          </nav>
        </div>
      </div>

      <div className="page-hero-bar">
        <div className="container">
          <div className="cat-hero">
            <div className="cat-hero-text">
              <span className="eyebrow">{t("category")}</span>
              <h1 className="page-title">
                {catName(level2)}
              </h1>
              <div className="page-title-underline page-title-underline--mb-16" />
              {desc && <p className="cat-hero-desc">{desc}</p>}
              <Link href={`/collection/${slug}`} className="back-link">
                {t("back")} {catName(level1)}
              </Link>
            </div>
            <div className="cat-hero-image">
              {parentImgSrc ? (
                <Image src={parentImgSrc} alt={catName(level2)} width={parentImgWidth} height={parentImgHeight} sizes="50vw" />
              ) : (
                <div className="media-placeholder" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container section section--flush-top">
        {subcategories.length > 0 ? (
          <div className="cat-grid-cards">
            {[...subcategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
              const img = cat.image?.[0];
              const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
              const catDescText = cardDesc(cat);
              const hasChildren = cat.categories && cat.categories.length > 0;
              return (
                <Link key={cat.id} href={`/collection/${slug}/${subslug}/${slugify(cat.name_en)}`} className="cat-card">
                  <div className="cat-card-thumb cat-card-thumb--tall">
                    {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill sizes="(max-width: 900px) 50vw, 25vw" /> : <div className="media-placeholder" />}
                  </div>
                  <div className="cat-card-body">
                    <h3 className="cat-card-title">{catName(cat)}</h3>
                    {catDescText && <p className="cat-card-desc">{catDescText}</p>}
                    {hasChildren && <span className="cat-card-explore">{t("explore")}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : thangkas.length > 0 ? (
          <div className="thangka-grid">
            {thangkas.map((thangka) => {
              const imgSrc = imgUrl(thangka.image?.formats?.medium?.url ?? thangka.image?.url ?? "");
              return (
                <Link key={thangka.documentId ?? thangka.id} href={`/thangka/${thangkaSlug(thangka)}`} className="link-reset">
                  <div className="cat-card thangka-card">
                    <div className="cat-card-thumb cat-card-thumb--tall">
                      {imgSrc ? <Image src={imgSrc} alt={thangkaName(thangka)} fill sizes="(max-width: 640px) 100vw, 33vw" /> : <div className="media-placeholder" />}
                    </div>
                    <div className="thangka-card-body">
                      <h3 className="cat-card-title">{thangkaName(thangka)}</h3>
                      {(thangka.size || thangka.era) && <p className="thangka-card-meta">{[thangka.size, thangka.era].filter(Boolean).join(" · ")}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="muted-copy">{t("noItems")}</p>
        )}
      </div>
    </main>
  );
}
