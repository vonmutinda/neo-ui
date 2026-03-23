# Neo UI Comprehensive Audit & Redesign Specification

---

## Phase 1: Walkthrough Summary

The app is a fintech product (Neo — Ethiopian Digital Banking) built with Next.js 16, React 19, Tailwind v4, shadcn/ui (New York style), Framer Motion, and Lucide icons. It has two audiences: personal banking users and admin staff.

**Personal app**: 7 route groups, ~30 pages covering auth, dashboard, balances, send/receive/convert, recipients, payment requests, cards, loans, pots, transactions, profile, KYC.

**Admin app**: 15 pages covering dashboard analytics, customer management, transactions, loans, cards, reconciliation, audit log, flags, money flow map/globe, staff management, settings.

**Design system**: OKLCH color tokens (forest green hue ~130-135), Inter + Geist Mono fonts, shadcn/ui primitives (button, input, card, sheet, badge, separator, skeleton, sonner), Framer Motion animations.

---

## Phase 2: Audit Findings

---

### 2.1 Navigation Redundancy

**Finding: Profile is accessible from 4 distinct entry points.**

| #   | Location              | File                                                | Mechanism                                   |
| --- | --------------------- | --------------------------------------------------- | ------------------------------------------- |
| 1   | Sidebar nav           | `src/components/shared/Sidebar.tsx:58-85`           | "Profile" in NAV_ITEMS list                 |
| 2   | Sidebar user menu     | `src/components/shared/Sidebar.tsx:113-121`         | "View profile" link in expandable user menu |
| 3   | BottomNav             | `src/components/shared/BottomNav.tsx:14`            | "Profile" tab in mobile bottom bar          |
| 4   | GreetingHeader avatar | `src/components/dashboard/GreetingHeader.tsx:53-69` | Avatar circle links to /profile             |

Additionally, the MobileNav (hamburger sheet) duplicates both the sidebar nav item AND the user menu "View profile" link (`src/components/shared/MobileNav.tsx:83-114` and `143-149`).

**Other redundancy:**

- The `NAV_ITEMS` array in `src/lib/nav-items.ts` has 7 items, but BottomNav in `src/components/shared/BottomNav.tsx:10-16` defines its own separate 5-item array (duplicating the data source).
- "Transactions" appears in the sidebar but NOT in BottomNav — inconsistent.
- "Payments Hub" appears in the sidebar but NOT in BottomNav — inconsistent.

**Recommendation: Single entry point for profile.**

Remove "Profile" from the sidebar nav items and BottomNav tabs. Profile should be accessed exclusively through the user avatar:

- **Desktop**: The user avatar/initials at the bottom of the sidebar (already there as the user menu trigger). Clicking it navigates directly to `/profile` instead of toggling a dropdown. Logout moves into the profile page itself.
- **Mobile**: The avatar in the GreetingHeader (already there). Remove the "Profile" tab from BottomNav entirely. Replace it with "Transactions" (which is currently missing from BottomNav).

This follows Apple's pattern: your face is your profile. One tap, one destination.

**New NAV_ITEMS (6 items, no Profile):**

```
Home, People, Payments Hub, Cards, Loans, Transactions
```

**New BottomNav (5 items, shared source):**

```
Home, People, Cards, Loans, Transactions
```

**Files to change:**

- `src/lib/nav-items.ts` — remove Profile entry
- `src/components/shared/BottomNav.tsx` — import from nav-items.ts instead of duplicating; replace Profile with Transactions
- `src/components/shared/Sidebar.tsx` — remove user menu dropdown; avatar click navigates to /profile; move logout to profile page
- `src/components/shared/MobileNav.tsx` — same as Sidebar changes
- `src/components/dashboard/GreetingHeader.tsx` — keep avatar link (this becomes the primary mobile entry point)
- `src/app/(profile)/profile/page.tsx` — add a "Log out" button at the bottom (it already has one)

---

### 2.2 Sheets/Sliders to Full Pages

**Finding: 7 flows use bottom sheets that should be full pages.**

| Current Sheet                           | File                                | Lines               | Proposed Route                           |
| --------------------------------------- | ----------------------------------- | ------------------- | ---------------------------------------- |
| Transaction detail (ReceiptDetail)      | `(dashboard)/transactions/page.tsx` | 368-372             | `/transactions/[id]`                     |
| Create card (type picker)               | `(cards)/cards/page.tsx`            | 156-212             | `/cards/new`                             |
| Card spending limits                    | `(cards)/cards/[id]/page.tsx`       | Sheet with 3 inputs | Inline expandable section on card detail |
| Add recipient (AddRecipientSheet)       | `(dashboard)/recipients/page.tsx`   | 347-593             | `/recipients/new`                        |
| Add beneficiary (AddBeneficiarySheet)   | `(dashboard)/recipients/page.tsx`   | 206-343             | Merged into `/recipients/new` (see 2.3)  |
| Loan application (LoanApplicationSheet) | `(loans)/loans/page.tsx`            | Custom motion panel | `/loans/apply`                           |
| Loan repayment (RepaymentSheet)         | `(loans)/loans/[id]/page.tsx`       | Custom motion panel | `/loans/[id]/repay`                      |

**Rationale:** Bottom sheets are appropriate for quick confirmations or lightweight selections. Forms with multiple inputs, detail views with scrollable content, and multi-step flows deserve full pages. Full pages provide:

