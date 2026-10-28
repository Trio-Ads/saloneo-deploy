# Saloneo — Design system "Studio"

Saloneo is a booking and management app for beauty salons in Algeria (coiffure, esthétique, onglerie, barbier, spa).
Users: salon owners and their staff, mostly on phones between two clients, sometimes on a desk PC. Languages: fr (default), ar (RTL), en, es, pt, tr, ber.

## Brand (fixed — do not change)

| Token | Value | Use |
|---|---|---|
| orange-500 `--primary` | #F97316 | the one action color: primary buttons, active nav, focus, links, key numbers |
| orange-600 `--primary-dark` | #EA580C | hover of primary |
| orange-50 / 700 | #FFF7ED / #C2410C | tinted highlight, orange badges |
| gray (zinc) 50…900 | #FAFAFA … #18181B | every surface, border and text |
| dark page `--background` | #0F1419 | dark mode page |

Fonts: **Plus Jakarta Sans** (`font-display`, headings, numbers) + **Inter** (body). Noto Sans Arabic for `dir=rtl`.

## App surfaces (mode: Operate)

The app is a calm studio: white panels on a near-white page, orange only where something can be done or is selected.

- **Page**: `bg-gray-50 dark:bg-[#0F1419]`. MainLayout already provides the container (`.container-2025` = max-w-7xl + horizontal padding); a page root is just `<div className="py-6 sm:py-8">` — no extra max-w/px, no gradient page backgrounds.
- **Page header**: `<PageHeader title subtitle meta actions />` from `src/components/ui.tsx`. No icon tile next to the title, no gradient text, no emoji.
- **Panels**: `<Panel>` (or `.panel` / legacy `.glass-card`): white, 1px gray-200 border, radius 16px, shadow `0 1px 2px rgb(24 24 27 / .04)`. Never nest a panel in a panel — inside a panel use rows separated by `divide-y divide-gray-100`.
- **Stats**: `<StatGroup items>` — one strip divided in cells. Not a row of four floating cards with colored icon tiles.
- **Lists** (appointments, clients, services, products, team): rows inside one panel. Row = avatar/initial (gray-100 circle, gray-700 text) · primary text (gray-900, medium) · secondary text (gray-500, sm) · badges · trailing `IconButton`s. Responsive: on mobile the row stacks, actions collapse to the end.
- **Badges**: `<Badge tone>`; appointment status via `statusTone(status)` (scheduled=orange, confirmed=blue, completed=green, cancelled=red, no-show=amber).
- **Buttons**: `.btn-primary` (solid orange), `.btn-secondary` (white + border), `.btn-ghost`, `IconButton` for icon-only (always with `label`). One primary button per view region.
- **Inputs**: `.field` (or legacy `.glass-input`); label above in `text-sm font-medium text-gray-700`, help/error below in `text-xs`.
- **Tabs / view switches**: `<Segmented>`.
- **Empty states**: `<EmptyState icon title body action>` — says what to do next.
- **Icons**: heroicons/lucide, 16–20px, `text-gray-400/500`, inherits color. Never colored gradient tiles behind icons.
- **Type scale**: page title 28px semibold · panel title 16px semibold · body 14–15px · label 13px medium gray-500 · caption 12px. Sentence case everywhere — no uppercase+tracking labels. Numbers `tabular-nums`.
- **Radius**: 16px panels · 12px controls/inputs/buttons · 8px icon buttons · full for avatars/badges only.
- **Motion** (Emil Kowalski rules): only on user action. 150ms `ease-out` for color/background; buttons `active:scale-[0.98]`; modals/popovers enter 200ms ease-out from `scale(.97) opacity 0`, exit faster; no hover lift/scale on cards, no pulse/bounce/glow loops, no stagger on page load. Respect `prefers-reduced-motion`.
- **Dark mode**: panels `dark:bg-gray-900 dark:border-gray-800`, text gray-50/400. Orange stays orange-400 in dark.
- **RTL**: logical utilities only (`ms-/me-/ps-/pe-/start-/end-/text-start/border-s`). Never `ml-/mr-/left-/right-/text-left` for layout.
- **Money**: `formatPrice()` from `src/utils/currency.ts` → "2 500 DA". Default currency DZD.

## Public salon pages (mode: Experience/Persuade)

Each salon chooses a template from the template collection (`src/features/templates`). A template owns its palette, typefaces, radius and section variants; the salon's own colors from "Mon Interface → Couleurs" override the template palette. The Saloneo orange does not appear on salon pages unless the salon picks it.

## Marketing site (mode: Persuade)

Landing, pricing, auth pages use the brand above with more expression (photography, large type), never glass cards, glow shadows or fake metrics.
