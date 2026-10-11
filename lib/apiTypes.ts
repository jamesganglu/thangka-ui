// Pure types/helpers with no server-only dependencies (no fetch, no
// next/headers), so client components (ThangkaCarousel, CategoryCarousel)
// can import them directly without pulling the CMS fetchers in lib/api.ts
// (and its next/headers-using CMS call logging) into the client bundle.

const BASE = process.env.STRAPI_URL ?? "http://localhost:1337";

export function imgUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE}${path}`;
}

export interface CategoryItem {
  id: number;
  documentId: string;
  name_en: string;
  name_zh: string;
  order?: number;
  level?: number;
  updatedAt?: string;
  description_en: unknown;
  description_zh: unknown;
  short_desc_en?: string | null;
  short_desc_zh?: string | null;
  image?: {
    url: string;
    width?: number;
    height?: number;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }[] | null;
  categories?: CategoryItem[] | null;
  category?: CategoryItem | null;
}

export interface ThangkaItem {
  id: number;
  documentId: string;
  identify?: string | null;
  name_en: string;
  name_zh: string;
  updatedAt?: string;
  description_en: unknown;
  description_zh: unknown;
  size?: string | null;
  era?: string | null;
  era_zh?: string | null;
  material?: string | null;
  material_zh?: string | null;
  image?: {
    url: string;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
  category?: CategoryItem | null;
  relatedImages?: {
    id: number;
    documentId: string;
    url: string;
    alternativeText?: string | null;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }[] | null;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Thangka names aren't guaranteed unique (e.g. multiple placeholder
 * entries named "test"), which would make a plain name-based slug
 * collide and route every colliding link to whichever record happens
 * to come first. Disambiguate with the record's own catalog `identify`
 * code (falling back to part of its documentId if that's missing/empty),
 * so every thangka gets a distinct, stable URL.
 */
export function thangkaSlug(t: { name_en: string; identify?: string | null; documentId: string }): string {
  const base = slugify(t.name_en);
  const suffix = slugify(t.identify ?? "") || t.documentId.slice(0, 8);
  return `${base}-${suffix}`;
}

/** Extract plain text from a field that may be a string or Strapi blocks array. */
export function toPlainText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((block: { children?: { text?: string }[] }) =>
      (block.children ?? []).map((c) => c.text ?? "").join("")
    )
    .join(" ");
}

export function extractH2(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") {
    const m = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
    return m ? m[1].replace(/<[^>]+>/g, "") : "";
  }
  if (Array.isArray(content)) {
    const h2 = content.find(
      (b: { type: string; level?: number }) => b.type === "heading" && b.level === 2
    );
    if (h2 && Array.isArray(h2.children)) {
      return h2.children.map((c: { text?: string }) => c.text ?? "").join("");
    }
  }
  return "";
}