- Proper URL for sharing/bookmarking
- Browser back button works naturally
- More screen real estate for form fields
- Better accessibility (no focus trapping issues)
- Consistent navigation pattern (back arrow)

**The only acceptable Sheet usage** is the mobile navigation menu (`MobileNav.tsx`) which is a standard mobile pattern.

**New pages to create:**

1. `src/app/(dashboard)/transactions/[id]/page.tsx` — full transaction detail
2. `src/app/(cards)/cards/new/page.tsx` — card creation flow
3. `src/app/(dashboard)/recipients/new/page.tsx` — unified recipient + beneficiary creation
4. `src/app/(loans)/loans/apply/page.tsx` — loan application
5. `src/app/(loans)/loans/[id]/repay/page.tsx` — loan repayment

Each new page follows the existing pattern: back arrow + title header, form content, primary action button at the bottom.

---

### 2.3 Unify Recipients and Beneficiaries

**Finding: Two separate tabs, two separate sheets, two separate data models for what is conceptually one entity.**

Current state in `src/app/(dashboard)/recipients/page.tsx`:

- Line 47: `type Tab = "recipients" | "beneficiaries"` — two tabs
- Line 649-672: Tab switcher UI (Recipients | Beneficiaries)
- Line 347-593: `AddRecipientSheet` — adds Neo user or bank account
- Line 206-343: `AddBeneficiarySheet` — adds family member (spouse/child/parent)
- Recipients have an `isBeneficiary` flag and `beneficiaryId` (line 98-99)

**Recommendation: Single unified flow.**

1. **Remove the Beneficiaries tab entirely.** The `/recipients` page shows one flat list of all recipients.
2. **Recipients who are also beneficiaries** show a small shield icon (already done at line 98-99 with `ShieldCheck`). Add a subtle "Beneficiary" label next to it.
3. **New `/recipients/new` page** (replacing both sheets):
   - Step 1: Choose type — "Neo User" or "Bank Account" (existing mode pills)
   - Step 2: Fill in details (phone/username lookup for Neo, bank + account for bank)
   - Step 3: Optional beneficiary section with a toggle: "Mark as beneficiary for international transfers"
     - If toggled on: show relationship picker (spouse/child/parent) and document URL field
   - Step 4: Confirm and save
4. **Delete `AddBeneficiarySheet` and `AddRecipientSheet`** from recipients/page.tsx (they become the new page).
5. **Keep `useBeneficiaries` and `useCreateBeneficiary` hooks** — the API can stay the same; the UI just unifies the entry point.

**Files to change:**

- `src/app/(dashboard)/recipients/page.tsx` — remove tabs, remove both sheet components, single list with beneficiary badges
- Create `src/app/(dashboard)/recipients/new/page.tsx` — unified add flow
- `src/hooks/use-beneficiaries.ts` — keep as-is
- `src/hooks/use-recipients.ts` — keep as-is
- `src/lib/types.ts` — keep both types, they map to different API resources

---

### 2.4 Information Relevance Audit

**Dashboard (`(dashboard)/page.tsx`):**

- Good: Greeting, currency carousel, quick actions, recent transactions, pots, FX ticker, spending insight
- Issue: FX rate ticker may not be relevant to users who only hold ETB. Show it only when the user has multiple currencies.
- Issue: Spending insight section — if the user has no transactions, this renders empty space. Add a meaningful empty state.

**Transaction detail (ReceiptDetail in `transactions/page.tsx:377-467`):**

- Issue: "Transaction ID" (line 438) shows a raw UUID — not useful to most users. Move it behind a "Show details" disclosure or make it copyable with a tap.
- Issue: "Type" row (line 421) shows raw type like "p2p_send" with underscores replaced by spaces. Use the human-readable label from `getReceiptDisplay` instead.
- Issue: "Currency" row (line 427) is redundant — the amount already shows the currency symbol.

**Card detail (`(cards)/cards/[id]/page.tsx`):**

- Good: Card visual, freeze toggle, channel toggles, spending limits
- Issue: Spending limits show raw cent values divided by 100. Should use `formatMoney`.

**Loan detail (`(loans)/loans/[id]/page.tsx`):**

- Good: Progress bar, installment schedule, repay CTA
- Issue: Days past due warning is shown even when the loan is current (0 days). Only show when > 0.

**Profile page (`(profile)/profile/page.tsx`):**

- Issue: Links to Balances, Pots, Cards — these are already accessible from the sidebar/nav. Redundant navigation. Remove these shortcuts; profile should focus on personal info, verification, settings, and support.

**Settings page (`(profile)/profile/settings/page.tsx`):**

- Issue: All three settings (Dark Mode, Notifications, Language) show "Coming soon" badges. If they're not functional, consider removing the page entirely or implementing at least Dark Mode (the theme toggle is trivial with next-themes).

**Security page (`(profile)/profile/security/page.tsx`):**

- Same issue: All three items show "Coming soon". Either implement or remove.

**Recipients page (`(dashboard)/recipients/page.tsx`):**

- Issue: The filter chips (All, Neo Users, Bank Accounts, Favorites) take up vertical space. On mobile, consider collapsing into a single dropdown or making them scroll horizontally (they already do, but the row is always visible even with 0 recipients).

---

### 2.5 Theme & Color System Overhaul

**Current palette analysis:**

The forest green palette (hue ~130) is Wise-inspired but feels utilitarian rather than premium. The bright green accent (`oklch(0.87 0.2 135)`) is high-saturation and can feel jarring, especially in dark mode where it becomes the primary color.

