import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getContact, toPlainText } from "@/lib/api";
import { siteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Contact",
    description: "Get in touch with us to inquire about Tibetan thangka paintings, commissions, or general questions.",
    alternates: {
      canonical: `${siteUrl}/${locale}/contact`,
      languages: { en: `${siteUrl}/en/contact`, zh: `${siteUrl}/zh/contact`, "x-default": `${siteUrl}/en/contact` },
    },
    openGraph: {
      title: "Contact",
      url: `${siteUrl}/${locale}/contact`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function ContactPage({ params }: Props) {
  await params;
  const t = await getTranslations("contact");

  let item: Record<string, unknown> = {};
  try { item = await getContact(); } catch { /* CMS not connected */ }

  const email = (item.email as string) || "inquiry@tibetanthangkas.com";
  const address = toPlainText(item.mailAddress) || "123 E 7th Avenue, Suite 1206\nNew York, NY 10031\nUnited States";
  const phone = (item.phone as string) || "+1 (212) 555-0708";
  const intro = toPlainText(item.content);

  return (
    <main style={{ background: "#ffffff", minHeight: "80vh" }}>
      <section className="section">
        <div className="container">
          <div>
            <h1 style={{ margin: "0 0 16px" }}>{t("title")}</h1>
            {intro && <p style={{ color: "#6F6A63", fontSize: "15px", lineHeight: 1.75, marginBottom: "40px" }}>{intro}</p>}

            <ContactDetail icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>} label={t("email")} value={email} href={`mailto:${email}`} />
            <ContactDetail icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>} label={t("mailingAddress")} value={address} />
            <ContactDetail icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.74 3.4 2 2 0 0 1 3.71 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.08-1.08a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>} label={t("phone")} value={phone} href={`tel:${phone.replace(/\s/g, "")}`} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactDetail({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
      <div style={{ color: "#A87533", flexShrink: 0, marginTop: "2px" }}>{icon}</div>
      <div>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2B2520", marginBottom: "4px", fontWeight: 600 }}>{label}</p>
        {href ? (
          <a href={href} style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#6F6A63", lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</a>
        ) : (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#6F6A63", lineHeight: 1.6, whiteSpace: "pre-line", margin: 0 }}>{value}</p>
        )}
      </div>
    </div>
  );
}
