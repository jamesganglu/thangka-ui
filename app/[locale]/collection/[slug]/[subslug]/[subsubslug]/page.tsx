import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoriesByParentId, getTangkasByCategory, getLevel1Categories, imgUrl, toPlainText, slugify, CategoryItem, ThangkaItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ThangkaCarousel from "@/components/ThangkaCarousel";

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
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description || `Explore ${name} thangka paintings.`,
      ...(ogImage ? { images: [ogImage] } : {}),
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
  function cardDesc(cat: CategoryItem) {
    return (locale === "zh" ? cat.short_desc_zh || cat.short_desc_en : cat.short_desc_en) || "";
  }

  const desc = catDesc(level3);
  const parentImg = level3.image?.[0];
  const parentImgSrc = imgUrl(parentImg?.formats?.medium?.url ?? parentImg?.url ?? "");

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
            { "@type": "ListItem", position: 4, name: catName(level3), item: `${siteUrl}/${locale}/collection/${slug}/${subslug}/${subsubslug}` },
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
            <Link href={`/collection/${slug}/${subslug}`} className="breadcrumb-mid">{catName(level2)}</Link>
            {" / "}
            <span className="breadcrumb-current">{catName(level3)}</span>
          </nav>
        </div>
      </div>

      <div className="page-hero-bar">
        <div className="container">
          <div className="cat-hero cat-hero--top">
            <div className="cat-hero-text">
              <span className="eyebrow">{t("category")}</span>
              <h1 className="page-title">
                {catName(level3)}
              </h1>
              <div className="page-title-underline page-title-underline--mb-16" />
              {desc && <p className="cat-hero-desc">{desc}</p>}
              <Link href={`/collection/${slug}/${subslug}`} className="back-link">
                {t("back")} {catName(level2)}
              </Link>
            </div>
            <div className="cat-hero-image-crop">
              {parentImgSrc ? <Image src={parentImgSrc} alt={catName(level3)} fill sizes="50vw" /> : <div className="media-placeholder" />}
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
              return (
                <div key={cat.id} className="cat-card">
                  <div className="cat-card-thumb cat-card-thumb--tall">
                    {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill sizes="(max-width: 900px) 50vw, 25vw" /> : <div className="media-placeholder" />}
                  </div>
                  <div className="cat-card-body">
                    <h3 className="cat-card-title">{catName(cat)}</h3>
                    {catDescText && <p className="cat-card-desc">{catDescText}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : thangkas.length > 0 ? (
          <ThangkaCarousel thangkas={thangkas} locale={locale} />
        ) : (
          <p className="muted-copy">{t("noItems")}</p>
        )}
      </div>
    </main>
  );
}