**Issues found:**

1. `src/components/admin/MoneyFlowGlobe.tsx:16-17` — hardcoded `#22c55e` and `#86efac` (Tailwind green-500/300)
2. `src/components/admin/MoneyFlowGlobe.tsx:21-25` — hardcoded `#3b82f6`, `#f59e0b`, `#a3a3a3`
3. `src/components/shared/CurrencyFlag.tsx:6-8` — raw Tailwind colors: `bg-emerald-100`, `bg-blue-100`, `bg-indigo-100`, `dark:bg-emerald-900/30`, etc.
4. `src/app/(dashboard)/transactions/page.tsx:80-81` — `bg-orange-500/10 text-orange-500` (not semantic)
5. `src/app/(dashboard)/transactions/page.tsx:84-85` — `bg-purple-500/10 text-purple-500`
6. `src/app/(dashboard)/transactions/page.tsx:86-87` — `bg-amber-500/10 text-amber-500`
7. `src/app/(dashboard)/transactions/page.tsx:103-104` — `bg-blue-500/10 text-blue-500`
8. `src/app/(dashboard)/transactions/page.tsx:115` — `bg-teal-500/10 text-teal-600 dark:text-teal-400`
9. `src/app/(dashboard)/recipients/page.tsx:64-75` — `bg-pink-500/10`, `bg-blue-500/10`, `bg-amber-500/10`
10. `src/app/layout.tsx:30` — dark theme color `#121511` doesn't match `--background` dark value

**Proposed new palette: "Midnight Indigo"**

A deep indigo primary with a warm coral accent. Inspired by Linear's sophistication and Arc's warmth. Trustworthy (blue family = finance), but the indigo hue avoids generic "bank blue". The coral accent provides energy and delight.

```css
:root {
  --radius: 0.625rem;

  --background: oklch(0.99 0.002 270);
  --foreground: oklch(0.13 0.02 270);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.02 270);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.02 270);

  --primary: oklch(0.35 0.12 270);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.96 0.005 270);
  --secondary-foreground: oklch(0.4 0.02 270);

  --muted: oklch(0.96 0.005 270);
  --muted-foreground: oklch(0.55 0.015 270);

  --accent: oklch(0.72 0.16 25);
  --accent-foreground: oklch(0.25 0.06 25);

  --destructive: oklch(0.55 0.22 25);
  --success: oklch(0.55 0.16 155);
  --success-foreground: oklch(0.99 0 0);
  --warning: oklch(0.8 0.15 80);
  --warning-foreground: oklch(0.2 0.02 80);

  --border: oklch(0.13 0.02 270 / 10%);
  --input: oklch(0.13 0.02 270 / 10%);
  --ring: oklch(0.35 0.12 270);
}

.dark {
  --background: oklch(0.14 0.015 270);
  --foreground: oklch(0.93 0.005 270);
  --card: oklch(0.18 0.018 270);
  --card-foreground: oklch(0.93 0.005 270);
  --popover: oklch(0.18 0.018 270);
  --popover-foreground: oklch(0.93 0.005 270);

  --primary: oklch(0.72 0.14 270);
  --primary-foreground: oklch(0.14 0.015 270);

  --secondary: oklch(0.22 0.018 270);
  --secondary-foreground: oklch(0.82 0.005 270);

  --muted: oklch(0.22 0.018 270);
  --muted-foreground: oklch(0.62 0.01 270);

  --accent: oklch(0.72 0.16 25);
  --accent-foreground: oklch(0.14 0.015 270);

  --destructive: oklch(0.65 0.22 25);
  --success: oklch(0.68 0.18 155);
  --success-foreground: oklch(0.14 0.015 270);
  --warning: oklch(0.8 0.15 80);
  --warning-foreground: oklch(0.14 0.015 270);

  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.72 0.14 270);
}
```

**Palette rationale:**

- **Primary (indigo, hue 270)**: Deep and trustworthy in light mode, luminous in dark mode. Passes WCAG AA on white (4.8:1 contrast ratio).
- **Accent (coral, hue 25)**: Warm, energetic, premium. Used sparingly for CTAs, success celebrations, and highlights. Distinct from destructive (which is a deeper red at the same hue but higher chroma).
- **Success (teal-green, hue 155)**: Clearly "positive" without clashing with the indigo primary.
- **Warning (amber, hue 80)**: Standard warm caution color.
- **Destructive (red, hue 25)**: Higher chroma than accent, unmistakably "danger".

**Additional semantic tokens to add for transaction type colors:**

```css
:root {
  --color-tx-transfer: oklch(0.55 0.16 155);
  --color-tx-card: oklch(0.55 0.14 270);
  --color-tx-loan: oklch(0.7 0.14 80);
  --color-tx-conversion: oklch(0.55 0.14 240);
  --color-tx-pot: oklch(0.55 0.14 180);
  --color-tx-fee: oklch(0.55 0.01 270);
}
```

This eliminates all hardcoded `bg-orange-500`, `bg-purple-500`, `bg-teal-500`, etc. throughout the transaction display code.

---

### 2.6 Typography & Proportional Sizing

**Font size audit — current inconsistencies:**

