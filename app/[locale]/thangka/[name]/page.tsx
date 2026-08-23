import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getThangkaBySlug, getCategoryWithAncestors, getTangkasByCategory, imgUrl, toPlainText, slugify, thangkaSlug, CategoryItem, ThangkaItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

interface Props {
  params: Promise<{ locale: string; name: string }>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-row">
      <span className="meta-row-label">
        {label}
      </span>
      <span className="meta-row-value">
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
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

  const pageUrl = `${siteUrl}/${locale}/thangka/${name}`;

  return (
    <main className="page-main">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: tCollection("breadcrumb"), item: `${siteUrl}/${locale}/collection` },
            ...ancestorChain.map((cat, i) => ({
              "@type": "ListItem",
              position: i + 2,
              name: catDisplayName(cat),
              item: `${siteUrl}/${locale}${categoryUrl(ancestorChain, i)}`,
            })),
            { "@type": "ListItem", position: ancestorChain.length + 2, name: displayName, item: pageUrl },
          ],
        }}
      />
      {imgSrc && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            name: displayName,
            image: imgSrc,
            description: desc || undefined,
            url: pageUrl,
            artform: "Thangka painting",
            artMedium: thangka.material || undefined,
            dateCreated: thangka.era || undefined,
            identifier: thangka.identify || undefined,
          }}
        />
      )}
      {/* Breadcrumb */}
      <div className="page-breadcrumb-bar">
        <div className="container">
          <nav className="thangka-breadcrumb">
            <Link href="/collection" className="breadcrumb-mid">
              {tCollection("breadcrumb")}
            </Link>

            {ancestorChain.map((cat, i) => (
              <span key={cat.documentId} className="breadcrumb-crumb">
                <span className="breadcrumb-sep">/</span>
                <Link href={categoryUrl(ancestorChain, i)} className="breadcrumb-mid">
                  {catDisplayName(cat)}
                </Link>
              </span>
            ))}

            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{displayName}</span>
          </nav>
        </div>
      </div>

      {/* Detail layout */}
      <div className="thangka-detail-bar">
        <div className="container">
          <div className="thangka-detail-layout">
            <div className="thangka-detail-image">
              <div className="thangka-hero-image">
                {imgSrc ? (
                  <Image src={imgSrc} alt={displayName || "Thangka"} fill sizes="(max-width: 768px) 100vw, 48vw" priority />
                ) : (
                  <div className="media-placeholder" />
                )}
              </div>
            </div>

            <div className="thangka-detail-info">
              {thangka.identify && <span className="eyebrow thangka-identify">{thangka.identify}</span>}
              <h1 className="page-title">
                {displayName}
              </h1>

              {/* Metadata rows */}
              <div className="thangka-meta-rows">
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
                <div className="thangka-desc-wrap">
                  <p className="thangka-desc-text">{desc}</p>
                </div>
              )}

              {ancestorChain.length > 0 && (
                <Link href={categoryUrl(ancestorChain, ancestorChain.length - 1)} className="back-link">
                  {tCollection("back")} {catDisplayName(ancestorChain[ancestorChain.length - 1])}
                </Link>
              )}
            </div>
          </div>

          {/* Related images grid */}
          {!!thangka.relatedImages?.length && (
            <div id="related-images" className="related-images-block">
              <span className="eyebrow thangka-block-eyebrow">Details</span>
              <div className="related-grid">
                {thangka.relatedImages.map((img) => {
                  const src = imgUrl(img.formats?.medium?.url ?? img.formats?.large?.url ?? img.url);
                  return (
                    <Link key={img.documentId} href={`/thangka/${name}/image/${img.documentId}`} className="related-img-link">
                      <div className="related-img">
                        <Image
                          src={src}
                          alt={img.alternativeText || `${displayName} — detail view`}
                          fill
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
          <div id="related-thangkas" className="related-thangkas-block">
            <div className="related-thangkas-header">
              <h2 className="related-thangkas-title">
                Related Thangkas
              </h2>
              {ancestorChain.length > 0 && (
                <Link href={categoryUrl(ancestorChain, ancestorChain.length - 1)} className="view-all-link">
                  View All
                </Link>
              )}
            </div>
            <div className="related-thangkas-grid">
              {relatedThangkas.map((rt) => {
                const rtImg = imgUrl(rt.image?.formats?.medium?.url ?? rt.image?.url ?? "");
                const rtName = (locale === "zh" ? rt.name_zh || rt.name_en : rt.name_en) || "";
                return (
                  <Link key={rt.documentId} href={`/thangka/${thangkaSlug(rt)}`} className="link-reset">
                    <div className="related-img">
                      {rtImg ? (
                        <Image src={rtImg} alt={rtName} fill sizes="25vw" />
                      ) : (
                        <div className="media-placeholder" />
                      )}
                    </div>
                    <p className="related-thangka-name">
                      {[rt.identify, rtName].filter(Boolean).join(" · ")}
                    </p>
                    {rt.size && (
                      <p className="related-thangka-spec">
                        <span className="related-thangka-spec-label">Size</span> {rt.size}
                      </p>
                    )}
                    {rt.material && (
                      <p className="related-thangka-spec">
                        <span className="related-thangka-spec-label">Material</span> {rt.material}
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
    </main>
  );
}
