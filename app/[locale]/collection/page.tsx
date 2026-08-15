import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCollection, getLevel1Categories, imgUrl, toPlainText, slugify, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import RichText from "@/components/RichText";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  let collection: Record<string, unknown> = {};
  try { collection = await getCollection(); } catch { /* ignore */ }

  const title = (collection.title as string) || "Collection";
  const description = (toPlainText(collection.content).slice(0, 160)) || "Browse our curated collection of authentic Tibetan thangka paintings.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/collection`,
      languages: { en: `${siteUrl}/en/collection`, zh: `${siteUrl}/zh/collection`, "x-default": `${siteUrl}/en/collection` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/collection`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("collection");

  let collection: Record<string, unknown> = {};
  let categories: CategoryItem[] = [];

  try { collection = await getCollection(); } catch { /* CMS not connected */ }
  try { categories = await getLevel1Categories(); } catch { /* CMS not connected */ }

  const title = (collection.title as string) || t("pageTitle");
  const content = collection.content;

  function catName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }
  function catDesc(cat: CategoryItem) {
    return (locale === "zh" ? cat.short_desc_zh || cat.short_desc_en : cat.short_desc_en) || "";
  }

  return (
    <main className="page-main">
      <div className="collection-header">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-title">
            {title}
          </h1>
          <div className="page-title-underline page-title-underline--mb-16" />
          {!!content && (
            <div className="collection-intro-text">
              <RichText content={content} />
            </div>
          )}
        </div>
      </div>

      <div className="container section section--flush-top">
        <div className="cat-grid">
          {[...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
            const img = cat.image?.[0];
            const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
            const desc = catDesc(cat);

            return (
              <Link key={cat.documentId ?? cat.id} href={`/collection/${slugify(cat.name_en)}`} className="cat-grid-item">
                <div className="cat-grid-image">
                  {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill sizes="160px" /> : <div className="cat-grid-image-placeholder" />}
                </div>
                <div className="cat-grid-body">
                  <h3 className="cat-grid-title">
                    {catName(cat)}
                  </h3>
                  {desc && <p className="cat-grid-desc">{desc}</p>}
                  <span className="text-link">{t("explore")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
