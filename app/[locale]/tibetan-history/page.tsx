import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getHistory, imgUrl, extractH2 } from "@/lib/api";
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

interface HistoryBlock {
  id: number;
  text: unknown;
  image?: { url: string; formats?: { medium?: { url: string }; large?: { url: string } } };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TibetanHistoryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("history");
  let item: Record<string, unknown> = {};
  try { item = await getHistory(locale); } catch { /* CMS not connected */ }

  const historyBlocks = (item.history as HistoryBlock[] | undefined) ?? [];
  const eventBlocks = (item.event as HistoryBlock[] | undefined) ?? [];
  const historyMapped = historyBlocks.map((b, idx) => ({ key: `history-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? "") }));
  const eventMapped = eventBlocks.map((b, idx) => ({ key: `event-${idx + 1}`, text: b.text, imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? "") }));

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

  return (
    <main style={{ background: "#ffffff" }}>
      <div className="container" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }} className="history-layout">
          {sections.length > 0 && <ScrollSpySidebar sections={sections} />}

          <div style={{ flex: 1, minWidth: 0 }}>
            {(!!item.brief || !item.title) && (
              <div id="intro" style={{ marginBottom: "60px" }}>
                <h1 className="page-title">
                  {(item.title as string) || t("titleFallback")}
                </h1>
                <div className="page-title-underline page-title-underline--mb-24" />
                {!!item.brief && (typeof item.brief === "string" ? <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{item.brief}</p> : <RichText content={item.brief} />)}
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

            {!!item.eventsBrief && (
              <div style={{ marginBottom: "60px" }}>
                {typeof item.eventsBrief === "string" ? (
                  <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{item.eventsBrief}</p>
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
