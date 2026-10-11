import { recordApiCall } from "./apiCallLog";
import { thangkaSlug, type CategoryItem, type ThangkaItem } from "./apiTypes";

// Re-export the client-safe pieces so existing imports from "@/lib/api"
// keep working. Client components should import these directly from
// "@/lib/apiTypes" instead, to avoid pulling the next/headers-using CMS
// call logging (below) into the client bundle.
export * from "./apiTypes";

const BASE = process.env.STRAPI_URL ?? "http://localhost:1337";
const TOKEN = process.env.STRAPI_TOKEN ?? "";

async function apiFetch(path: string) {
  let status: number | "error" = "error";
  try {
    const res = await fetch(`${BASE}/${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 60 },
    });
    status = res.status;
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return await res.json();
  } finally {
    await recordApiCall({ path, status });
  }
}

export async function getHomepage(locale?: string) {
  const localeParam = locale === "zh" ? "&locale=zh" : "";
  const { data } = await apiFetch(`api/homepage?populate=*${localeParam}`);
  return data;
}

export async function getHistory(locale?: string) {
  const localeParam = locale === "zh" ? "&locale=zh" : "";
  const { data } = await apiFetch(`api/history?populate[event][populate]=*&populate[history][populate]=*&populate[video][populate]=*${localeParam}`);
  return data;
}

export async function getContact(locale?: string) {
  const localeParam = locale === "zh" ? "?locale=zh" : "";
  const { data } = await apiFetch(`api/contact${localeParam}`);
  return data;
}

export async function getBuddhism(locale?: string) {
  const localeParam = locale === "zh" ? "&locale=zh" : "";
  const { data } = await apiFetch(`api/buddhism?populate[detail][populate]=*&populate[themes][populate]=*&populate[video][populate]=*${localeParam}`);
  return data;
}

export async function getAbout(locale?: string) {
  const localeParam = locale === "zh" ? "&locale=zh" : "";
  const { data } = await apiFetch(`api/about?populate[detail][populate]=*&populate[video][populate]=*${localeParam}`);
  return data;
}

export async function getLevel1Categories() {
  const { data } = await apiFetch(
    "api/categories/?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&fields[4]=order&fields[5]=short_desc_en&fields[6]=short_desc_zh&filters[level][$eq]=1&populate=image"
  );
  return data as CategoryItem[];
}

export async function getCollection(locale?: string) {
  const localeParam = locale === "zh" ? "?locale=zh" : "";
  const { data } = await apiFetch(`api/collection${localeParam}`);
  return data;
}

export async function getCategoriesByParentId(parentId: string) {
  const { data } = await apiFetch(
    `api/categories?filters[category][id][$eq]=${parentId}&populate=*`
  );
  return data as CategoryItem[];
}

export async function getTangkasByCategory(categoryDocumentId: string) {
  const { data } = await apiFetch(
    `api/thangkas?populate=image&filters[category][documentId][$eq]=${categoryDocumentId}&fields[0]=name_en&fields[1]=name_zh&fields[2]=size&fields[3]=era&fields[4]=material&fields[5]=identify&fields[6]=era_zh&fields[7]=material_zh`
  );
  return data as ThangkaItem[];
}

export async function getTangkas() {
  const { data } = await apiFetch(
    "api/thangkas?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&fields[4]=identify&populate=image&populate=categories"
  );
  return data as ThangkaItem[];
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
    "api/thangkas?fields[0]=name_en&fields[1]=documentId&fields[2]=identify&pagination[pageSize]=1000"
  );
  const items = data as Pick<ThangkaItem, "id" | "documentId" | "name_en" | "identify">[];
  const match = items.find((t) => thangkaSlug(t) === slug);
  if (!match) return null;
  return getThangkaByDocumentId(match.documentId);
}
