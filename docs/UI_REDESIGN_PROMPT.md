# Neo UI -- Wise-Inspired Complete Redesign

> Full visual and structural overhaul of the Neo neobank frontend, modeled
> directly on [Wise's design system](https://wise.design). New color palette,
> rearranged dashboard with a currency-carousel-first layout, generous radii,
> Inter typography, and Wise's "white space is king" philosophy applied to
> every screen. The goal is a UI that feels as polished and confident as
> Wise's own product.

---

## Role

Act as a Principal Product Designer and Senior Frontend Engineer. You are
refining the Neo UI to match the quality, structure, and visual language of
Wise (wise.com). The foundation is already laid. Your job is to complete,
polish, and harden every screen, state, and component.

---

## Visual Reference

All design decisions are grounded in Wise's public design system:

- Color: https://wise.design/foundations/colour
- Typography: https://wise.design/foundations/typography
- Radius: https://wise.design/foundations/radius
- Spacing: https://wise.design/foundations/spacing
- Components: https://wise.design/components
- Home screen pattern: https://mobbin.com/explore/screens/b56addbb-a616-490b-8dda-41ff42b8c310

---

## Product Context

Neo is an **Ethiopian digital neobank** serving retail users. The three
supported currencies are `"ETB"`, `"USD"`, and `"EUR"`.

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 App Router (`src/app`) |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 via `@tailwindcss/postcss` |
| Components | shadcn/ui (`new-york` style) |
| Motion | Framer Motion 12 |
| State | TanStack Query 5, Zustand 5 |
| Icons | lucide-react |
| Font | Inter (`--font-inter` CSS variable wired through `@theme`) |
| Theme | CSS variables in `src/app/globals.css`, toggled via `next-themes` |

### Constraints

- Remap existing CSS variable tokens only. Do not add a parallel theme system.
- shadcn/ui components consume these tokens automatically.
- Mobile-first. All layouts must work from 375px to wide desktop.
- `SupportedCurrency` is `"ETB" | "USD" | "EUR"` -- no other currencies.

---

## Current Implementation Status

### Done
- `src/app/globals.css` -- Full Wise token set applied (light + dark)
- `src/components/dashboard/CurrencyCarousel.tsx` -- snap scroll, dot
  indicators, stagger animation, active card detection, `onActiveCurrencyChange`
  callback
- `src/app/(dashboard)/page.tsx` -- Carousel-first layout with pull-to-refresh
  (Framer Motion drag + `queryClient.invalidateQueries`)
- `src/components/shared/BottomNav.tsx` -- Forest Green active state, spring
  pill indicator

### Needs Work / Not Started
- `QuickActions` -- exists but is not contextual to the active carousel currency
- `RecentTransactions` -- does not accept a currency filter prop
- All Phase 4 pages (cards, loans, profile, settings, security, pots, convert,
  send flow, transactions, KYC, balances detail) -- need full Wise styling pass
- `Sidebar` (desktop) -- needs Forest Green active indicator treatment
- Error and empty states -- inconsistent across pages
- Loading skeletons -- not present on every page

---

## Color System

Sourced from Wise's product color specification. **Already applied in
`globals.css`.** Do not change the tokens -- only fix components that still
reference old colors directly.

### Light Theme `:root`

| Token | Wise Equivalent | Value |
|---|---|---|
| `--background` | Background Screen | `oklch(1 0 0)` / #FFFFFF |
| `--foreground` | Content Primary | `oklch(0.12 0.01 130)` / #0E0F0C |
| `--card` | Background Elevated | `oklch(1 0 0)` / #FFFFFF |
| `--card-foreground` | Content Primary | `oklch(0.12 0.01 130)` / #0E0F0C |
| `--popover` | Background Elevated | `oklch(1 0 0)` / #FFFFFF |
| `--popover-foreground` | Content Primary | `oklch(0.12 0.01 130)` / #0E0F0C |
| `--primary` | Interactive Primary (Forest Green) | `oklch(0.28 0.08 130)` / #163300 |
| `--primary-foreground` | Base Contrast | `oklch(0.99 0 0)` / #FFFFFF |
| `--accent` | Interactive Accent (Bright Green) | `oklch(0.87 0.2 135)` / #9FE870 |
| `--accent-foreground` | Forest Green | `oklch(0.28 0.08 130)` / #163300 |
| `--secondary` | Background Neutral | `oklch(0.97 0.005 130)` |
| `--secondary-foreground` | Content Secondary | `oklch(0.35 0.01 130)` / #454745 |
| `--muted` | Background Neutral | `oklch(0.97 0.005 130)` |
| `--muted-foreground` | Content Secondary | `oklch(0.48 0.01 130)` / #6A6C6A |
| `--destructive` | Sentiment Negative | `oklch(0.5 0.2 25)` / #A8200D |
| `--success` | Sentiment Positive | `oklch(0.42 0.12 135)` / #2F5711 |
| `--success-foreground` | Base Contrast | `oklch(0.99 0 0)` / #FFFFFF |
| `--warning` | Sentiment Warning | `oklch(0.85 0.15 90)` / #EDC843 |
| `--warning-foreground` | Content Primary | `oklch(0.12 0.01 130)` / #0E0F0C |
| `--border` | Border Neutral | `oklch(0.12 0.01 130 / 12%)` |
| `--input` | Border Neutral | `oklch(0.12 0.01 130 / 12%)` |
| `--ring` | Interactive Primary | `oklch(0.28 0.08 130)` / #163300 |

### Dark Theme `.dark`

| Token | Value |
|---|---|
| `--background` | `oklch(0.14 0.01 130)` / #121511 |
| `--foreground` | `oklch(0.95 0.005 130)` / #E8E9E8 |
| `--card` | `oklch(0.19 0.012 130)` / #1C1F1A |
| `--card-foreground` | `oklch(0.95 0.005 130)` |
| `--primary` | `oklch(0.87 0.2 135)` / #9FE870 (Bright Green becomes primary in dark) |
| `--primary-foreground` | `oklch(0.14 0.01 130)` / #121511 |
| `--accent` | `oklch(0.87 0.2 135)` / #9FE870 |
| `--accent-foreground` | `oklch(0.14 0.01 130)` |
| `--secondary` | `oklch(0.22 0.012 130)` / #252822 |
| `--secondary-foreground` | `oklch(0.85 0.005 130)` |
| `--muted` | `oklch(0.22 0.012 130)` |
| `--muted-foreground` | `oklch(0.65 0.008 130)` |
| `--destructive` | `oklch(0.65 0.2 25)` / #EF4444 |
| `--success` | `oklch(0.7 0.18 135)` / #4ADE80 |
| `--success-foreground` | `oklch(0.14 0.01 130)` |
| `--warning` | `oklch(0.85 0.15 90)` / #EDC843 |
| `--warning-foreground` | `oklch(0.14 0.01 130)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 14%)` |
| `--ring` | `oklch(0.87 0.2 135)` |

### Key Color Principles

- White space dominates. Wise says: "We're not afraid of white space."
- Forest Green is the interactive/action color. It appears on buttons, links,
  active nav, and focus rings.
- Bright Green is the accent/celebration color. It appears on success states,
  progress fills, active card highlights, and the currency card itself.
- Content uses a green-tinted gray hierarchy, not pure neutral gray.
- Borders are extremely subtle -- 12% opacity of near-black.

---

## Typography

Wise uses **Inter** as their product typeface. Already configured via
`--font-inter` in `@theme inline`. Keep it.

### Type Scale

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page title | text-2xl (24px) | Semi Bold (600) | Top of each screen |
| Section label | text-sm (14px) | Semi Bold (600) | Category labels above groups |
| Card title / row primary | text-base (16px) | Semi Bold (600) | Card headlines, list primary text |
| Body | text-sm (14px) | Medium (500) | Descriptions, metadata |
| Caption | text-xs (12px) | Medium (500) | Timestamps, helper text |
| Financial hero | text-4xl / text-5xl | Semi Bold (600) | Balance on active currency card |
| Financial inline | text-xl (20px) | Semi Bold (600) | Card balance amounts |
| Nav label | text-[10px] | Semi Bold (600) | Bottom nav labels |

Wise uses Medium (500) as their default body weight, not Regular (400). This
gives text more presence without feeling heavy.

All financial numbers use `.font-tabular` (defined in `globals.css` as
`font-variant-numeric: tabular-nums`).

---

## Radius System

From Wise's mobile radius scale:

| Element | Radius | Tailwind |
|---|---|---|
| Currency carousel cards | 16px | `rounded-2xl` |
| Standard cards, sheets | 16px | `rounded-2xl` |
| Buttons | 10px | `rounded-[10px]` |
| Inputs | 10px | `rounded-[10px]` |
| Badges, chips | 24px | `rounded-3xl` (pill) |
| Avatars, icons | full | `rounded-full` |
| Bottom sheet | 24px top | `rounded-t-3xl` |

Wise uses significantly rounder corners than typical fintech apps. This is a
defining visual trait -- adopt it fully.

---

## Spacing

- Section gaps: 24px (`space-y-6`) mobile, 32px (`space-y-8`) desktop
- Card internal padding: 20px (`p-5`)
- Card gap in lists: 12px (`space-y-3`)
- Inline element gap: 12px (`gap-3`)
- Page horizontal padding: 20px (`px-5`) mobile, 32px (`px-8`) desktop

Wise's philosophy: generous padding, let content breathe. When in doubt, add
more space, not less.

---

## Dashboard Layout -- Currency Carousel First

### Current Structure (already implemented, top to bottom)

1. **Greeting header** (`GreetingHeader`) -- date, name, avatar
2. **Currency carousel** (`CurrencyCarousel`) -- horizontal snap scroll, one
   card per currency (`ETB`, `USD`, `EUR`), active card highlighted with
   `bg-primary`, dot indicators below
3. **Quick actions** (`QuickActions`) -- Send, Receive, Convert, Cards, Loans
4. **FX rate ticker** (`FXRateTicker`)
5. **Pots section** -- `PotCard` list + "New pot" link
6. **Spending insight** (`SpendingInsight`)
7. **Recent activity** (`RecentTransactions`)

The entire page wraps in a Framer Motion drag container for pull-to-refresh.

### What Still Needs Work on the Dashboard

**`QuickActions`** must accept `activeCurrency: SupportedCurrency` as a prop
and pass it as a query param to the relevant flows:
- "Send" → `/send?currency=ETB`
- "Receive" → `/receive?currency=ETB`
- "Convert" → `/convert?from=ETB`
The current implementation has hardcoded hrefs with no currency context.

**`RecentTransactions`** must accept an optional `currency?: SupportedCurrency`
prop and filter the displayed list to that currency. When passed from the
dashboard, it shows only transactions for the active carousel card.

### `CurrencyCarousel` -- Existing Implementation Notes

Located at `src/components/dashboard/CurrencyCarousel.tsx`.
- Uses CSS `snap-x snap-mandatory` + `overflow-x-auto`
- Active index detected via `scroll` event; fires `onActiveCurrencyChange`
- Each card: `min-w-[280px] snap-center rounded-2xl p-5`
- Active card: `bg-primary text-primary-foreground`
- Inactive card: `bg-muted text-foreground`
- Entrance: Framer Motion `opacity 0→1, scale 0.95→1` with stagger
- Dot indicators below when more than one card

---

## Component Standards

### Navigation

**`BottomNav` (already implemented):**
- `bg-card/95 backdrop-blur-xl` surface, `border-t border-border`
- Thin-stroke Lucide icons at 22px
- Active: Forest Green icon + label, spring-animated `layoutId="nav-indicator"`
  pill above the icon
- Inactive: `muted-foreground`
- Labels: `text-[10px] font-semibold`

**`Sidebar` (desktop):**
- `bg-card` surface, `border-r border-border`
- Active item: Forest Green text + 3px left border indicator, no background fill
- Hover: `bg-muted`
- Logo: Forest Green square `rounded-2xl` with white "N"

### Cards

- `bg-card rounded-2xl p-5`
- No border in light mode (depth from background contrast is sufficient)
- In dark mode: `border border-border` for separation
- No shadows (exception: `shadow-sm` on the logo mark in auth screens only)
- Grouped cards can sit on a `bg-muted` container for visual grouping

### Buttons

| Variant | Style |
|---|---|
| Primary | `bg-primary text-primary-foreground rounded-[10px] font-semibold` |
| Secondary | `bg-secondary text-secondary-foreground rounded-[10px]` |
| Ghost | `hover:bg-muted rounded-[10px]` |
| Outline | `border border-border bg-transparent rounded-[10px]` |
| Destructive | `bg-destructive text-white rounded-[10px]` |
| Accent | `bg-accent text-accent-foreground rounded-[10px]` (success CTAs) |

Height: `h-12` default, `h-14` for primary full-width CTAs. No shadows on any
button variant except the shadow is already stripped from shadcn defaults.

### Inputs

- `h-12 rounded-[10px] border-border bg-background px-4`
- Focus: `ring-2 ring-ring/30 border-primary`
- Placeholder: `text-muted-foreground`
- Error: `border-destructive`
- Icon prefix: absolute `left-4 top-1/2 -translate-y-1/2` Lucide icon + `pl-11`

### List Items

- `rounded-2xl px-4 py-3.5`
- Hover/active: `active:bg-muted/60`
- Dividers inside grouped containers: `border-b border-border last:border-0`
- Navigation items show a `ChevronRight` icon

### Badges / Chips

- Pill shape: `rounded-3xl px-3 py-1 text-xs font-semibold`
- Active filter: `bg-primary text-primary-foreground`
- Inactive filter: `bg-muted text-muted-foreground`

### Skeletons

- `bg-muted animate-pulse rounded-2xl`
- Must mirror the exact structure of the real content (same heights, widths)

### Empty States

- Centered: muted Lucide icon at 32px + short message + optional CTA button
- `py-16` vertical padding

---

## Auth Screens

- Centered layout on `bg-background`, no card container needed in auth shell
  (the layout already provides the centered column)
- Logo: Forest Green `rounded-2xl` square with a white Lucide icon, `shadow-sm`
- `h-14 rounded-[10px]` for the primary CTA button, full width
- Inputs: `h-13 rounded-[10px]` with icon prefix
- Wise-style: minimal, confident, lots of breathing room

---

## Full-App Coverage

Apply Wise styling to every route:

- `src/app/(auth)/**` -- login, register
- `src/app/(dashboard)/**` -- home, balances, balance detail, send (3 steps),
  receive, convert, pots (list, new, detail), transactions
- `src/app/(cards)/**` -- cards list, card detail
- `src/app/(loans)/**` -- loans list, loan detail
- `src/app/(profile)/**` -- profile, settings, security
- `src/app/(kyc)/**` -- KYC verification flow
- `src/components/shared/**`
- `src/components/dashboard/**`
- `src/components/cards/**`
- `src/components/send/**`
- `src/components/ui/**`

No page retains previous indigo/violet/blue styling after completion.

---

## Motion

- Carousel: `snap-x` CSS scroll snap (already implemented)
- Card entrance: `opacity 0→1, y 8→0` with `delay: index * 0.04s`
- Pull-to-refresh drag: already wired on dashboard
- Interactive: `active:scale-[0.98]` on tappable elements
- Page transitions: `opacity 0→1` over 200ms, no y-translate
- Progress fills: `duration-500 ease-out`
- Keep all durations under 300ms

---

## Accessibility

- WCAG AA contrast for all text
- Focus rings: `ring-2 ring-ring/50`
- Color never sole indicator of meaning
- Touch targets: 44px minimum (`h-11` / `h-14`)
- Tabular numbers (`font-tabular`) for all financial figures
- Semantic heading hierarchy (`h1` page title, `h2` section headers)
- `aria-label` on icon-only buttons
- `aria-current="page"` on active nav items (already in `BottomNav`)

---

## Implementation Strategy

### Phase 1: Theme Foundation ✅ DONE
- All token values in `src/app/globals.css` replaced with Wise values

### Phase 2: Shared Primitives ✅ LARGELY DONE
- `BottomNav` -- done
- `button`, `input`, `card`, `badge`, `skeleton` -- verify radii and styles

### Phase 3: Dashboard Restructure ✅ LARGELY DONE
- `CurrencyCarousel` -- done
- Carousel-first dashboard layout -- done
- Pull-to-refresh -- done
- **`QuickActions`** -- add `activeCurrency` prop, contextual hrefs **NEEDED**
- **`RecentTransactions`** -- add `currency` filter prop **NEEDED**
- `DashboardSkeleton` -- verify mirrors real layout

### Phase 4: All Other Pages
1. Auth screens (login, register) -- mostly done, verify parity
2. Balances list + balance detail
3. Send flow (recipient → amount → confirm with `SlideToConfirm`)
4. Receive (QR code screen)
5. Convert flow
6. Pots list, new pot, pot detail
7. Cards list + card detail (`CardVisual`)
8. Loans list + loan detail
9. Transactions (full list)
10. Profile, settings, security
11. KYC flow

### Phase 5: Verification
1. State audit: every page has loading skeleton, empty state, error state
2. Dark mode parity check on every screen
3. `npm run type-check` and `npm run build` pass with zero errors

---

## File Inventory

### Core (already exists)
- `src/app/globals.css` -- Wise tokens applied
- `src/app/layout.tsx` -- root layout
- `src/app/global-error.tsx` -- global error boundary

### Providers (already exists)
- `src/providers/AuthProvider.tsx`
- `src/providers/Providers.tsx` -- composes all providers
- `src/providers/QueryProvider.tsx`
- `src/providers/UserProfileLoader.tsx`
- `src/providers/auth-store.ts` -- Zustand auth store

### UI Primitives (already exists, verify styling)
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sonner.tsx`

### Shared (already exists)
- `src/components/shared/BottomNav.tsx` -- done
- `src/components/shared/Sidebar.tsx` -- needs Forest Green active indicator
- `src/components/shared/CurrencyFlag.tsx`
- `src/components/shared/BalanceDisplay.tsx`
- `src/components/shared/AuthGuard.tsx`
- `src/components/shared/ErrorBoundary.tsx`
- `src/components/shared/OfflineBanner.tsx`

### Dashboard (already exists)
- `src/components/dashboard/CurrencyCarousel.tsx` -- done
- `src/components/dashboard/CurrencyCard.tsx`
- `src/components/dashboard/GreetingHeader.tsx`
- `src/components/dashboard/QuickActions.tsx` -- needs `activeCurrency` prop
- `src/components/dashboard/RecentTransactions.tsx` -- needs `currency` prop
- `src/components/dashboard/FXRateTicker.tsx`
- `src/components/dashboard/PotCard.tsx`
- `src/components/dashboard/PotProgressRing.tsx`
- `src/components/dashboard/SpendingInsight.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`

### Feature Components (already exists)
- `src/components/cards/CardVisual.tsx`
- `src/components/send/SlideToConfirm.tsx`

### Hooks (already exists -- do not modify APIs)
- `src/hooks/use-balances.ts`
- `src/hooks/use-wallets.ts` -- exposes `useWalletSummary`, `useTransactions`
- `src/hooks/use-cards.ts`
- `src/hooks/use-loans.ts`
- `src/hooks/use-pots.ts`
- `src/hooks/use-pot-transactions.ts`
- `src/hooks/use-transfers.ts`
- `src/hooks/use-convert.ts`
- `src/hooks/use-fx-rates.ts`
- `src/hooks/use-kyc.ts`
- `src/hooks/use-user.ts`
- `src/hooks/use-resolve-recipient.ts`
- `src/hooks/use-online-status.ts`

---

## Acceptance Criteria

1. The app looks and feels like Wise -- green identity, generous radii,
   white space, Inter typography, carousel-first dashboard.
2. No indigo, violet, blue, or emerald brand styling anywhere.
3. Dashboard `QuickActions` and `RecentTransactions` are contextual to the
   active carousel currency.
4. All pages have intentionally designed loading, empty, and error states.
5. Dark mode quality matches light mode on every screen.
6. `npm run type-check` and `npm run build` pass with zero errors.

---

## Non-Goals

- Do not copy Wise's brand assets (logo, illustrations, Wise Sans font).
- Do not rewrite backend APIs or hook interfaces.
- Do not introduce new UI libraries (shadcn, framer-motion, lucide already cover all needs).
- Do not sacrifice financial data readability.

---

## Priority When Trade-offs Arise

1. Clarity of financial information
2. Consistency across screens
3. Fidelity to Wise's design patterns
4. Visual elegance
