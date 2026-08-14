import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getBuddhism, imgUrl, extractH2 } from "@/lib/api";
import RichText from "@/components/RichText";
import ScrollSpySidebar from "@/components/ScrollSpySidebar";

function SectionDivider() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", padding: "10px 0" }}>
      <div style={{ flex: 1, width: "1px", background: "var(--color-light)" }} />
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-text)", margin: "3px 0", flexShrink: 0, outline: "1px solid var(--color-light)", outlineOffset: "3px" }} />
      <div style={{ flex: 1, width: "1px", background: "var(--color-light)" }} />
    </div>
  );
}

interface DetailBlock {
  id: number;
  text: unknown;
  image?: { url: string; formats?: { medium?: { url: string }; large?: { url: string } } };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BuddhismPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("history");
  let item: Record<string, unknown> = {};
  try { item = await getBuddhism(locale); } catch { /* CMS not connected */ }

  const detailBlocks = (item.detail as DetailBlock[] | undefined) ?? [];
  const blocks = detailBlocks.map((b, idx) => ({ key: `section-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? "") }));

  const themeItems = (item.themes as DetailBlock[] | undefined) ?? [];
  const themeBlocks = themeItems.map((b, idx) => ({ key: `theme-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? "") }));

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
    <main style={{ background: "#ffffff" }}>
      {heroVideoUrl && (
        <div style={{ position: "relative", width: "100%", height: "50vh", overflow: "hidden" }}>
          <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
            <source src={heroVideoUrl} />
          </video>
        </div>
      )}
      <div className="container" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }} className="history-layout">
          {sections.length > 0 && <ScrollSpySidebar sections={sections} />}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Intro */}
            {(!!item.content || !item.title) && (
              <div id="intro" style={{ marginBottom: "60px" }}>
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
                      <div className="image-text-image">
                        <Image src={block.imgSrc} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
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
              <div style={{ marginTop: "48px" }}>
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
                      <div className="image-text-image">
                        <Image src={block.imgSrc} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
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

      <style>{`
        @media (max-width: 900px) {
          .history-layout { flex-direction: column; }
          .history-layout aside { position: static !important; width: 100% !important; display: flex; flex-wrap: wrap; gap: 8px; }
          .history-layout aside nav { display: flex; flex-wrap: wrap; gap: 8px; }
          .history-layout aside nav a { border-left: none !important; border-bottom: 2px solid transparent; padding-left: 0 !important; padding-bottom: 4px !important; white-space: nowrap; }
        }
      `}</style>
    </main>
  );
}
