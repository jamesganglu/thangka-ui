import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getThangkaBySlug, imgUrl } from "@/lib/api";

interface Props {
  params: Promise<{ locale: string; name: string; imageId: string }>;
}

export default async function ThangkaImagePage({ params }: Props) {
  const { locale, name, imageId } = await params;

  let thangka;
  try { thangka = await getThangkaBySlug(name); } catch { notFound(); }
  if (!thangka) notFound();

  const img = thangka.relatedImages?.find((i) => i.documentId === imageId);
  if (!img) notFound();

  const src = imgUrl(img.formats?.large?.url ?? img.url);
  const displayName = (locale === "zh" ? thangka.name_zh || thangka.name_en : thangka.name_en) || "";

  return (
    <main style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: "24px" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.06em", color: "#2B2520", margin: 0, textAlign: "center" }}>
        {displayName}
      </h1>
      <Link href={`/thangka/${name}`} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6F6A63", textDecoration: "none" }}>
        ← Back to Detail
      </Link>
      <div style={{ position: "relative", width: "100%", maxWidth: "800px", aspectRatio: "3/4" }}>
        <Image
          src={src}
          alt={img.alternativeText || displayName}
          fill
          style={{ objectFit: "contain" }}
          sizes="(max-width: 800px) 100vw, 800px"
          priority
        />
      </div>
    </main>
  );
}
