import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoriesByParentId, getLevel1Categories, imgUrl, toPlainText, slugify, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import RichText from "@/components/RichText";

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
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
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

  const descContent = locale === "zh" ? parentCategory.description_zh || parentCategory.description_en : parentCategory.description_en;
  const desc = Array.isArray(descContent) && descContent.length > 0 ? descContent : null;
  const parentImg = parentCategory.image?.[0];
  const parentImgSrc = imgUrl(parentImg?.formats?.medium?.url ?? parentImg?.url ?? "");
  const parentImgRatio = parentImg?.width && parentImg?.height ? `${parentImg.width}/${parentImg.height}` : "4/3";

  return (
    <main className="page-main">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("breadcrumb"), item: `${siteUrl}/${locale}/collection` },
            { "@type": "ListItem", position: 2, name: catName(parentCategory), item: `${siteUrl}/${locale}/collection/${slug}` },
          ],
        }}
      />
      <div className="page-breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb-nav">
            <Link href="/collection" className="breadcrumb-link">{t("breadcrumb")}</Link>
            {" / "}
            <span className="breadcrumb-current">{catName(parentCategory)}</span>
          </nav>
        </div>
      </div>

      <div className="page-hero-bar">
        <div className="container">
          <div className="cat-hero">
            <div className="cat-hero-text">
              <span className="eyebrow">{t("category")}</span>
              <h1 className="page-title">
                {catName(parentCategory)}
              </h1>
              <div className="page-title-underline page-title-underline--mb-16" />
              {desc && <div className="cat-hero-desc"><RichText content={desc} /></div>}
              <Link href="/collection" className="back-link">
                {t("back")} {t("breadcrumb")}
              </Link>
            </div>
            <div className="cat-hero-image-fill" style={{ aspectRatio: parentImgRatio }}>
              {parentImgSrc ? <Image src={parentImgSrc} alt={catName(parentCategory)} fill sizes="50vw" /> : <div className="media-placeholder" />}
            </div>
          </div>
        </div>
      </div>

      <div className="container section section--flush-top">
        {subcategories.length === 0 ? (
          <p className="muted-copy">{t("noSubcategories")}</p>
        ) : (
          <div className="cat-grid-cards">
            {[...subcategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
              const img = cat.image?.[0];
              const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
              const catDescText = catDesc(cat);
              const hasChildren = cat.categories && cat.categories.length > 0;

              return (
                <Link key={cat.id} href={`/collection/${slug}/${slugify(cat.name_en)}`} className="cat-card">
                  <div className="cat-card-thumb cat-card-thumb--square">
                    {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill sizes="(max-width: 900px) 50vw, 25vw" /> : <div className="media-placeholder" />}
                  </div>
                  <div className="cat-card-body">
                    <h3 className="cat-card-title">
                      {catName(cat)}
                    </h3>
                    {catDescText && <p className="cat-card-desc">{catDescText}</p>}
                    {hasChildren && <span className="cat-card-explore">{t("explore")}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