| Element          | Current                                                                                          | Proposed                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Page title (h1)  | `text-xl font-semibold` (some) / `text-xl font-bold` (others) / `text-2xl font-bold` (dashboard) | `text-xl font-semibold` everywhere                                    |
| Section header   | `text-[11px] font-semibold uppercase tracking-widest`                                            | `text-xs font-semibold uppercase tracking-wider` (use standard scale) |
| Body text        | `text-sm` (most) / `text-base` (some inputs)                                                     | `text-sm` for body, `text-base` for inputs                            |
| Caption/meta     | `text-xs` (most) / `text-[10px]` (BottomNav labels, badges)                                      | `text-xs` everywhere (drop text-[10px])                               |
| Amounts (large)  | `text-3xl font-bold`                                                                             | `text-3xl font-bold font-tabular`                                     |
| Amounts (inline) | `text-sm font-semibold font-tabular`                                                             | Keep                                                                  |

**Element sizing audit — current inconsistencies:**

| Element              | Current                                                          | Proposed                                                |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Primary button (CTA) | `h-14`                                                           | `h-12` (more proportional, less chunky)                 |
| Default button       | `h-10`                                                           | `h-10` (keep)                                           |
| Input field          | `h-12` / `h-13` (login) / `h-14` (recipients)                    | `h-12` everywhere                                       |
| Avatar (small)       | `h-8 w-8`                                                        | `h-8 w-8` (keep)                                        |
| Avatar (medium)      | `h-10 w-10`                                                      | `h-10 w-10` (keep)                                      |
| Avatar (large)       | `h-12 w-12` / `h-16 w-16`                                        | `h-14 w-14` (standardize)                               |
| Icon (nav)           | `h-[18px] w-[18px]` (sidebar) / `h-[22px] w-[22px]` (bottom nav) | `h-5 w-5` (20px, standard)                              |
| Icon (inline)        | `h-4 w-4` / `h-3.5 w-3.5` / `h-5 w-5`                            | `h-4 w-4` for inline, `h-5 w-5` for standalone          |
| Icon (feature)       | `h-6 w-6` / `h-8 w-8`                                            | `h-6 w-6` for quick actions, `h-8 w-8` for empty states |

**Border radius audit — current inconsistencies:**

| Element      | Current          | Proposed                                 |
| ------------ | ---------------- | ---------------------------------------- |
| Cards        | `rounded-2xl`    | `rounded-2xl` (keep — 18px)              |
| Buttons      | `rounded-[10px]` | `rounded-xl` (use standard scale — 12px) |
| Inputs       | `rounded-[10px]` | `rounded-xl` (match buttons)             |
| Badges       | `rounded-3xl`    | `rounded-full` (pill shape)              |
| Avatars      | `rounded-full`   | `rounded-full` (keep)                    |
| Nav items    | `rounded-lg`     | `rounded-xl` (match buttons)             |
| Filter chips | `rounded-full`   | `rounded-full` (keep)                    |

**Proposed unified design tokens:**

