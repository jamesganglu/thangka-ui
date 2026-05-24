

# Design Direction

Overall visual goal and implementation priorities

- Visual positioning: minimal museum / private gallery / Tibetan sacred art archive.
- Primary focus: large artwork images, generous whitespace, quiet UI, and serif typography.
- Avoid: colorful UI backgrounds, heavy shadows, rounded modern SaaS cards, or busy decorative patterns.
- Use a white background across pages. Decorative marks should be very subtle and never compete with artwork.

| Area | Implementation Rule |
|---|---|
| Visual hierarchy | Artwork first, then title, then metadata and navigation. Use fewer UI elements than a normal e-commerce site. |
| Tone | Elegant, calm, archival, gallery-like. |
| Page width | Desktop max-width 1200px; center aligned. |
| Responsive behavior | Desktop-first demo, but all grids should collapse cleanly for tablet/mobile. |

## Typography System

Google Fonts only - free for commercial web use

Official note: Google Fonts states that its fonts are open source, without cost, and can be used commercially. Recommended source for developer verification: Google Fonts FAQ.

| Use Case | Font | Weight | Desktop Size / Line Height | Notes |
|---|---|---|---|---|
| Logo text | Cormorant Garamond | 600 | 28-32px / 32-36px | Uppercase, letter-spacing 0.02em. |
| Hero / page H1 | Cormorant Garamond | 500-600 | 56-72px / 1.05 | High-impact serif title. Use uppercase for collection and page titles. |
| Section H2 | Cormorant Garamond | 500-600 | 34-42px / 1.15 | For collection headings and page section headings. |
| Card title / artwork name | Cormorant Garamond | 600 | 17-22px / 1.25 | Use uppercase for category and artwork names. |
| Navigation | Cinzel | 500 | 14-15px / 1.2 | Uppercase, letter-spacing 0.08em. |
| Eyebrow / breadcrumb | Cinzel | 500 | 11-13px / 1.4 | Uppercase, gold or dark text. |
| Body text | Inter | 400 | 15-16px / 1.7 | Readable supporting descriptions. |
| Metadata / caption | Inter | 400-500 | 12-14px / 1.5 | For size, code, category labels, small footer links. |

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display: 'Cormorant Garamond', serif;
  --font-nav: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
}
```
## Color Tokens

Use neutral colors so the thangka artworks carry the visual impact

| Token | Hex | Use |
|---|---|---|
| --color-bg | #FFFFFF | Main page background. |
| --color-surface | #FBFAF7 | Optional soft blocks, form panels, subtle card backgrounds. |
| --color-text | #2B2520 | Primary body and heading text. |
| --color-muted | #6F6A63 | Secondary text, captions, metadata. |
| --color-light | #A9A39C | Placeholder text, inactive icons, small annotations. |
| --color-accent | #A87533 | Active nav underline, item numbers, links, subtle icons. |
| --color-accent-soft | #C6A46C | Secondary gold accent, decorative small icons. |
| --color-border | #E8E3DC | Dividers, card border, form input line. |
| --color-button | #1E1713 | Primary dark CTA button. |
| --color-button-hover | #000000 | Button hover state. |

```css
:root {
  --color-bg: #FFFFFF;
  --color-surface: #FBFAF7;
  --color-text: #2B2520;
  --color-muted: #6F6A63;
  --color-light: #A9A39C;
  --color-accent: #A87533;
  --color-accent-soft: #C6A46C;
  --color-border: #E8E3DC;
  --color-button: #1E1713;
  --color-button-hover: #000000;
}
```

## Layout, Grid, Spacing

Desktop implementation baseline

| Item | Value | Notes |
|---|---|---|
| Container max-width | 1200px | Use margin: 0 auto; |
| Page side padding | 40px desktop / 24px tablet / 16px mobile | Keep artwork away from screen edge. |
| Header height | 96px desktop | Logo left, navigation right/center. |
| Section vertical padding | 72-96px | Use 80px default. |
| Hero gap | 48-72px | Use for two-column hero layouts. |
| Grid gap | 32px desktop / 24px tablet | Collection card spacing. |
| Divider | 1px solid #E8E3DC | Very subtle. |
| Image radius | 0-4px | Mostly square/sharp; do not over-round. |
| Shadow | None or very subtle | Avoid SaaS-style cards. |

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section {
  padding: 80px 0;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

@media (max-width: 900px) {
  .container { padding: 0 24px; }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .container { padding: 0 16px; }
  .grid-3 { grid-template-columns: 1fr; }
}
```

## Components

### Reusable frontend components

| Component          | Style Spec                                                                 | Interaction                                      |
|--------------------|----------------------------------------------------------------------------|--------------------------------------------------|
| **Header**         | White background, logo left, nav links uppercase, active nav uses gold underline. | Sticky optional. Hover color: #A87533.          |
| **Breadcrumb**     | Small uppercase text, 11-12px, dark with chevrons. Top of collection/detail pages. | Clickable previous levels.                       |
| **Primary CTA**    | Dark button #1E1713; text white/gold; padding 14px 28px; uppercase nav font. | Hover black, arrow moves 2px right.             |
| **Text link**      | Gold #A87533, uppercase or small caps.                                    | Underline on hover.                              |
| **Artwork card**   | Image + code/name + size. No heavy card background. White page background. | Optional hover: slight opacity or subtle transform. |
| **Category card**  | Image left/top, number in gold, title, short text, Explore link.          | Entire card clickable.                           |
| **Contact form card** | White surface, subtle border/shadow, line inputs.                       | Focus underline gold.                            |

### Button & Nav CSS Examples

```css
.btn-primary {
  background: var(--color-button);
  color: #fff;
  border: 0;
  padding: 14px 28px;
  font-family: var(--font-nav);
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.btn-primary:hover {
  background: var(--color-button-hover);
}

.nav-link.active {
  color: var(--color-accent);
  border-bottom: 2px solid var(--color-accent);
}
```

## CSS Starter Tokens

Can be copied into global CSS

```css
:root {
  --font-display: 'Cormorant Garamond', serif;
  --font-nav: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;

  --color-bg: #FFFFFF;
  --color-surface: #FBF9F7;
  --color-text: #2B2520;
  --color-muted: #6F6A63;
  --color-light: #A9A39C;
  --color-accent: #A87533;
  --color-accent-soft: #C6A46C;
  --color-border: #E8E3DC;
  --color-button: #1E1713;
  --container: 1200px;
  --section-y: 80px;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
}

h1, h2, h3, .display {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: .01em;
}

h1 { font-size: clamp(44px, 6vw, 72px); line-height: 1.05; }
h2 { font-size: clamp(30px, 3.5vw, 42px); line-height: 1.15; }

.container { max-width: var(--container); margin: 0 auto; padding: 0 40px; }
.section { padding: var(--section-y) 0; }

.nav, .eyebrow, .breadcrumb, .btn-primary {
  font-family: var(--font-nav);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.artwork-img { width: 100%; height: auto; display: block; }
.card { border: 1px solid var(--color-border); background: #fff; }
```

## Tailwind Config Starter
```ts
//tailwind.config.js
export default {
    theme: {
        extend: {
            fontFamily: {
                display: ['Cormorant Garamond', 'serif'],
                nav: ['Cinzel', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            colors: {
                bg: '#FFFFFF',
                surface: '#FBFAF7',
                text: '#2B2520',
                muted: '#6F6A63',
                accent: '#A87533',
                accentSoft: '#C6A46C',
                border: '#E8E3DC',
                button: '#1E1713',
            },
            maxWidth: {
                container: '1200px',
            },
        },
    },
};
```