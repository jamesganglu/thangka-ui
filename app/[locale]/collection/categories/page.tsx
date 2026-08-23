import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLevel1Categories, getCategoriesByParentId, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "All Categories";
  const description = "Browse the full category tree of Tibetan thangka subjects, from deities and lineage masters to protectors and mandalas.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/collection/categories`,
      languages: { en: `${siteUrl}/en/collection/categories`, zh: `${siteUrl}/zh/collection/categories`, "x-default": `${siteUrl}/en/collection/categories` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/collection/categories`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("collection");

  let level1: CategoryItem[] = [];
  try { level1 = await getLevel1Categories(); } catch { /* CMS not connected */ }

  const sorted = [...level1].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const withChildren = await Promise.all(
    sorted.map(async (cat) => {
      let children: CategoryItem[] = [];
      try { children = await getCategoriesByParentId(String(cat.id)); } catch { /* */ }
      return { cat, children: [...children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) };
    })
  );

  function catName(cat: CategoryItem) {
    return (locale === "zh" ? cat.name_zh || cat.name_en : cat.name_en) || "";
  }

  return (
    <main className="page-main">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("breadcrumb"), item: `${siteUrl}/${locale}/collection` },
            { "@type": "ListItem", position: 2, name: "Categories", item: `${siteUrl}/${locale}/collection/categories` },
          ],
        }}
      />
      {/* Breadcrumb */}
      <div className="page-breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb-nav">
            <Link href="/collection" className="breadcrumb-link">{t("breadcrumb")}</Link>
            {" / "}
            <span className="breadcrumb-current">Categories</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="categories-header">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-title">
            All Categories
          </h1>
          <div className="page-title-underline" />
        </div>
      </div>

      {/* Tree */}
      <div className="container categories-tree-container">
        <div className="categories-tree">
          {withChildren.map(({ cat: l1, children: l2s }) => (
            <div key={l1.documentId ?? l1.id} className="cat-tree-l1">
              {/* L1 */}
              <span className="cat-tree-l1-label">
                {catName(l1)}
              </span>

              {/* L2 */}
              {l2s.length > 0 && (
                <div className="cat-tree-l2-group">
                  {l2s.map((l2) => {
                    const l3s = [...(l2.categories ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                    return (
                      <div key={l2.documentId ?? l2.id} className="cat-tree-l2">
                        {/* L2 name */}
                        <span className="cat-tree-l2-label">
                          {catName(l2)}
                        </span>

                        {/* L3 */}
                        {l3s.length > 0 && (
                          <div className="cat-tree-l3-group">
                            {l3s.map((l3) => (
                              <div key={l3.documentId ?? l3.id} className="cat-tree-l3">
                                <span className="cat-tree-l3-label">
                                  {catName(l3)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
