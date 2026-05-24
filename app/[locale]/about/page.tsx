import Image from "next/image";
import { getAbout, imgUrl } from "@/lib/api";
import RichText from "@/components/RichText";

export default async function AboutPage() {
  let item: Record<string, unknown> = {};
  try { item = await getAbout(); } catch { /* CMS not connected */ }

  const title = (item.title as string) || "Our Story";
  const content = item.content;
  const img = item.image as { url?: string; formats?: { large?: { url?: string }; medium?: { url?: string } } } | null;
  const imgSrc = imgUrl(img?.formats?.large?.url ?? img?.formats?.medium?.url ?? img?.url ?? "");

  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      {/* Content */}
      <div className="container section">
        <h1 style={{ margin: "0 0 40px" }}>{title}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "80px", alignItems: "flex-start" }} className="about-grid">
          {/* Text */}
          <div>
            {content ? (
              <RichText content={content} />
            ) : (
              <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75 }}>
                This page will be implemented soon.
              </p>
            )}
          </div>

          {/* Image */}
          {imgSrc && (
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#F5F3EF" }}>
              <Image src={imgSrc} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </main>
  );
}