```css
/* Typography scale */
--text-display: 1.875rem; /* 30px — hero numbers */
--text-title: 1.25rem; /* 20px — page titles */
--text-heading: 1rem; /* 16px — section headings */
--text-body: 0.875rem; /* 14px — body text */
--text-caption: 0.75rem; /* 12px — captions, metadata */

/* Spacing scale (4px base) */
/* Already using Tailwind's default 4px scale — enforce consistency */

/* Sizing scale */
--size-button-lg: 3rem; /* 48px — h-12 */
--size-button-md: 2.5rem; /* 40px — h-10 */
--size-button-sm: 2.25rem; /* 36px — h-9 */
--size-input: 3rem; /* 48px — h-12 */
--size-avatar-sm: 2rem; /* 32px — h-8 */
--size-avatar-md: 2.5rem; /* 40px — h-10 */
--size-avatar-lg: 3.5rem; /* 56px — h-14 */

/* Shadow scale */
--shadow-sm: 0 1px 2px oklch(0 0 0 / 5%);
--shadow-md: 0 4px 12px oklch(0 0 0 / 8%);
--shadow-lg: 0 8px 24px oklch(0 0 0 / 12%);

/* Animation timing */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

### 2.7 Icons

**Current state:** Lucide React icons throughout. Generally good choices.

**Issues found:**

1. **Inconsistent sizing**: Icons range from `h-3 w-3` to `h-9 w-9` with no clear system. The sidebar uses `h-[18px] w-[18px]` (non-standard), BottomNav uses `h-[22px] w-[22px]` (non-standard).

2. **Semantic mismatches:**
   - `Landmark` for Loans — a landmark/bank icon doesn't clearly communicate "loans". Consider `Banknote` or `HandCoins`.
   - `ArrowLeftRight` for Transactions — this icon suggests "swap/convert" more than "transaction history". Consider `Receipt` or `ClipboardList`.
   - `HandCoins` for Payments Hub — acceptable but `Receipt` might be clearer.
   - `ShieldCheck` for the app logo on auth pages — this is a security icon, not a brand icon. Consider a custom SVG or a more distinctive icon.

3. **Recommendation**: Keep Lucide — it's a solid, consistent icon set. But establish a strict sizing scale:

| Context               | Size | Tailwind  |
| --------------------- | ---- | --------- |
| Inline (next to text) | 16px | `h-4 w-4` |
| Navigation            | 20px | `h-5 w-5` |
| Feature/action        | 24px | `h-6 w-6` |
| Empty state / hero    | 32px | `h-8 w-8` |

---

### 2.8 Moments of Delight

**Current animations:**

- Page transitions: `motion.div` fade + slide on auth pages, recipients, loans
- Sidebar active indicator: `layoutId` spring animation
- Balance display: `motion.span` reveal
- Pot progress: `motion.circle` stroke animation
- Credit score gauge: `motion.circle` with delay
- SlideToConfirm: drag-based spring animation
- List items: staggered `opacity: 0, y: 10` → `opacity: 1, y: 0`

**Missing delight moments — proposed additions:**

#### Button interactions

- **All buttons**: Add `active:scale-[0.97]` and `transition-transform duration-100` for tactile press feedback. The quick actions already have `active:scale-95` — extend this system-wide.
- **Primary CTA buttons**: On hover, add a subtle brightness shift: `hover:brightness-110`.
- **Implementation**: Update `src/components/ui/button.tsx` base class.

#### Successful money operations

- **Send complete** (`send/confirm/page.tsx`): After the slide-to-confirm succeeds, show a full-screen success state with:
  - Animated checkmark (SVG path animation via Framer Motion, ~600ms)
  - Amount pulses once with scale(1.05) → scale(1)
  - Subtle confetti burst (use `canvas-confetti` — lightweight, ~3KB)
  - Haptic feedback: `haptic("success")` on Telegram
- **Card created** (`cards/new/page.tsx`): After creation, show the new card visual sliding in from below with a spring animation, then a brief glow effect (box-shadow pulse).
- **Loan approved** (`loans/apply/page.tsx`): Animated checkmark + amount display with counting animation.
- **Implementation**: Create a reusable `<SuccessAnimation />` component with variants: `checkmark`, `confetti`, `glow`.

#### Loading states

- **Skeleton shimmer**: The current `animate-pulse` is basic. Replace with a gradient shimmer (left-to-right sweep) for a more premium feel:
  ```css
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      var(--muted) 25%,
      var(--muted-foreground) / 8% 50%,
      var(--muted) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  ```
- **Implementation**: Update `src/components/ui/skeleton.tsx`.

#### Page transitions

- **Route transitions**: Wrap the main content area in `<AnimatePresence mode="wait">` with a shared layout animation. Each page fades in with `opacity: 0 → 1` and slides up `y: 8 → 0` over 200ms.
- **Back navigation**: Reverse the animation (slide down instead of up) to create a spatial sense of navigation depth.
- **Implementation**: Create a `<PageTransition>` wrapper component used in each layout.

#### Micro-interactions

- **Toggle switches** (card channel toggles in `cards/[id]/page.tsx`): Add a spring animation to the toggle knob. Use Framer Motion `layout` prop for smooth position transitions.
- **Input focus**: On focus, the border should transition from `border-input` to `border-ring` with a subtle glow: `ring-2 ring-ring/20`. Already partially implemented — ensure consistency.
- **Favorite star** (recipients): On toggle, the star should scale up briefly (`scale(1.3)`) then settle back, with a color transition.
- **Copy to clipboard**: Flash a brief "Copied!" tooltip that fades out after 1.5s.

#### Empty states

- **No transactions**: Show a subtle illustration (or a large, muted icon) with an inviting message and a CTA. Current implementation is just text — add visual weight.
- **No cards**: Already has a decent empty state with icon + CTA. Add a subtle floating animation to the icon.
- **No recipients**: Same treatment — add visual interest.
- **Implementation**: Create a reusable `<EmptyState icon={} title="" description="" action={} />` component.

#### Number animations

- **Balance changes**: When the balance updates (e.g., after a send), animate the number change with a counting effect. Use Framer Motion's `useMotionValue` + `useTransform` + `animate` (already partially used on the dashboard).
- **Amount input** (send/amount, convert): As the user types, the displayed amount should have a subtle scale pulse on each digit change.

#### Pull-to-refresh

- The dashboard already has a pull-to-refresh implementation. Enhance it with a custom indicator (rotating Neo logo instead of a generic spinner).

---

## Phase 3: System-Wide Redesign Specification

---

### 3.1 New Design Tokens

Complete replacement for `src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
}

:root {
  --radius: 0.75rem;

  --background: oklch(0.99 0.002 270);
  --foreground: oklch(0.13 0.02 270);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.02 270);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.02 270);
  --primary: oklch(0.35 0.12 270);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.005 270);
  --secondary-foreground: oklch(0.4 0.02 270);
  --muted: oklch(0.96 0.005 270);
  --muted-foreground: oklch(0.55 0.015 270);
  --accent: oklch(0.72 0.16 25);
  --accent-foreground: oklch(0.25 0.06 25);
  --destructive: oklch(0.55 0.22 25);
  --success: oklch(0.55 0.16 155);
  --success-foreground: oklch(0.99 0 0);
  --warning: oklch(0.8 0.15 80);
  --warning-foreground: oklch(0.2 0.02 80);
  --border: oklch(0.13 0.02 270 / 10%);
  --input: oklch(0.13 0.02 270 / 10%);
  --ring: oklch(0.35 0.12 270);
}

.dark {
  --background: oklch(0.14 0.015 270);
  --foreground: oklch(0.93 0.005 270);
  --card: oklch(0.18 0.018 270);
  --card-foreground: oklch(0.93 0.005 270);
  --popover: oklch(0.18 0.018 270);
  --popover-foreground: oklch(0.93 0.005 270);
  --primary: oklch(0.72 0.14 270);
  --primary-foreground: oklch(0.14 0.015 270);
  --secondary: oklch(0.22 0.018 270);
  --secondary-foreground: oklch(0.82 0.005 270);
  --muted: oklch(0.22 0.018 270);
  --muted-foreground: oklch(0.62 0.01 270);
  --accent: oklch(0.72 0.16 25);
  --accent-foreground: oklch(0.14 0.015 270);
  --destructive: oklch(0.65 0.22 25);
  --success: oklch(0.68 0.18 155);
  --success-foreground: oklch(0.14 0.015 270);
  --warning: oklch(0.8 0.15 80);
  --warning-foreground: oklch(0.14 0.015 270);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.72 0.14 270);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }
}

