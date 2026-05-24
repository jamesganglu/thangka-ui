# Thangka Art
## overview
- strapi v5.43.0 as cms
    - all content type definitions are at folder api
- nextjs UI (App Router)
- site name is "Tibetan Thangka" in English, "唐卡艺术" in Chinese
- use style-instruction.md for style reference
- site logo is plain text, same as site name

## api
### base url: localhost:1337
### token
48bf80b06c230b29819d6f1d91360250d06218c519e746d778174b5e28b06ce64f8204706f14d87d15b9a26b6a245761afcde0bb4e0cb5d44160406bcdfb49139378a9bcee3760ad53cc8ceab6f379a3467a014c3624c31412dbb1b57bff4ecda2706f685fbbd066bf5f12e1f2d99033c18076dbfcb59b9fed0881868bc928bb
### verb
GET
### endpoints
| name | endpoint | notes |
|---|---|---|
| homepage | api/homepage?populate=* | |
| history | api/history?populate=* | |
| contactpage | api/contact | |
| buddhism | api/buddhism | |
| about | api/about | |
| collection | api/collection | page header/intro text |
| level1categories | api/categories/?populate=image&fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&filters[level][$eq]=1&fields[4]=order | |
| categoriesbyparentid | api/categories?filters[category][id][$eq]=:id&populate=image&fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&populate=categories | |
| tangkas | api/thangkas?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&populate=image&populate=categories | |
| tangkasbycategory | api/thangkas?populate=image&populate=categories&filters[categories][id][$eq]=:categoryId&fields[0]=name_en&fields[1]=name_zh&fields[2]=size&fields[3]=era | |
| tangkabydocumentid | api/thangkas/:documentId?fields[0]=name_en&fields[1]=description_en&fields[2]=name_zh&fields[3]=description_zh&populate=*&fields[4]=identify&fields[5]=size | |

### lib/api.ts — central API layer
All fetch helpers, type definitions, and utilities live here.

**Functions:**
- `getHomepage()` — fetch homepage content
- `getHistory()` — fetch history page content
- `getContact()` — fetch contact page content
- `getBuddhism()` — fetch buddhism page content
- `getAbout()` — fetch about page content
- `getCollection()` — fetch /collection page header/intro
- `getLevel1Categories()` — fetch top-level categories (level=1)
- `getCategoriesByParentId(parentId)` — fetch child categories by parent id; populates `image` and `categories` (for leaf detection)
- `getTangkasByCategory(categoryId)` — fetch thangkas filtered by category id
- `getTangkas()` — fetch all thangkas
- `imgUrl(path)` — prefix relative paths with BASE url
- `slugify(name)` — `name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")`
- `toPlainText(value)` — extract plain text from string or Strapi blocks array
- `extractH2(content)` — extract first H2 heading text from rich-text content

**Types:**
```ts
CategoryItem {
  id: number; documentId: string;
  name_en: string; name_zh: string; order?: number;
  description_en: unknown; description_zh: unknown;
  image?: { url: string; formats?: { small?/medium?/large?: { url } } }[] | null;
  categories?: CategoryItem[] | null;  // populated children — used for leaf detection
}

ThangkaItem {
  id: number; documentId: string;
  name_en: string; name_zh: string;
  description_en: unknown; description_zh: unknown;
  size?: string | null; era?: string | null;
  image?: { url: string; formats?: { small?/medium?/large?: { url } } } | null;  // single object, NOT array
}
```

## top navigation
- Home
- Collection
- About
- Tibetan History
- Buddhism
- Contact

## bottom navigation (footer top section)
2 columns:
- Site logo (plain text)
- Follow us: Facebook, Instagram, YouTube, Pinterest

## footer
Copyright current year — TIBETAN THANGKAS. ALL RIGHTS RESERVED

