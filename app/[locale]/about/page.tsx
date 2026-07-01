import type { Metadata } from "next";
import Image from "next/image";
import { getAbout, imgUrl } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import RichText from "@/components/RichText";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  let item: Record<string, unknown> = {};
  try { item = await getAbout(); } catch { /* ignore */ }

  const title = (item.title as string) || "Our Story";
  const img = item.image as { url?: string; formats?: { large?: { url?: string }; medium?: { url?: string } } } | null;
  const ogImage = imgUrl(img?.formats?.large?.url ?? img?.formats?.medium?.url ?? img?.url ?? "");

  return {
    title,
    description: "Learn about our mission to share authentic Tibetan thangka art and sacred Buddhist painting traditions with the world.",
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
      languages: { en: `${siteUrl}/en/about`, zh: `${siteUrl}/zh/about`, "x-default": `${siteUrl}/en/about` },
    },
    openGraph: {
      title,
      url: `${siteUrl}/${locale}/about`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  await params;
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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#2B2520", margin: "8px 0 12px" }}>{title}</h1>
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
