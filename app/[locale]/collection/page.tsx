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
    return toPlainText(locale === "zh" ? cat.description_zh || cat.description_en : cat.description_en);
  }

  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      <div style={{ padding: "48px 0 36px" }}>
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 12px" }}>
            {title}
          </h1>
          <div style={{ width: "70px", height: "2px", background: "var(--color-accent)", marginBottom: "16px" }} />
          {!!content && (
            <div style={{ marginTop: "16px", maxWidth: "600px", color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>
              <RichText content={content} />
            </div>
          )}
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="cat-grid">
          {[...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => {
            const img = cat.image?.[0];
            const imgSrc = imgUrl(img?.formats?.medium?.url ?? img?.url ?? "");
            const desc = catDesc(cat);

            return (
              <Link key={cat.documentId ?? cat.id} href={`/collection/${slugify(cat.name_en)}`} style={{ display: "flex", textDecoration: "none", border: "1px solid var(--color-accent)", gap: "24px", alignItems: "stretch", padding: "10px" }}>
                <div style={{ position: "relative", width: "40%", flexShrink: 0, overflow: "hidden", background: "#F5F3EF" }}>
                  {imgSrc ? <Image src={imgSrc} alt={catName(cat)} fill style={{ objectFit: "cover" }} sizes="160px" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "0 0 10px" }}>
                    {catName(cat)}
                  </h3>
                  {desc && <p style={{ fontSize: "13px", color: "#6F6A63", lineHeight: 1.6, margin: "0 0 14px" }}>{desc.length > 120 ? desc.slice(0, 120).trimEnd() + "…" : desc}</p>}
                  <span className="text-link">{t("explore")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`@media (max-width: 640px) { .cat-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
