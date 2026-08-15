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
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="footer-logo-link">
            <div className="footer-logo-text">
              TIBETAN<br />THANGKAS
            </div>
          </Link>
        </div>

        <div>
          <p className="footer-col-title">
            {tFooter("navigation")}
          </p>
          <ul className="footer-nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="footer-nav-item">
                <Link href={item.path} className="footer-nav-link">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-col-title">
            {tFooter("followUs")}
          </p>
          <a href={`mailto:${email}`} className="footer-email-link">
            {email}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {year} {tFooter("copyright")}
        </p>
      </div>
    </footer>
  );
}
