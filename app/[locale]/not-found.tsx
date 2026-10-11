import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NotFoundEndpoint from "@/components/NotFoundEndpoint";
import { getLastResolvedEntity } from "@/lib/notFoundContext";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tEntity = await getTranslations("notFound.entityLabel");
  const lastResolved = await getLastResolvedEntity();

  return (
    <main className="page-main">
      <div className="container section not-found-section">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="page-title">{t("title")}</h1>
        <div className="page-title-underline page-title-underline--mb-24" />
        <p className="muted-copy">{t("description")}</p>
        <NotFoundEndpoint />
        {lastResolved && (
          <div className="not-found-last-record">
            <p className="muted-copy">{t("lastKnownRecord", { label: tEntity(lastResolved.label) })}</p>
            <code className="not-found-path">{lastResolved.documentId}</code>
          </div>
        )}
        <div className="not-found-actions">
          <Link href="/" className="back-link">{t("backHome")}</Link>
          <Link href="/collection" className="back-link">{t("backCollection")}</Link>
        </div>
      </div>
    </main>
  );
}
