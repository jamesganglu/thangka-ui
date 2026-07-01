import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getHomepage, getLevel1Categories, imgUrl, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import RichText from "@/components/RichText";
import CategoryCarousel from "@/components/CategoryCarousel";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  let item: Record<string, unknown> = {};
  try { item = await getHomepage(); } catch { /* ignore */ }

  type Block = { type: string; children: { text: string }[] };
  const heroKey = locale === "zh" ? "heroText_zh" : "heroText";
  const heroBlocks = Array.isArray(item[heroKey] ?? item.heroText) ? (item[heroKey] ?? item.heroText) as Block[] : [];
  const title = heroBlocks.find((b) => b.type === "heading")?.children.map((c) => c.text).join("") || (locale === "zh" ? "藏传唐卡艺术" : "Tibetan Thangka Art");
  const description = (heroBlocks.filter((b) => b.type === "paragraph").map((b) => b.children.map((c) => c.text).join("")).join(" ") || "Sacred Art. Timeless Heritage. Connecting Wisdom with the World.").slice(0, 160);

  const imgs = item.carouselImages as { formats?: { large?: { url?: string } }; url?: string }[] | undefined;
  const ogImage = imgs?.length ? imgUrl(imgs[0]?.formats?.large?.url ?? imgs[0]?.url ?? "") : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: { en: `${siteUrl}/en`, zh: `${siteUrl}/zh`, "x-default": `${siteUrl}/en` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");

  let item: Record<string, unknown> = {};
  let categories: CategoryItem[] = [];

  try { item = await getHomepage(); } catch { /* Strapi not running */ }
  try { categories = await getLevel1Categories(); } catch { /* ignore */ }

  const heroImageUrl = (() => {
    const imgs = item.carouselImages as { formats?: { large?: { url?: string } }; url?: string }[] | undefined;
    if (!imgs || imgs.length === 0) return "";
    return imgUrl(imgs[0]?.formats?.large?.url ?? imgs[0]?.url ?? "");
  })();

  type Block = { type: string; level?: number; children: { text: string }[] };
  const heroKey = locale === "zh" ? "heroText_zh" : "heroText";
  const heroBlocks = Array.isArray(item[heroKey] ?? item.heroText) ? (item[heroKey] ?? item.heroText) as Block[] : [];
  const heroTitle = heroBlocks.find((b) => b.type === "heading")?.children.map((c) => c.text).join("") || t("heroTitle");
  const heroSubtext = heroBlocks.filter((b) => b.type === "paragraph").map((b) => b.children.map((c) => c.text).join("")).join("\n") || t("heroSubtext");

  const historyImage = item.historyImage as { formats?: { medium?: { url?: string } }; url?: string } | undefined;
  const historyImageUrl = imgUrl(historyImage?.formats?.medium?.url ?? historyImage?.url ?? "");

  const deitiesImage = item.deitiesImage as { formats?: { medium?: { url?: string } }; url?: string } | undefined;
  const deitiesImageUrl = imgUrl(deitiesImage?.formats?.medium?.url ?? deitiesImage?.url ?? "");

  const storyImage = item.storyImage as { formats?: { medium?: { url?: string } }; url?: string } | undefined;
  const storyImageUrl = imgUrl(storyImage?.formats?.medium?.url ?? storyImage?.url ?? "");

  const historyTextKey = locale === "zh" ? "historyText_zh" : "historyText";
  const deitiesTextKey = locale === "zh" ? "deitiesText_zh" : "deitiesText";
  const storyTextKey = locale === "zh" ? "storyText_zh" : "storyText";

  return (
    <main>
      {/* Hero */}
      <section id="hero" style={{ position: "relative", width: "100vw", overflow: "hidden" }}>
        {heroImageUrl && (
          <Image id="hero-image" src={heroImageUrl} alt="Tibetan Thangka" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
        )}
        <div id="hero-text" style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%", padding: "72px 20%", margin: "0 auto", background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1), rgba(255,255,255,0))", textShadow: "0 0 2vw #fff, 0 0 4vw #fff, 0 0 8vw #fff, 0 0 8vw #fff, 0 0 16vw #fff, 0 0 25vw #fff, 0 0 35vw #fff, 0 0 50vw #fff" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(52px, 9vw, 96px)", fontWeight: 400, letterSpacing: "0.07em", textTransform: "uppercase", color: "#2B2520", lineHeight: 0.95, marginBottom: "24px" }}>
            {heroTitle}
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 400, color: "#2B2520", letterSpacing: "0.01em", lineHeight: 1.5, marginBottom: "40px" }}>
            {heroSubtext}
          </p>
          <Link href="/collection" className="btn-primary" style={{ background: "#ffffff", color: "#2B2520", border: "none" }}>
            {t("exploreCollection")}
          </Link>
        </div>
      </section>

      {/* Tibetan History */}
      <section id="tibetan-history" className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "80px", alignItems: "center" }} className="two-col-grid">
            <div>
              <div style={{ marginTop: "16px" }}>
                {item[historyTextKey] ?? item.historyText ? (
                  <RichText content={(item[historyTextKey] ?? item.historyText)!} />
                ) : (
                  <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{t("historyFallback")}</p>
                )}
              </div>
              <Link href="/tibetan-history" className="text-link" style={{ marginTop: "24px", display: "inline-flex" }}>
                {t("learnMore")}
              </Link>
            </div>
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#F5F3EF" }}>
              {historyImageUrl ? <Image src={historyImageUrl} alt="Tibetan History" fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, 60vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
            </div>
          </div>
        </div>
      </section>

      {/* Main Deities */}
      <section className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "80px", alignItems: "center" }} className="two-col-grid two-col-reversed">
            <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#F5F3EF" }}>
              {deitiesImageUrl ? <Image src={deitiesImageUrl} alt="Main Deities" fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, 40vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
            </div>
            <div>
              <div style={{ marginTop: "16px" }}>
                {item[deitiesTextKey] ?? item.deitiesText ? (
                  <RichText content={(item[deitiesTextKey] ?? item.deitiesText)!} />
                ) : (
                  <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{t("deitiesFallback")}</p>
                )}
              </div>
              <Link href="/collection" className="text-link" style={{ marginTop: "24px", display: "inline-flex" }}>
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thangka Categories */}
      <section id="thangka-categories" className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2>{t("categoriesTitle")}</h2>
            <p style={{ color: "#6F6A63", fontSize: "15px", maxWidth: "540px", margin: "12px auto 0", lineHeight: 1.7 }}>{t("categoriesDesc")}</p>
          </div>
          {categories.length > 0 ? (
            <CategoryCarousel categories={categories} locale={locale} />
          ) : (
            <p style={{ textAlign: "center", color: "#A9A39C", fontSize: "14px", padding: "40px 0" }}>{t("noCms")}</p>
          )}
        </div>
      </section>

      {/* Our Story */}
      <section className="section" style={{ background: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "80px", alignItems: "center" }} className="two-col-grid">
            <div>
              <div style={{ marginTop: "16px" }}>
                {item[storyTextKey] ?? item.storyText ? (
                  <RichText content={(item[storyTextKey] ?? item.storyText)!} />
                ) : (
                  <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{t("storyFallback")}</p>
                )}
              </div>
              <Link href="/about" className="text-link" style={{ marginTop: "24px", display: "inline-flex" }}>
                {t("learnMore")}
              </Link>
            </div>
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#F5F3EF" }}>
              {storyImageUrl ? <Image src={storyImageUrl} alt="Our Story" fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, 60vw" /> : <div style={{ width: "100%", height: "100%", background: "#ECDFD0" }} />}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .two-col-reversed > *:first-child { order: 2; }
          .two-col-reversed > *:last-child  { order: 1; }
        }
      `}</style>
    </main>
  );
}
