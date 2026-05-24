import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLevel1Categories, getCategoriesByParentId, CategoryItem } from "@/lib/api";

interface Props {
  params: Promise<{ locale: string }>;
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
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "20px 0 0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#6F6A63" }}>
            <Link href="/collection" style={{ color: "#6F6A63", textDecoration: "none" }}>{t("breadcrumb")}</Link>
            {" / "}
            <span style={{ color: "#2B2520" }}>Categories</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "32px 0 48px" }}>
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 12px" }}>
            All Categories
          </h1>
          <div style={{ width: "70px", height: "2px", background: "var(--color-accent)" }} />
        </div>
      </div>

      {/* Tree */}
      <div className="container" style={{ paddingBottom: "80px" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {withChildren.map(({ cat: l1, children: l2s }, i1) => {
            const isLastL1 = i1 === withChildren.length - 1;

            return (
              <div key={l1.documentId ?? l1.id} style={{ marginBottom: isLastL1 ? 0 : "40px" }}>
                {/* L1 */}
                <span style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2B2520" }}>
                  {catName(l1)}
                </span>

                {/* L2 */}
                {l2s.length > 0 && (
                  <div style={{ marginTop: "10px", borderLeft: "1px solid var(--color-border)", paddingLeft: "24px" }}>
                    {l2s.map((l2, i2) => {
                      const l3s = [...(l2.categories ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                      const isLastL2 = i2 === l2s.length - 1;

                      return (
                        <div key={l2.documentId ?? l2.id} style={{ marginBottom: isLastL2 ? 0 : "8px" }}>
                          {/* L2 name */}
                          <span style={{ fontSize: "clamp(15px, 1.6vw, 18px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#4A4540" }}>
                            {catName(l2)}
                          </span>

                          {/* L3 */}
                          {l3s.length > 0 && (
                            <div style={{ marginTop: "6px", borderLeft: "1px solid var(--color-border)", paddingLeft: "24px" }}>
                              {l3s.map((l3, i3) => {
                                const isLastL3 = i3 === l3s.length - 1;
                                return (
                                  <div key={l3.documentId ?? l3.id} style={{ marginBottom: isLastL3 ? 0 : "4px" }}>
                                    <span style={{ fontSize: "clamp(13px, 1.4vw, 15px)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6F6A63" }}>
                                      {catName(l3)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
