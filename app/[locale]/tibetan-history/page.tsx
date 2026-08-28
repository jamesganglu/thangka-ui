import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getHistory, imgUrl, toPlainText, extractH2 } from "@/lib/api";
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

interface HistoryBlock {
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
  try { item = await getHistory(locale); } catch { /* ignore */ }

  const title = (item.title as string) || "Tibetan History";
  const description = toPlainText(item.brief).slice(0, 160) || "Discover the 1,300-year history of Tibetan Buddhist art, from its 7th-century origins to the thangka traditions collected today.";
  const historyBlocks = (item.history as HistoryBlock[] | undefined) ?? [];
  const firstImg = historyBlocks.find((b) => b.image)?.image;
  const ogImage = imgUrl(firstImg?.formats?.large?.url ?? firstImg?.formats?.medium?.url ?? firstImg?.url ?? "");

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/tibetan-history`,
      languages: { en: `${siteUrl}/en/tibetan-history`, zh: `${siteUrl}/zh/tibetan-history`, "x-default": `${siteUrl}/en/tibetan-history` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/tibetan-history`,
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

export default async function TibetanHistoryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("history");
  let item: Record<string, unknown> = {};
  try { item = await getHistory(locale); } catch { /* CMS not connected */ }

  const pageTitle = (item.title as string) || "Tibetan History";

  const historyBlocks = (item.history as HistoryBlock[] | undefined) ?? [];
  const eventBlocks = (item.event as HistoryBlock[] | undefined) ?? [];
  const historyMapped = historyBlocks.map((b, idx) => ({ key: `history-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? ""), imgAlt: b.image?.alternativeText || extractH2(b.text) || pageTitle, imgWidth: b.image?.width || 800, imgHeight: b.image?.height || 600 }));
  const eventMapped = eventBlocks.map((b, idx) => ({ key: `event-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? ""), imgAlt: b.image?.alternativeText || extractH2(b.text) || pageTitle, imgWidth: b.image?.width || 800, imgHeight: b.image?.height || 600 }));

  interface SidebarSection { id?: string; label: string; children?: SidebarSection[] }
  const sections: SidebarSection[] = [];
  if (historyBlocks.length > 0) {
    sections.push({
      label: t("historyGroup"),
      children: historyBlocks.map((b, idx) => ({
        id: `history-${idx + 1}`,
        label: extractH2(b.text) || `${t("sectionFallback")} ${idx + 1}`,
      })),
    });
  }
  if (eventBlocks.length > 0) {
    sections.push({
      label: t("eventGroup"),
      children: eventBlocks.map((b, idx) => ({
        id: `event-${idx + 1}`,
        label: extractH2(b.text) || `${t("sectionFallback")} ${idx + 1}`,
      })),
    });
  }
  if (item.Overall) sections.push({ id: "overall", label: extractH2(item.Overall) || t("keyThemes") });

  const heroVideoUrl = (() => {
    const video = item.video as { url?: string } | undefined;
    return imgUrl(video?.url ?? "");
  })();

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
            {(!!item.brief || !item.title) && (
              <div id="intro" className="mb-60">
                <h1 className="page-title">
                  {(item.title as string) || t("titleFallback")}
                </h1>
                <div className="page-title-underline page-title-underline--mb-24" />
                {!!item.brief && (typeof item.brief === "string" ? <p className="muted-copy">{item.brief}</p> : <RichText content={item.brief} />)}
              </div>
            )}

            {historyMapped.map((block, idx) => {
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

            {!!item.eventsBrief && (
              <div className="mb-60">
                {typeof item.eventsBrief === "string" ? (
                  <p className="muted-copy">{item.eventsBrief}</p>
                ) : (
                  <RichText content={item.eventsBrief} />
                )}
              </div>
            )}

            {eventMapped.map((block, idx) => {
              const isEven = (historyMapped.length + idx) % 2 === 1;
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

            {!!item.Overall && (
              <div id="overall" className="overall">
                <div>
                  <RichText content={item.Overall} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
