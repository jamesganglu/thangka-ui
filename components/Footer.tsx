import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getContact } from "@/lib/api";

const navItems = [
  { path: "/collection", key: "collection" },
  { path: "/about", key: "about" },
  { path: "/tibetan-history", key: "tibetanHistory" },
  { path: "/buddhism", key: "buddhism" },
  { path: "/contact", key: "contact" },
] as const;


export default async function Footer() {
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const year = new Date().getFullYear();

  let email = "inquiry@tibetanthangkas.com";
  try {
    const contact = await getContact();
    if (contact?.email) email = contact.email as string;
  } catch { /* CMS not connected */ }

  return (
    <footer style={{ borderTop: "1px solid #E8E3DC" }}>
      <div className="container" style={{ paddingTop: "64px", paddingBottom: "48px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px" }}>
        <div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "18px", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.2, color: "#2B2520", marginBottom: "20px" }}>
              TIBETAN<br />THANGKAS
            </div>
          </Link>
        </div>

        <div>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#2B2520", marginBottom: "16px", fontWeight: 600 }}>
            {tFooter("navigation")}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.path} style={{ marginBottom: "10px" }}>
                <Link href={item.path} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#6F6A63", transition: "color 0.2s" }}>
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#2B2520", marginBottom: "16px", fontWeight: 600 }}>
            {tFooter("followUs")}
          </p>
          <a href={`mailto:${email}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#6F6A63", textDecoration: "none" }}>
            {email}
          </a>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E8E3DC", padding: "16px 0", textAlign: "center" }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A9A39C", margin: 0 }}>
          &copy; {year} {tFooter("copyright")}
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div:first-child ~ div { display: none; }
          footer .container { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) { footer .container { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
