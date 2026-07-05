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

export default async function TibetanHistoryPage() {
  const t = await getTranslations("history");
  let item: Record<string, unknown> = {};
  try { item = await getHistory(); } catch { /* CMS not connected */ }

  const sections: { id: string; label: string }[] = [];
  if (item.brief || item.title) sections.push({ id: "intro", label: t("intro") });
  for (let i = 1; i <= 8; i++) {
    const text = item[`text${i}`];
    if (!text) continue;
    const label = extractH2(text) || `${t("sectionFallback")} ${i}`;
    sections.push({ id: `section-${i}`, label });
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
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 12px" }}>
                  {(item.title as string) || t("titleFallback")}
                </h1>
                <div style={{ width: "70px", height: "2px", background: "var(--color-accent)", marginBottom: "24px" }} />
                {!!item.brief && (typeof item.brief === "string" ? <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>{item.brief}</p> : <RichText content={item.brief} />)}
              </div>
            )}

            {Array.from({ length: 8 }, (_, idx) => idx + 1).map((i) => {
              const text = item[`text${i}`];
              const imgData = item[`image${i}`] as { url?: string; formats?: { medium?: { url?: string }; large?: { url?: string } } } | undefined;
              if (!text) return null;
              const imgSrc = imgUrl(imgData?.formats?.medium?.url ?? imgData?.formats?.large?.url ?? imgData?.url ?? "");
              const isEven = i % 2 === 0;
              return (
                <div key={i} style={{ marginBottom: "60px" }}>
                  <div id={`section-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr auto 40%", gap: "48px", alignItems: "stretch", direction: isEven ? "rtl" : "ltr" }} className="history-section-grid">
                    <div style={{ direction: "ltr" }}><RichText content={text} /></div>
                    <div style={{ direction: "ltr" }}><SectionDivider /></div>
                    {imgSrc ? (
                      <div style={{ position: "relative", overflow: "hidden", background: "#F5F3EF", direction: "ltr", minHeight: "300px" }}>
                        <Image src={imgSrc} alt="" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
                      </div>
                    ) : (
                      <div style={{ background: "#ECDFD0", direction: "ltr", height: "100%" }} />
                    )}
                  </div>
                </div>
              );
            })}

            {!!item.Overall && (
              <div id="overall" style={{ marginTop: "48px", padding: "40px", background: "var(--color-surface)", border: "1px solid var(--color-accent)", textAlign: "left" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: "#2B2520", lineHeight: 1.5 }}>
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
          .history-section-grid { grid-template-columns: 1fr !important; direction: ltr !important; }
          .history-section-grid > div:nth-child(2) { display: none; }
        }
      `}</style>
    </main>
  );
}