## layout
- max-width: 1200px container with 40px horizontal padding (24px ≤900px, 16px ≤640px)
- Fonts: Cormorant Garamond (display/headings), Cinzel (nav/labels), Inter (body)
- Color tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent` (#A87533), `--color-accent-soft`, `--color-border`, `--color-button`
- Global components: `Header`, `Footer`, `RichText`, `ContactForm`, `CategoryCarousel`, `ScrollSpySidebar`

---

## pages

### home (`app/page.tsx`)
Fetch from `homepage` endpoint. Sections:
- **Hero** — `carouselImages[0].formats.large.url` full-width; `heroText` centered on top; "Explore The Collection" button → `/collection`
- **Tibetan History** — 2 col: left `historyText` (40%), right `historyImage.formats.medium.url`
- **Main Deities** — 2 col: left `deitiesImage.formats.medium.url` (40%), right `deitiesText`
- **Thangka Categories** — fetch from `level1categories`; rendered via `CategoryCarousel`; 5-col desktop, 2/1 col responsive; card: `image.formats.small.url`, `name_en`, "Explore →" link to `/collection/[slug]`
- **Our Story** — 2 col: left `storyText` (40%), right `storyImage.formats.medium.url`

### tibetan history (`app/tibetan-history/page.tsx`)
Fetch from `history` endpoint.
- Left: `ScrollSpySidebar` anchored to H2s extracted from text1–8
- Right: `title`, `brief`, then alternating `text1`/`image1` … `text8`/`image8`; divider between sections
- Bottom: `Overall`

### buddhism (`app/buddhism/page.tsx`)
Implemented (basic).

### contact (`app/contact/page.tsx`)
Fetch from `contact` endpoint.
- 2 col: left text content, right `ContactForm`

### about (`app/about/page.tsx`)
Implemented (basic).

---

## collection pages

### level 1 — `/collection` (`app/collection/page.tsx`)
Fetch `collection` (header intro) and `level1categories`.
- Page header: eyebrow "Collection", H1 title, gold divider, intro `RichText`
- Grid: 2-column, each card is a `<Link href="/collection/[slugify(name_en)]">`
  - Card layout: image left (40%), text right (name, description truncated 120 chars, "Explore →")
  - Sorted by `order`

### level 2 — `/collection/[slug]` (`app/collection/[slug]/page.tsx`)
Resolve parent: `getLevel1Categories()` → find by `slugify(name_en) === slug`.
Fetch children: `getCategoriesByParentId(level1.id)`.
- **Breadcrumb**: Collection / Level1Name
- **Hero**: text left (50%), image right (50%, aspect 3/4)
  - Eyebrow "Category", H1 name, gold divider, description
- **4-column card grid** (gap 24px), sorted by `order`:
  - Card image: 133% padding-bottom portrait
  - Card text: centered — name (uppercase Cormorant), description (truncated 50 chars)
  - If `cat.categories?.length > 0`: show "Explore →" label
  - All cards link to `/collection/[slug]/[slugify(cat.name_en)]`
- Responsive: 2-col ≤900px, 1-col ≤480px; hero stacks ≤640px

### level 3 — `/collection/[slug]/[subslug]` (`app/collection/[slug]/[subslug]/page.tsx`)
Resolve chain:
1. `getLevel1Categories()` → find `level1` by slug
2. `getCategoriesByParentId(level1.id)` → find `level2` by subslug
3. `getCategoriesByParentId(level2.id)` → `subcategories`
4. If `subcategories.length === 0`: `getTangkasByCategory(level2.id)` → `thangkas`

- **Breadcrumb**: Collection / Level1Name / Level2Name
- **Hero**: same layout as level 2 (text left 50%, image right 50%, aspect 3/4)
- **If subcategories exist** — 4-column grid (same card style as level 2)
- **If no subcategories** — 3-column thangka grid:
  - Card: portrait image (133% padding-bottom), text left-aligned
  - Name (uppercase Cormorant 16px), then `size · era` (Inter 12px muted)
  - Image src: `t.image?.formats?.medium?.url ?? t.image?.url`
- Responsive: 2-col ≤900px, 1-col ≤480px; hero stacks ≤640px
## view all categories
en/collection/categories