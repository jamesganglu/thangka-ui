import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getBuddhism, imgUrl, toPlainText, extractH2 } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import RichText from "@/components/RichText";
import ScrollSpySidebar from "@/components/ScrollSpySidebar";

function SectionDivider() {
  return (
    <div className="section-divider-col">
      <div className="section-divider-line" />
      <div className="section-divider-dot" />
      <div className="section-divider-line" />
    </div>
  );
}

interface DetailBlock {
  id: number;
  text: unknown;
  image?: { url: string; alternativeText?: string | null; width?: number; height?: number; formats?: { medium?: { url: string }; large?: { url: string } } };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  let item: Record<string, unknown> = {};
  try { item = await getBuddhism(locale); } catch { /* ignore */ }

  const title = (item.title as string) || "Buddhism";
  const description = toPlainText(item.content).slice(0, 160) || "Explore the deities, symbolism, and key themes of Tibetan Buddhism as depicted in thangka art.";
  const detail = (item.detail as DetailBlock[] | undefined) ?? [];
  const firstImg = detail.find((b) => b.image)?.image;
  const ogImage = imgUrl(firstImg?.formats?.large?.url ?? firstImg?.formats?.medium?.url ?? firstImg?.url ?? "");

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/buddhism`,
      languages: { en: `${siteUrl}/en/buddhism`, zh: `${siteUrl}/zh/buddhism`, "x-default": `${siteUrl}/en/buddhism` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/buddhism`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function BuddhismPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("history");
  let item: Record<string, unknown> = {};
  try { item = await getBuddhism(locale); } catch { /* CMS not connected */ }

  const pageTitle = (item.title as string) || "Buddhism";

  const detailBlocks = (item.detail as DetailBlock[] | undefined) ?? [];
  const blocks = detailBlocks.map((b, idx) => ({ key: `section-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? ""), imgAlt: b.image?.alternativeText || extractH2(b.text) || pageTitle, imgWidth: b.image?.width || 800, imgHeight: b.image?.height || 600 }));

  const themeItems = (item.themes as DetailBlock[] | undefined) ?? [];
  const themeBlocks = themeItems.map((b, idx) => ({ key: `theme-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? ""), imgAlt: b.image?.alternativeText || extractH2(b.text) || pageTitle, imgWidth: b.image?.width || 800, imgHeight: b.image?.height || 600 }));

  const heroVideoUrl = (() => {
    const video = item.video as { url?: string } | undefined;
    return imgUrl(video?.url ?? "");
  })();

  interface SidebarSection { id?: string; label: string; children?: SidebarSection[] }
  const sections: SidebarSection[] = [];
  if (blocks.length > 0) {
    sections.push({
      label: t("detailGroup"),
      children: blocks.map((b, idx) => ({
        id: b.key,
        label: extractH2(b.text) || `${t("sectionFallback")} ${idx + 1}`,
      })),
    });
  }
  if (themeBlocks.length > 0) {
    sections.push({
      label: t("keyThemes"),
      children: themeBlocks.map((b, idx) => ({
        id: b.key,
        label: extractH2(b.text) || `${t("sectionFallback")} ${idx + 1}`,
      })),
    });
  }

  return (
    <main className="editorial-main">
      {heroVideoUrl && (
        <div className="editorial-hero-video-wrap">
          <video autoPlay muted loop playsInline className="editorial-hero-video">
            <source src={heroVideoUrl} />
          </video>
        </div>
      )}
      <div className="container editorial-container">
        <div className="history-layout">
          {sections.length > 0 && <ScrollSpySidebar sections={sections} />}

          <div className="history-content">
            {/* Intro */}
            {(!!item.content || !item.title) && (
              <div id="intro" className="mb-60">
                <h1 className="page-title">
                  {(item.title as string) || t("titleFallback")}
                </h1>
                <div className="page-title-underline page-title-underline--mb-24" />
                {!!item.content && <RichText content={item.content} />}
              </div>
            )}

            {/* Text/Image sections */}
            {blocks.map((block, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div key={block.key} className="image-text-block-section">
                  <div id={block.key} className={`history-section-grid${isEven ? " reverse" : ""}`}>
                    <div><RichText content={block.text} /></div>
                    <div><SectionDivider /></div>
                    {block.imgSrc ? (
                      <div className="image-text-image image-text-image--natural">
                        <Image
                          src={block.imgSrc}
                          alt={block.imgAlt}
                          width={block.imgWidth}
                          height={block.imgHeight}
                          sizes="(max-width: 900px) 100vw, 50vw"
                          className="image-text-image-el"
                        />
                      </div>
                    ) : (
                      <div className="image-text-placeholder" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Overall */}
            {!!item.overall && (
              <div className="overall">
                <div>
                  <RichText content={item.overall} />
                </div>
              </div>
            )}

            {/* Themes intro */}
            {!!item.themes_intro && (
              <div className="themes-intro">
                <RichText content={item.themes_intro} />
              </div>
            )}

            {/* Themes */}
            {themeBlocks.map((block, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div key={block.key} className="image-text-block-theme">
                  <div id={block.key} className={`history-section-grid${isEven ? " reverse" : ""}`}>
                    <div><RichText content={block.text} /></div>
                    <div><SectionDivider /></div>
                    {block.imgSrc ? (
                      <div className="image-text-image image-text-image--natural">
                        <Image
                          src={block.imgSrc}
                          alt={block.imgAlt}
                          width={block.imgWidth}
                          height={block.imgHeight}
                          sizes="(max-width: 900px) 100vw, 50vw"
                          className="image-text-image-el"
                        />
                      </div>
                    ) : (
                      <div className="image-text-placeholder" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Themes outro */}
            {!!item.themes_outro && (
              <div className="overall">
                <div>
                  <RichText content={item.themes_outro} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
