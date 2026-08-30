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
  try { item = await getHomepage(locale); } catch { /* ignore */ }

  type Block = { type: string; children: { text: string }[] };
  const heroBlocks = Array.isArray(item.heroText) ? item.heroText as Block[] : [];
  const title = heroBlocks.find((b) => b.type === "heading")?.children.map((c) => c.text).join("") || (locale === "zh" ? "藏传唐卡艺术" : "Tibetan Thangka Art");
  const description = (heroBlocks.filter((b) => b.type === "paragraph").map((b) => b.children.map((c) => c.text).join("")).join(" ") || "Sacred Art. Timeless Heritage. Connecting Wisdom with the World.").slice(0, 160);


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
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");

  let item: Record<string, unknown> = {};
  let categories: CategoryItem[] = [];

  try { item = await getHomepage(locale); } catch { /* Strapi not running */ }
  try { categories = (await getLevel1Categories()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); } catch { /* ignore */ }

  const heroVideoUrl = (() => {
    const imgs = item.carouselImages as { url?: string }[] | undefined;
    if (!imgs || imgs.length === 0) return "";
    return imgUrl(imgs[0]?.url ?? "");
  })();

  type Block = { type: string; level?: number; children: { text: string }[] };
  const heroBlocks = Array.isArray(item.heroText) ? item.heroText as Block[] : [];
  const heroTitle = heroBlocks.find((b) => b.type === "heading")?.children.map((c) => c.text).join("") || t("heroTitle");
  const heroSubtext = heroBlocks.filter((b) => b.type === "paragraph").map((b) => b.children.map((c) => c.text).join("")).join("\n") || t("heroSubtext");

  const historyImage = item.historyImage as { formats?: { medium?: { url?: string } }; url?: string } | undefined;
  const historyImageUrl = imgUrl(historyImage?.formats?.medium?.url ?? historyImage?.url ?? "");

  const deitiesImage = item.deitiesImage as { formats?: { medium?: { url?: string } }; url?: string } | undefined;
  const deitiesImageUrl = imgUrl(deitiesImage?.formats?.medium?.url ?? deitiesImage?.url ?? "");

  const storyImage = item.storyImage as { formats?: { medium?: { url?: string } }; url?: string; width?: number; height?: number } | undefined;
  const storyImageUrl = imgUrl(storyImage?.formats?.medium?.url ?? storyImage?.url ?? "");

  const categoriesBlocks = Array.isArray(item.categories) ? item.categories as Block[] : [];
  const categoriesTitle = categoriesBlocks.find((b) => b.type === "heading")?.children.map((c) => c.text).join("") || t("categoriesTitle");
  const categoriesDesc = categoriesBlocks.filter((b) => b.type === "paragraph").map((b) => b.children.map((c) => c.text).join("")).join("\n") || t("categoriesDesc");

  return (
    <main>
      {/* Hero */}
      <section id="hero">
        {heroVideoUrl && (
          <video id="hero-video" autoPlay muted loop playsInline>
            <source src={heroVideoUrl} />
          </video>
        )}
        <div className="hero-scrim" />
        <div className="hero-content container">
          <div id="hero-text">
            <h1 className="hero-title">
              {heroTitle}
            </h1>
            <p className="hero-subtext">
              {heroSubtext}
            </p>
            <Link href="/collection" className="btn-primary hero-cta">
              {t("exploreCollection")}
            </Link>
          </div>
        </div>
      </section>

      {/* Tibetan History */}
      <section id="tibetan-history" className="section">
        <div className="container">
          <div className="two-col-grid">
            <div>
              <div className="home-text-block">
                {item.historyText ? (
                  <RichText content={item.historyText} />
                ) : (
                  <p className="muted-copy">{t("historyFallback")}</p>
                )}
              </div>
              <Link href="/tibetan-history" className="text-link home-learn-more">
                {t("learnMore")}
              </Link>
            </div>
            <div className="home-media">
              {historyImageUrl ? <Image src={historyImageUrl} alt="Tibetan History" fill sizes="(max-width: 640px) 100vw, 60vw" /> : <div className="media-placeholder" />}
            </div>
          </div>
        </div>
      </section>

      {/* Main Deities */}
      <section id="buddhism" className="section">
        <div className="container">
          <div className="two-col-grid two-col-reversed">
            <div className="home-media">
              {deitiesImageUrl ? <Image src={deitiesImageUrl} alt="Main Deities" fill sizes="(max-width: 640px) 100vw, 40vw" /> : <div className="media-placeholder" />}
            </div>
            <div>
              <div className="home-text-block">
                {item.deitiesText ? (
                  <RichText content={item.deitiesText} />
                ) : (
                  <p className="muted-copy">{t("deitiesFallback")}</p>
                )}
              </div>
              <Link href="/buddhism" className="text-link home-learn-more">
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thangka Categories */}
      <section id="thangka-categories" className="section">
        <div className="container">
          <div className="categories-intro">
            <h2>{categoriesTitle}</h2>
            <p className="categories-desc">{categoriesDesc}</p>
          </div>
          {categories.length > 0 ? (
            <CategoryCarousel categories={categories} locale={locale} />
          ) : (
            <p className="categories-empty">{t("noCms")}</p>
          )}
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="section">
        <div className="container">
          <div className="two-col-grid">
            <div>
              <div className="home-text-block">
                {item.storyText ? (
                  <RichText content={item.storyText} />
                ) : (
                  <p className="muted-copy">{t("storyFallback")}</p>
                )}
              </div>
              <Link href="/about" className="text-link home-learn-more">
                {t("learnMore")}
              </Link>
            </div>
            <div className="home-media">
              {storyImageUrl ? (
                <Image
                  src={storyImageUrl}
                  alt="Our Story"
                  width={storyImage?.width || 800}
                  height={storyImage?.height || 600}
                  sizes="(max-width: 640px) 100vw, 60vw"
                  className="home-media-img"
                />
              ) : (
                <div className="media-placeholder" />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
