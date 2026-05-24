const BASE = "http://localhost:1337";
const TOKEN =
  "48bf80b06c230b29819d6f1d91360250d06218c519e746d778174b5e28b06ce64f8204706f14d87d15b9a26b6a245761afcde0bb4e0cb5d44160406bcdfb49139378a9bcee3760ad53cc8ceab6f379a3467a014c3624c31412dbb1b57bff4ecda2706f685fbbd066bf5f12e1f2d99033c18076dbfcb59b9fed0881868bc928bb";

export function imgUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE}${path}`;
}

async function apiFetch(path: string) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export async function getHomepage() {
  const { data } = await apiFetch("api/homepage?populate=*");
  return data;
}

export async function getHistory() {
  const { data } = await apiFetch("api/history?populate=*");
  return data;
}

export async function getContact() {
  const { data } = await apiFetch("api/contact");
  return data;
}

export async function getBuddhism() {
  const { data } = await apiFetch("api/buddhism?populate=*");
  return data;
}

export async function getAbout() {
  const { data } = await apiFetch("api/about?populate=*");
  return data;
}

export async function getLevel1Categories() {
  const { data } = await apiFetch(
    "api/categories/?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&fields[4]=order&filters[level][$eq]=1&populate=image"
  );
  return data as CategoryItem[];
}

export async function getCollection() {
  const { data } = await apiFetch("api/collection");
  return data;
}

export async function getCategoriesByParentId(parentId: string) {
  const { data } = await apiFetch(
    `api/categories?filters[category][id][$eq]=${parentId}&fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&populate[0]=image&populate[1]=categories`
  );
  return data as CategoryItem[];
}

export async function getTangkasByCategory(categoryDocumentId: string) {
  const { data } = await apiFetch(
    `api/thangkas?populate=image&filters[category][documentId][$eq]=${categoryDocumentId}&fields[0]=name_en&fields[1]=name_zh&fields[2]=size&fields[3]=era&fields[4]=material&fields[5]=identify`
  );
  return data as ThangkaItem[];
}

export async function getTangkas() {
  const { data } = await apiFetch(
    "api/thangkas?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&populate=image&populate=categories"
  );
  return data;
}

export async function getThangkaByDocumentId(documentId: string) {
  const { data } = await apiFetch(
    `api/thangkas/${documentId}?populate=*`
  );
  return data as ThangkaItem;
}

export async function getCategoryWithAncestors(documentId: string): Promise<CategoryItem> {
  const { data } = await apiFetch(
    `api/categories/${documentId}?populate[category][populate]=category`
  );
  return data as CategoryItem;
}

export async function getThangkaBySlug(slug: string) {
  const { data } = await apiFetch(
    "api/thangkas?fields[0]=name_en&fields[1]=documentId&pagination[pageSize]=1000"
  );
  const items = data as Pick<ThangkaItem, "id" | "documentId" | "name_en">[];
  const match = items.find((t) => slugify(t.name_en) === slug);
  if (!match) return null;
  return getThangkaByDocumentId(match.documentId);
}

export interface CategoryItem {
  id: number;
  documentId: string;
  name_en: string;
  name_zh: string;
  order?: number;
  level?: number;
  description_en: unknown;
  description_zh: unknown;
  image?: {
    url: string;
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
  description_en: unknown;
  description_zh: unknown;
  size?: string | null;
  era?: string | null;
  material?: string | null;
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
