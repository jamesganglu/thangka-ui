import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NotFoundEndpoint from "@/components/NotFoundEndpoint";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="page-main">
      <div className="container section not-found-section">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="page-title">{t("title")}</h1>
        <div className="page-title-underline page-title-underline--mb-24" />
        <p className="muted-copy">{t("description")}</p>
        <NotFoundEndpoint />
        <div className="not-found-actions">
          <Link href="/" className="back-link">{t("backHome")}</Link>
          <Link href="/collection" className="back-link">{t("backCollection")}</Link>
        </div>
      </div>
    </main>
  );
}