.font-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

### 3.2 Component Inventory (Changes Required)

| Component                      | Change                                                                                                                                 | Reason                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `ui/button.tsx`                | Add `active:scale-[0.97]` to base class; change `rounded-[10px]` to `rounded-xl`; update CTA height from h-14 to h-12 across all pages | Tactile feedback, consistent rounding, proportional sizing |
| `ui/input.tsx`                 | Change `rounded-[10px]` to `rounded-xl`; standardize height to `h-12`                                                                  | Consistent rounding                                        |
| `ui/skeleton.tsx`              | Replace `animate-pulse` with gradient shimmer animation                                                                                | Premium feel                                               |
| `ui/card.tsx`                  | No change needed                                                                                                                       | Already uses `rounded-2xl`                                 |
| `ui/sheet.tsx`                 | No structural change, but usage will be reduced to mobile nav only                                                                     | Sheets replaced by pages                                   |
| `ui/badge.tsx`                 | Change `rounded-3xl` to `rounded-full`                                                                                                 | Proper pill shape                                          |
| `shared/Sidebar.tsx`           | Remove "Profile" from nav; remove user menu dropdown; avatar click → navigate to /profile; icon size → `h-5 w-5`                       | Navigation simplification                                  |
| `shared/MobileNav.tsx`         | Same changes as Sidebar                                                                                                                | Consistency                                                |
| `shared/BottomNav.tsx`         | Import from `nav-items.ts`; replace Profile with Transactions; icon size → `h-5 w-5`; label size → `text-xs`                           | Navigation simplification, consistent sizing               |
| `shared/CurrencyFlag.tsx`      | Replace hardcoded Tailwind colors with semantic tokens                                                                                 | Design system compliance                                   |
| `dashboard/GreetingHeader.tsx` | Keep avatar link (primary mobile profile entry point)                                                                                  | No change needed                                           |
| `dashboard/QuickActions.tsx`   | Replace `bg-amber-500/10 text-amber-500` with semantic tokens                                                                          | Design system compliance                                   |
| `admin/MoneyFlowGlobe.tsx`     | Create a JS constant map from semantic token hex values; add comment explaining why CSS vars can't be used in THREE.js                 | Design system compliance                                   |

---

### 3.3 Navigation Architecture

**Desktop (Sidebar):**

```
[Neo Logo]

Home
People
Payments Hub
Cards
Loans
Transactions

─────────────
[Avatar] [Name]     → click navigates to /profile
```

**Mobile (BottomNav):**

```
Home | People | Cards | Loans | Transactions
```

**Mobile (MobileNav hamburger — only on dashboard layout):**

```
Same as sidebar, triggered by hamburger icon in sticky header
```

**Profile access:**

- Desktop: Click avatar at bottom of sidebar
- Mobile: Tap avatar in GreetingHeader (dashboard) or navigate via hamburger menu

**Information architecture (pages):**

```
/                           Dashboard
/balances                   All currency balances
/balances/[code]            Single currency detail + transactions
/convert                    Currency conversion
/receive                    QR code + phone display
/send                       Recipient selection
/send/amount                Amount entry
/send/confirm               Review + slide-to-confirm
/recipients                 All recipients (unified, no tabs)
/recipients/new             Add recipient (+ optional beneficiary)
/recipients/[id]            Recipient detail
/requests                   Payment requests (received/sent)
/requests/new               New payment request
/requests/new/split         Split payment request
/requests/[id]              Payment request detail
/transactions               All transactions
/transactions/[id]          Transaction detail (NEW — replaces sheet)
/cards                      All cards
/cards/new                  Create card (NEW — replaces sheet)
/cards/[id]                 Card detail (limits inline)
/loans                      Loan overview + history
/loans/apply                Loan application (NEW — replaces sheet)
/loans/[id]                 Loan detail
/loans/[id]/repay           Loan repayment (NEW — replaces sheet)
/loans/credit-score         Credit score detail
/pots/new                   Create pot
/pots/[id]                  Pot detail
/profile                    Profile + settings hub
/profile/settings           App settings
/profile/security           Security settings
/kyc                        KYC verification flow
```

---

### 3.4 Page-by-Page Redesign Notes

**Auth pages (login, register):**

- Replace `ShieldCheck` icon with a custom Neo logomark (or a more distinctive icon).
- Standardize input heights to `h-12`.
- Button height: `h-12` (not h-14).
- Add subtle background pattern or gradient for visual interest.

**Dashboard:**

- Conditionally show FX ticker only when user has multiple currencies.
- Add empty state for spending insight when no data.
- Enhance pull-to-refresh indicator.

**Balances:**

- No major changes. Ensure CurrencyFlag uses semantic colors.

**Send flow:**

- Keep the multi-step flow (recipient → amount → confirm).
- Enhance the SlideToConfirm with haptic feedback on threshold.
- Add success animation after send completes.

**Recipients:**

