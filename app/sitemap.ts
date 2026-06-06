import type { MetadataRoute } from "next";
import { getLevel1Categories, getCategoriesByParentId, getTangkas, slugify, CategoryItem } from "@/lib/api";
import { siteUrl } from "@/lib/site";

const locales = ["en", "zh"] as const;

function entry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}/en${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: `${siteUrl}/en${path}`,
        zh: `${siteUrl}/zh${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const path of ["", "/collection", "/about", "/contact", "/tibetan-history"]) {
    entries.push(entry(path));
  }

  // Level 1 categories
  let level1: CategoryItem[] = [];
  try { level1 = await getLevel1Categories(); } catch { /* CMS unavailable */ }

  for (const cat of level1) {
    const slug = slugify(cat.name_en);
    entries.push(entry(`/collection/${slug}`));

    let level2: CategoryItem[] = [];
    try { level2 = await getCategoriesByParentId(String(cat.id)); } catch { /* ignore */ }

    for (const sub of level2) {
      const subslug = slugify(sub.name_en);
      entries.push(entry(`/collection/${slug}/${subslug}`));
    }
  }

  // Individual thangka pages
  let thangkas: { name_en: string }[] = [];
  try { thangkas = await getTangkas(); } catch { /* CMS unavailable */ }

  for (const t of thangkas) {
    entries.push(entry(`/thangka/${slugify(t.name_en)}`));
  }

  return entries;
}
