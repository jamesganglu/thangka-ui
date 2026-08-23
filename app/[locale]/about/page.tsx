import type { Metadata } from "next";
import Image from "next/image";
import { getAbout, imgUrl, extractH2 } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import RichText from "@/components/RichText";

interface Props {
  params: Promise<{ locale: string }>;
}

interface DetailBlock {
  id: number;
  text: unknown;
  image?: { url: string; alternativeText?: string | null; formats?: { medium?: { url: string }; large?: { url: string } } };
}

function SectionDivider() {
  return (
    <div className="section-divider-col">
      <div className="section-divider-line" />
      <div className="section-divider-dot" />
      <div className="section-divider-line" />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  let item: Record<string, unknown> = {};
  try { item = await getAbout(locale); } catch { /* ignore */ }

  const title = (item.title as string) || "Our Story";
  const detail = (item.detail as DetailBlock[] | undefined) ?? [];
  const firstImg = detail.find((b) => b.image)?.image;
  const ogImage = imgUrl(firstImg?.formats?.large?.url ?? firstImg?.formats?.medium?.url ?? firstImg?.url ?? "");

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
    twitter: {
      card: "summary_large_image",
      title,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  let item: Record<string, unknown> = {};
  try { item = await getAbout(locale); } catch { /* CMS not connected */ }

  const title = (item.title as string) || "Our Story";
  const detail = (item.detail as DetailBlock[] | undefined) ?? [];
  const blocks = detail.map((b, idx) => ({
    key: `detail-${idx + 1}`,
    text: b.text,
    imgSrc: imgUrl(b.image?.formats?.medium?.url ?? b.image?.formats?.large?.url ?? b.image?.url ?? ""),
    imgAlt: b.image?.alternativeText || extractH2(b.text) || title,
  }));

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
        <h1 className="page-title">
          {title}
        </h1>
        <div className="page-title-underline page-title-underline--mb-60" />

        {blocks.length > 0 ? (
          blocks.map((block, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <div key={block.key} className="image-text-block-section">
                <div className={`history-section-grid${isEven ? " reverse" : ""}`}>
                  <div><RichText content={block.text} /></div>
                  <div><SectionDivider /></div>
                  {block.imgSrc ? (
                    <div className="image-text-image">
                      <Image src={block.imgSrc} alt={block.imgAlt} fill sizes="(max-width: 900px) 100vw, 50vw" />
                    </div>
                  ) : (
                    <div className="image-text-placeholder" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted-copy">
            This page will be implemented soon.
          </p>
        )}
      </div>
    </main>
  );
}