- Remove tabs (Recipients | Beneficiaries).
- Single list with beneficiary badge indicators.
- "Add" button navigates to `/recipients/new` (full page).
- Remove both sheet components from this file.

**Transactions:**

- Remove the Sheet for transaction detail.
- Each transaction row is a `<Link>` to `/transactions/[id]`.
- New `/transactions/[id]` page with the ReceiptDetail content.

**Cards:**

- Remove the Sheet for card creation.
- "New Card" button navigates to `/cards/new`.
- Card spending limits: convert from Sheet to inline expandable section on card detail page.

**Loans:**

- Remove the custom motion panel for loan application.
- "Apply" button navigates to `/loans/apply`.
- Remove the RepaymentSheet from loan detail.
- "Repay" button navigates to `/loans/[id]/repay`.

**Profile:**

- Remove shortcuts to Balances, Pots, Cards (redundant with nav).
- Focus on: Personal info, KYC verification, App Settings, Security, Help, Contact, Log out.
- Implement Dark Mode toggle (it's trivial with next-themes).

**Settings / Security:**

- Either implement the features or remove the "Coming soon" items. At minimum, implement Dark Mode toggle.

**Admin pages:**

- Replace hardcoded colors in MoneyFlowGlobe and MoneyFlowMap with constants derived from the new palette.
- No structural changes needed — admin pages are functional.

---

### 3.5 New Pages to Create

1. **`src/app/(dashboard)/transactions/[id]/page.tsx`**
   - Move `ReceiptDetail` component from `transactions/page.tsx` into this new page.
   - Add back arrow + "Transaction Details" header.
   - Full-page layout with the same content as the current sheet.

2. **`src/app/(cards)/cards/new/page.tsx`**
   - Move card type picker from `cards/page.tsx` Sheet into this page.
   - Back arrow + "Create a Card" header.
   - Card type selection (virtual/physical/ephemeral) as full-width cards.
   - "Create" CTA at bottom.

3. **`src/app/(dashboard)/recipients/new/page.tsx`**
   - Merge `AddRecipientSheet` and `AddBeneficiarySheet` logic.
   - Back arrow + "Add Recipient" header.
   - Mode pills (Neo User / Bank Account).
   - Form fields based on mode.
   - Optional "Mark as beneficiary" toggle with relationship + document fields.
   - "Add Recipient" CTA at bottom.

4. **`src/app/(loans)/loans/apply/page.tsx`**
   - Move `LoanApplicationSheet` content into this page.
   - Back arrow + "Apply for a Loan" header.
   - Eligibility display, amount input, terms.
   - "Submit Application" CTA.

5. **`src/app/(loans)/loans/[id]/repay/page.tsx`**
   - Move `RepaymentSheet` content into this page.
   - Back arrow + "Make a Repayment" header.
   - Balance display, amount input, quick-fill buttons.
   - "Repay" CTA.

---

### 3.6 Files to Delete

None need to be deleted outright — the sheet components are embedded within page files, not separate files. However, the following code blocks should be **removed** from their host files:

| File                                | Code to Remove                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `(dashboard)/transactions/page.tsx` | `ReceiptDetail` component (lines 377-494), Sheet import/usage (lines 368-372)                                                                                      |
| `(cards)/cards/page.tsx`            | Sheet import, `sheetOpen` state, entire Sheet block (lines 156-212)                                                                                                |
| `(dashboard)/recipients/page.tsx`   | `AddRecipientSheet` (lines 347-593), `AddBeneficiarySheet` (lines 206-343), tab state + tab UI (lines 47, 596, 649-672), beneficiaries tab content (lines 774-841) |
| `(loans)/loans/page.tsx`            | `LoanApplicationSheet` component and `showApply` state                                                                                                             |
| `(loans)/loans/[id]/page.tsx`       | `RepaymentSheet` component and `showRepay` state                                                                                                                   |

---

### 3.7 Migration Order

**Phase A: Design tokens (foundation)**

1. Update `src/app/globals.css` with new color palette
2. Update `src/app/layout.tsx` theme-color meta to match new dark background
3. Update `src/components/ui/button.tsx` — rounding, active state, sizing
4. Update `src/components/ui/input.tsx` — rounding
5. Update `src/components/ui/skeleton.tsx` — shimmer animation
6. Update `src/components/ui/badge.tsx` — rounding
7. Fix all hardcoded colors: CurrencyFlag, MoneyFlowGlobe, MoneyFlowMap, transaction display colors, recipient relationship colors

**Phase B: Navigation restructure**

1. Update `src/lib/nav-items.ts` — remove Profile
2. Update `src/components/shared/Sidebar.tsx` — remove user menu, avatar → /profile link
3. Update `src/components/shared/MobileNav.tsx` — same
4. Update `src/components/shared/BottomNav.tsx` — import from nav-items, replace Profile with Transactions
5. Standardize icon sizes across all nav components

**Phase C: Sheet-to-page migrations**

1. Create `/transactions/[id]` page, update transaction list to use `<Link>`
2. Create `/cards/new` page, update cards list
3. Create `/recipients/new` page (unified), update recipients list
4. Create `/loans/apply` page, update loans list
5. Create `/loans/[id]/repay` page, update loan detail
6. Remove all sheet code from the original pages

**Phase D: Recipient/beneficiary unification**

1. Update `/recipients` page — remove tabs, single list
2. Ensure `/recipients/new` handles beneficiary toggle
3. Update recipient list to show beneficiary badges

**Phase E: Delight moments**

1. Create `<SuccessAnimation />` component
2. Add success animations to send/confirm, cards/new, loans/apply
3. Update skeleton shimmer
4. Add button press feedback globally
5. Add number counting animations to balance displays
6. Create `<EmptyState />` component, apply to all empty states
7. Add page transition wrapper

**Phase F: Polish pass**

1. Audit all pages for consistent typography scale
2. Audit all pages for consistent spacing
3. Audit all pages for consistent icon sizing
4. Implement Dark Mode toggle in settings
5. Fix viewport theme-color to match new palette
6. Test light + dark mode end-to-end
7. Test mobile + desktop layouts
8. Accessibility pass (contrast ratios, focus states, screen reader labels)

---

## Production readiness audit (post–UI overhaul)

After implementing the UI overhaul (top spacing, Cards header, quick actions, collapsible pots, People redesign, auth/profile/KYC/requests redesign, loans inline repay, merged request/split flow), the following findings and recommendations are prioritised for production. **Narration (payment note) is optional** for both send and request flows.

### P0 — Must fix before production

1. **Optional narration (send and request)**  
   The send amount page and request flows (single and split) treat the note/narration as **optional**. The confirm page and API accept empty narration. Labels use "Note (optional)" or "What's this for? (optional)" where applicable. **Status:** Implemented.

2. **Split request redirect**  
   `/requests/new/split` redirects to `/requests/new?mode=split`. Ensure any external links or deep links to the old split URL still work. **Status:** Implemented; no known external consumers.

3. **Loan repay route**  
   `/loans/[id]/repay` now redirects to `/loans/[id]` (inline repay on detail). Bookmarks or shared links to the repay page will land on the detail page; user must tap "Make payment" to see the inline form. **Status:** Acceptable; document in release notes if needed.

4. **Form labels and required indicators**  
   Auth (login/register), KYC, and request flows use visible labels. Ensure every required field has an explicit label and, where applicable, a "required" indicator or hint so screen readers and users understand constraints. **Status:** Partially done; add `aria-required` and/or "(required)" text where missing.

### P1 — Should fix

1. **Consistency — section headers**  
   All main sections (Cards, Transactions, People, Payments, Loans, Profile) now have an h1 and consistent top spacing. Verify every route group layout passes the same `mainClassName` (e.g. `pt-8 md:pt-10`) so no page has less top padding.

2. **Accessibility — focus and contrast**
   - Interactive elements (buttons, links, inputs) should have a visible focus ring (`focus-visible:ring-2` or similar). Audit primary and outline buttons, and inputs in auth/KYC/requests.
   - Check `text-primary/80` and `text-muted-foreground` against background for WCAG AA (4.5:1 for normal text). Adjust if contrast fails.

3. **Empty and error states**  
   Lists (transactions, requests, recipients, pots, cards, loans) have empty and error states with retry or primary action. Verify each list shows a clear message and at least one action (e.g. "Add person", "Try again").

4. **Loading states**  
   Async content uses skeletons or spinners. Check that there is no major layout shift when data loads (e.g. dashboard, cards layout, loan detail). Use fixed min-heights or skeleton structure that matches final content where possible.

5. **Mobile — touch targets**  
   Buttons and links should have a minimum ~44px touch target. Quick action cards, pot circles, and nav items have been sized; verify small links (e.g. "Hide" for pots, "Go to People") are tappable.

6. **Requests — narration label**  
   Request flows (single and split) use "What's this for?" or "What's it for?"; ensure backend and any emails use the same concept ("note" or "message") so the user’s input is displayed consistently.

### P2 — Nice to have

1. **Pots popover — outside click**  
   When there are many pots, the "+N" popover closes on blur (setTimeout 150ms). Consider closing on outside click or Escape for clearer UX.

2. **Dashboard pull-to-refresh**  
   If the dashboard uses pull-to-refresh, ensure it invalidates balances, pots, and transactions so the updated data is visible without a full reload.

3. **Success feedback**  
   After inline loan repay, the form collapses and loan data refetches. A short toast or inline "Payment received" message is already handled by the repay mutation; confirm it appears and is readable.

4. **KYC progress indicator**  
   KYC step progress uses a bar; ensure step labels (e.g. "Enter Fayda ID", "Enter code") are visible and that the progress percentage matches the current step.

5. **Performance**  
   Avoid unnecessary re-renders on list pages (e.g. recipients, transactions) by ensuring query keys and component boundaries are appropriate. No specific issue identified; general recommendation.

6. **Copy**  
   CTAs use consistent wording ("Add person", "Request money", "Send", "Make payment"). Review any remaining "Back to X" or "Back" in error states and replace with "Go to X" where appropriate.

### Summary

| Priority | Count | Notes                                                                          |
| -------- | ----- | ------------------------------------------------------------------------------ |
| P0       | 4     | Optional narration, redirects, required-field clarity (aria-required on auth). |
| P1       | 6     | Consistency, a11y (focus rings, touch targets), empty/error/loading, copy.     |
| P2       | 6     | Polish: popover (outside click + Escape), copy "Go to" in error states.        |

**Audit recommendations implemented:** Narration is optional for send and request. Auth inputs have `aria-required="true"`. Dashboard pots "Hide" button has min touch target and focus ring; pots "+N" popover closes on outside click and Escape. "Back to dashboard" replaced with "Go to dashboard" in pots and receive error states. Request note labels show "(optional)".
