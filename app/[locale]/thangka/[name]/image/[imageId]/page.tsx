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
    <main className="image-lightbox-main">
      <h1 className="image-page-title">
        {displayName}
      </h1>
      <Link href={`/thangka/${name}`} className="image-lightbox-back">
        ← Back to Detail
      </Link>
      <div className="image-lightbox-frame">
        <Image
          src={src}
          alt={img.alternativeText || displayName}
          fill
          sizes="(max-width: 800px) 100vw, 800px"
          priority
        />
      </div>
    </main>
  );
}
