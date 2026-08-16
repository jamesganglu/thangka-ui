import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getThangkaBySlug, imgUrl } from "@/lib/api";
import ThangkaZoom from "@/components/ThangkaZoom";

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

  // Use the original upload (not a downsized format) so there is enough
  // real resolution left to zoom into.
  const src = imgUrl(img.url);
  const displayName = (locale === "zh" ? thangka.name_zh || thangka.name_en : thangka.name_en) || "";

  return (
    <main className="image-lightbox-main">
      <h1 className="image-page-title">
        {displayName}
      </h1>
      <Link href={`/thangka/${name}`} className="image-lightbox-back">
        ← Back to Detail
      </Link>
      <div className="image-lightbox-frame">
        <ThangkaZoom src={src} alt={img.alternativeText || displayName} />
      </div>
    </main>
  );
}
