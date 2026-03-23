# Enviar UI — Design & Architecture Document

> Single source of truth for Enviar UI's architecture, feature inventory, design system, and roadmap.
> **Keep this file up to date** when UI architecture, routes, components, or design system changes.
> Last updated: 2026-03-23

---

## 1. What Is Enviar UI?

Enviar is a **cross-border payments platform** (neobank) — not a bank. Think Wise, Revolut, Monzo, Payset — but built for Africa, starting with Ethiopia.

This repo (`enviar-ui`) is a single **Next.js 16** app serving three audiences through route groups:

| App          | Audience                | Port  | Route Group(s)                                                      |
| ------------ | ----------------------- | ----- | ------------------------------------------------------------------- |
| **Personal** | End users               | :3000 | `(auth)`, `(dashboard)`, `(cards)`, `(loans)`, `(profile)`, `(kyc)` |
| **Business** | Business owners & teams | :3000 | `(business)`                                                        |
| **Admin**    | Operations staff        | :3001 | `admin/`, `admin/(authenticated)`                                   |

**Account model:** A user registers → instantly gets a personal account → can optionally create one or more business accounts later.

**Backend:** Go monorepo at `/Users/vonmutinda/code/enviar` — see `docs/DOCS_PROMPT.md` there for full API documentation.

---

## 2. Architecture

### 2.1 Tech Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Framework      | Next.js 16 (app router)                                                  |
| Language       | TypeScript                                                               |
| Styling        | Tailwind CSS v4                                                          |
| Components     | shadcn/ui (`src/components/ui/`)                                         |
| State (client) | Zustand (auth-store, send-store, display-currency-store, business-store) |
| State (server) | TanStack Query                                                           |
| Animations     | Framer Motion                                                            |
| Toasts         | Sonner                                                                   |
| Theme          | next-themes (light/dark)                                                 |
| Icons          | Lucide React                                                             |
| Fonts          | DM Sans (primary), Geist Mono (monospace)                                |

### 2.2 Provider Stack

```
ThemeProvider (next-themes)
  → QueryProvider (TanStack Query)
    → AuthProvider (custom context)
      → Toaster (sonner, top-center)
```

### 2.3 State Management

| Store            | Location                            | Storage                          | Keys                                                                                 |
| ---------------- | ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| Auth (personal)  | `src/providers/auth-store.ts`       | sessionStorage                   | `enviar_auth_token`, `enviar_refresh_token`, `enviar_user_id`, `enviar_user_profile` |
| Auth (admin)     | `src/providers/admin-auth-store.ts` | sessionStorage (zustand persist) | `enviar-admin-auth`                                                                  |
| Business context | `src/providers/business-store.ts`   | sessionStorage                   | `enviar_active_business_id`                                                          |
| Send flow        | `src/lib/send-store.ts`             | in-memory                        | —                                                                                    |
| Display currency | `src/lib/display-currency-store.ts` | localStorage                     | —                                                                                    |

### 2.4 API Integration

- **Personal API client:** `src/lib/api-client.ts` — base URL from `NEXT_PUBLIC_API_URL`
- **Admin API client:** `src/lib/admin-api-client.ts` — auto-prepends `/admin/v1`
- **Response envelope:** `{ "data": ..., "error": "" }` — clients unwrap automatically
- **Idempotency:** All POST/PUT/PATCH/DELETE include `Idempotency-Key` header

---

## 3. Apps & Routing

### 3.1 Personal App

**Shell:** `PersonalAppShell` (sidebar on desktop, bottom nav on mobile)
**Auth guard:** redirects unauthenticated users to `/login`

| Route Group   | Routes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(auth)`      | `/login`, `/register`, `/forgot-password`, `/reset-password`                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `(dashboard)` | `/` (home), `/balances`, `/balances/[code]`, `/convert`, `/receive`, `/send`, `/send/amount`, `/send/confirm`, `/recipients`, `/recipients/[id]`, `/recipients/new`, `/requests`, `/requests/[id]`, `/requests/new`, `/requests/new/split`, `/transactions`, `/transactions/[id]`, `/pots/new`, `/pots/[id]`, `/bill-payments`, `/bill-payments/[id]`, `/analytics`, `/confirmations`, `/statements`, `/transfers/scheduled`, `/transfers/scheduled/[id]`, `/transfers/scheduled/new`, `/payments`, `/payments/[category]` |
| `(cards)`     | `/cards`, `/cards/new`, `/cards/[id]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `(loans)`     | `/loans`, `/loans/apply`, `/loans/[id]`, `/loans/[id]/repay`, `/loans/credit-score`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `(profile)`   | `/profile`, `/profile/settings`, `/profile/security`, `/profile/security/mfa`, `/profile/notifications`                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `(kyc)`       | `/kyc`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.2 Business App

**Shell:** `BusinessAppShell` + `BusinessContextLoader` (manages active business selection)

| Route                      | Purpose                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/business`                | Business dashboard (hero balance, quick actions, currency cards, recent transfers, pending approvals) |
| `/business/create`         | Create new business account                                                                           |
| `/business/wallets`        | Wallets & balances (hero balance, currency grid, transaction table, monthly summary)                  |
| `/business/transfers`      | Transfers list (segmented by status, filterable, approve/reject actions)                              |
| `/business/transfers/new`  | Initiate transfer (4-step flow: Type → Recipient → Amount → Review)                                   |
| `/business/transfers/[id]` | Transfer detail (timeline, status, actions)                                                           |
| `/business/team`           | Team members & roles (member list, permissions matrix, invite, create role)                           |
| `/business/invoices`       | Invoices list (metrics, status tabs, table)                                                           |
| `/business/invoices/new`   | Create invoice (form + live preview)                                                                  |
| `/business/invoices/[id]`  | Invoice detail (actions: send, record payment, cancel)                                                |
| `/business/payments`       | Batch payments list (status tabs, table)                                                              |
| `/business/payments/new`   | Create batch payment (multi-recipient form)                                                           |
| `/business/payments/[id]`  | Batch detail (progress, metrics, items table)                                                         |
| `/business/cards`          | Business cards grid (issue, freeze/unfreeze)                                                          |
| `/business/settings`       | Settings (profile, KYB verification, approval policies)                                               |
| `/business/imports`        | Trade finance imports list                                                                            |
| `/business/imports/new`    | Create import request                                                                                 |
| `/business/imports/[id]`   | Import detail (timeline, documents, FX conversion)                                                    |
| `/business/exports`        | Trade finance exports list                                                                            |
| `/business/exports/new`    | Create export request                                                                                 |
| `/business/exports/[id]`   | Export detail                                                                                         |
| `/business/loans`          | Business loans (eligibility, active loan, repayment schedule)                                         |
| `/business/tax`            | Tax categories & pots (category management, tax pot auto-sweep)                                       |
| `/business/documents`      | Document management (upload, expiry tracking, verification)                                           |
| `/business/accounting`     | Statements & reports (generate, download, report types)                                               |
| `/business/[...slug]`      | Catch-all for remaining unimplemented routes                                                          |

**RBAC:** 25+ granular permissions (`biz:transfers:initiate:external`, `biz:invoices:manage`, etc.) control what each member can see/do. System roles: Owner, Admin, Finance Manager, Accountant, Viewer. Custom roles supported.

### 3.3 Admin App

**Shell:** `AdminSidebar` + `AdminHeader` + `AdminAuthGuard`
**Runs on:** `:3001` via `ADMIN_DEV=1` env var

| Route                                             | Purpose                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `/admin/login`                                    | Admin login                                                      |
| `/admin`                                          | Dashboard (stats, KYC breakdown, recent flags, recon exceptions) |
| `/admin/customers`, `/admin/customers/[id]`       | Customer management                                              |
| `/admin/businesses`, `/admin/businesses/[id]`     | Business management                                              |
| `/admin/transactions`, `/admin/transactions/[id]` | Transaction inspection                                           |
| `/admin/loans`, `/admin/loans/[id]`               | Loan administration                                              |
| `/admin/cards`, `/admin/cards/[id]`               | Card management                                                  |
| `/admin/cards/simulator`                          | Card payment simulator (dev/staging)                             |
| `/admin/kyb`, `/admin/kyb/[id]`                   | KYB application review                                           |
| `/admin/compliance`                               | Compliance dashboard                                             |
| `/admin/rules`                                    | System rules/limits                                              |
| `/admin/currencies`                               | Currency configuration                                           |
| `/admin/reconciliation`                           | Bank reconciliation                                              |
| `/admin/staff`                                    | Staff management                                                 |
| `/admin/audit`                                    | Audit logs                                                       |
| `/admin/map`                                      | Money flow visualization                                         |
| `/admin/settings`                                 | Admin settings                                                   |
| `/admin/flags`                                    | Compliance flags                                                 |

---

## 4. Design System

### 4.1 Source of Truth

**Visual mockups:** `docs/mockups/00-design-system.html` — all design/aesthetic changes must be reflected here first, then implemented in code.

**Screen mockups (business app):**

| File                            | Screen                  |
| ------------------------------- | ----------------------- |
| `01-dashboard.html`             | Business dashboard      |
| `02-transfers-list.html`        | Transfers list          |
| `03-transfer-initiate.html`     | Transfer initiation     |
| `04-invoices.html`              | Invoices                |
| `05-invoice-create.html`        | Invoice creation        |
| `06-members-roles.html`         | Members & roles         |
| `07-trade-finance-imports.html` | Trade finance imports   |
| `08-cards.html`                 | Business cards          |
| `09-batch-payments.html`        | Batch payments          |
| `10-wallets.html`               | Wallets & balances      |
| `11-loans.html`                 | Business loans          |
| `12-settings.html`              | Business settings       |
| `13-documents.html`             | Document management     |
| `14-statements-accounting.html` | Statements & accounting |
| `15-tax-categories.html`        | Tax categories          |

### 4.2 Design Philosophy

**Three principles:**

1. **Subtract** — Remove anything unnecessary; borders become shadows, labels become context
2. **Breathe** — Generous whitespace = confidence in control
3. **Honest** — Green = money in, Red = money out, Orange = action needed. No excess color.

**Inspiration:** Apple-grade simplicity with Dieter Rams restraint. The interface disappears — the money speaks.

### 4.3 Color Palette

Almost monochrome with rationed functional color:

| Token     | Value     | Usage                 |
| --------- | --------- | --------------------- |
| Ink       | `#1D1D1F` | Primary text          |
| Secondary | `#86868B` | Secondary text        |
| Canvas    | `#F5F5F7` | Page background       |
| Surface   | `#FFFFFF` | Card/panel background |
| Blue      | `#0071E3` | Action, links, focus  |
| Green     | `#34C759` | Money in, success     |
| Red       | `#FF3B30` | Money out, error      |
| Orange    | `#FF9500` | Attention, pending    |

Subtle colored backgrounds at ~6-8% opacity for contextual tinting.

### 4.4 Typography

| Scale    | Size      | Usage            |
| -------- | --------- | ---------------- |
| Display  | 48px mono | Large amounts    |
| Heading  | 28px      | Section headings |
| Title    | 20px      | Card titles      |
| Body     | 15px      | Body text        |
| Caption  | 13px      | Labels, metadata |
| Overline | 12px      | Category labels  |

**Rule:** Numbers are always rendered in monospace (JetBrains Mono / Geist Mono).

### 4.5 Spacing & Sizing

| Token          | Value                          |
| -------------- | ------------------------------ |
| Radius xs      | 8px                            |
| Radius sm      | 12px                           |
| Radius md      | 16px                           |
| Radius lg      | 20px                           |
| Radius full    | 28px (pills)                   |
| Sidebar width  | 240px                          |
| Button padding | 12px vertical, 28px horizontal |

**Shadows:** Subtle hierarchy (xs → xl), no heavy borders.

### 4.6 Component Conventions

| Component    | Style                                              |
| ------------ | -------------------------------------------------- |
| Buttons      | Filled, Dark, Outline, Ghost, Danger — pill-shaped |
| Pills/Badges | Status indicators (green/red/orange/blue/neutral)  |
| Cards        | White surfaces with subtle shadows, hover lift     |
| Tables       | Border-free, striped rows, monospace amounts       |
| Inputs       | Generous padding, 1.5px borders, blue focus        |
| Empty states | Icon + heading + description + CTA                 |
| Loading      | Skeleton placeholders matching content shape       |

---

## 5. Feature Inventory

### 5.1 Personal App (30+ hooks, 28+ routes)

| Feature                                                  | Hook(s)                                                   | Status |
| -------------------------------------------------------- | --------------------------------------------------------- | ------ |
| Auth (login/register/forgot/reset)                       | `use-auth`                                                | Done   |
| KYC verification (Fayda ID + OTP)                        | `use-kyc`                                                 | Done   |
| Dashboard (greeting, currencies, pots, transactions, FX) | `use-wallets`, `use-fx-rates`                             | Done   |
| Multi-currency balances                                  | `use-balances`                                            | Done   |
| Send money (recipient → amount → confirm)                | `use-transfers`, `use-resolve-recipient`, `use-fee-quote` | Done   |
| Receive money                                            | —                                                         | Done   |
| Currency conversion                                      | `use-convert`                                             | Done   |
| Recipients (list/add/detail)                             | `use-recipients`, `use-beneficiaries`                     | Done   |
| Payment requests (send/receive/split)                    | `use-payment-requests`                                    | Done   |
| Transaction history (filter/search)                      | `use-wallets`                                             | Done   |
| Cards (list/create/detail)                               | `use-cards`                                               | Done   |
| Savings pots                                             | `use-pots`, `use-pot-transactions`                        | Done   |
| Loans (list/apply/repay/credit-score)                    | `use-loans`                                               | Done   |
| Bill payments                                            | `use-bill-payments`                                       | Done   |
| Scheduled/recurring transfers                            | `use-scheduled-transfers`                                 | Done   |
| Spending analytics                                       | `use-analytics`, `use-spend-waterfall`                    | Done   |
| Statements (PDF)                                         | `use-statements`                                          | Done   |
| Confirmation letters                                     | `use-confirmations`                                       | Done   |
| Receipts                                                 | `use-receipts`                                            | Done   |
| Transaction labels                                       | `use-transaction-labels`                                  | Done   |
| Profile & settings                                       | `use-user`                                                | Done   |
| Security (password, MFA)                                 | `use-challenges`, `use-devices`                           | Done   |
| Notification preferences                                 | `use-notifications`                                       | Done   |

### 5.2 Business App (23 hooks)

| Feature                               | Hook(s)                                                                                                   | Status |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| Business dashboard                    | `use-business-wallets`, `use-business-transfers`                                                          | Done   |
| Create business                       | `use-business`                                                                                            | Done   |
| Wallets & balances                    | `use-business-wallets`, `use-business-transactions`, `use-business-wallet-manage`                         | Done   |
| Transfers (list, initiate, detail)    | `use-business-transfers`, `use-business-transfer-detail`, `use-initiate-transfer`, `use-execute-transfer` | Done   |
| Transfer approval workflow            | `use-business-transfers` (approve/reject)                                                                 | Done   |
| Team members & roles                  | `use-business-members`, `use-manage-members`, `use-business-roles`                                        | Done   |
| Invoices (list, create, detail)       | `use-invoices`, `use-invoice-detail`, `use-create-invoice`                                                | Done   |
| Batch payments (list, create, detail) | `use-batch-payments`                                                                                      | Done   |
| Business cards (physical + virtual)   | `use-business-cards`                                                                                      | Done   |
| Settings (profile, KYB, policies)     | `use-business-settings`                                                                                   | Done   |
| Trade finance — Imports               | `use-imports`                                                                                             | Done   |
| Trade finance — Exports               | `use-exports`                                                                                             | Done   |
| Business loans                        | `use-business-loans`                                                                                      | Done   |
| Tax categories & pots                 | `use-categories`                                                                                          | Done   |
| Documents                             | `use-documents`                                                                                           | Done   |
| Statements & accounting               | `use-statements`                                                                                          | Done   |

### 5.3 Admin App (20 hooks, 23+ routes)

| Feature                              | Hook(s)                    | Status |
| ------------------------------------ | -------------------------- | ------ |
| Admin auth                           | `use-admin-auth`           | Done   |
| Dashboard (stats, KYC, flags, recon) | `use-admin-analytics`      | Done   |
| Customer management                  | `use-admin-customers`      | Done   |
| Transaction management               | `use-admin-transactions`   | Done   |
| Loan management                      | `use-admin-loans`          | Done   |
| Card management                      | `use-admin-cards`          | Done   |
| Card simulator                       | `use-admin-card-simulator` | Done   |
| Business management                  | `use-admin-businesses`     | Done   |
| KYB review                           | `use-admin-kyb`            | Done   |
| Compliance                           | —                          | Done   |
| System rules                         | `use-admin-rules`          | Done   |
| Currency config                      | `use-admin-currencies`     | Done   |
| Reconciliation                       | `use-admin-recon`          | Done   |
| Staff management                     | `use-admin-staff`          | Done   |
| Audit logs                           | `use-admin-audit`          | Done   |
| Money flow map                       | `use-admin-money-flow-map` | Done   |
| Flags                                | `use-admin-flags`          | Done   |
| Settings                             | `use-admin-config`         | Done   |
| FX rates                             | `use-admin-fx-rates`       | Done   |
| Fee management                       | `use-admin-fees`           | Done   |

---

## 6. Component Library

### 6.1 App Shells

| Component                      | Location                                       | App                                  |
| ------------------------------ | ---------------------------------------------- | ------------------------------------ |
| `PersonalAppShell`             | `src/components/shared/PersonalAppShell.tsx`   | Personal, Cards, Loans, Profile, KYC |
| `BusinessAppShell`             | `src/components/business/BusinessAppShell.tsx` | Business                             |
| `AdminSidebar` + `AdminHeader` | `src/components/admin/`                        | Admin                                |

### 6.2 Shared Components (`src/components/shared/`)

| Component          | Purpose                               |
| ------------------ | ------------------------------------- |
| `PageHeader`       | Standard page header with back button |
| `BalanceDisplay`   | Formatted currency balance            |
| `CurrencyFlag`     | Currency flag icon                    |
| `UserAvatar`       | User avatar with initials fallback    |
| `EnviarLogo`       | Brand logo                            |
| `EmptyState`       | Empty state with icon + message + CTA |
| `AnimatedNumber`   | Animated number counter               |
| `SuccessAnimation` | Success celebration animation         |
| `PageTransition`   | Page transition wrapper               |
| `BankLogos`        | Bank institution logos                |
| `Sidebar`          | Desktop navigation sidebar            |
| `BottomNav`        | Mobile bottom navigation              |
| `MobileNav`        | Mobile navigation drawer              |
| `AuthGuard`        | Route protection for personal app     |
| `ErrorBoundary`    | Error handling boundary               |
| `OfflineBanner`    | Offline status indicator              |

### 6.3 Dashboard Components (`src/components/dashboard/`)

`GreetingHeader`, `CurrencyCarousel`, `CurrencyCard`, `QuickActions`, `PotsCarousel`, `PotCard`, `PotCircle`, `PotProgressRing`, `RecentTransactions`, `FXRateTicker`, `DashboardSkeleton`, `SpendingInsight`

### 6.4 shadcn/ui Components (`src/components/ui/`)

`badge`, `button`, `card`, `input`, `skeleton`, `separator`, `sheet`, `sonner`, `alert-dialog`

---

## 7. Currencies & Domain Constants

| Constant                  | Value                                                  |
| ------------------------- | ------------------------------------------------------ |
| Supported currencies      | ETB, USD, EUR, GBP, AED, SAR, CNY, KES                 |
| RecipientType             | `"enviar_user"` \| `"bank_account"`                    |
| Institution code (Enviar) | `"ENVIAR"`                                             |
| Bank institutions         | CBE, DASHEN, AWASH, ABYSSINIA                          |
| KYC levels                | 1 (Basic), 2 (Verified), 3 (Enhanced)                  |
| KYB levels                | 0–3 (progressive verification)                         |
| Card types                | physical, virtual, ephemeral                           |
| Card statuses             | active, frozen, cancelled, expired, pending_activation |
| Loan statuses             | active, in_arrears, defaulted, repaid, written_off     |

---

## 8. Roadmap & Phases

### Phase 1: Routing & App Separation (Current)

- Fix personal/business routing so they work as distinct apps
- Ensure auth flow routes correctly based on account type
- Business app catch-all routing for nested pages

### Phase 2: HeroUI Migration

- Replace shadcn/ui components with HeroUI equivalents
- Adopt HeroUI design aesthetics across all three apps
- Update `docs/mockups/00-design-system.html` to reflect HeroUI tokens

### Phase 3: Design System Alignment

- Implement the full design system from `00-design-system.html`
- Consistent typography, spacing, color across personal + business + admin
- Premium feel: shadows, transitions, micro-interactions

### Phase 4: KYC/KYB Hardening

- Production-ready KYC flow with Fayda integration
- KYB multi-level verification with document upload
- Compliance-grade screening before account activation

### Phase 5: Business App Buildout

- Implement all planned business features (invoices, batch payments, trade finance, etc.)
- RBAC-driven UI (show/hide based on 25+ permissions)
- Approval workflows for transfers and batch payments

### Phase 6: Admin — Trade Finance

- Admin import request management (list, review, approve/reject, advance status)
- Admin export request management (same lifecycle)
- Admin KYB application review (already partially built)

### Phase 7: Form Validation & API Error Handling

- Display backend validation errors inline on form fields (map API error responses to field-level messages)
- Client-side validation with consistent patterns (required fields, format checks, min/max)
- Standardized error toast with detail extraction from API envelope (`{ error: "..." }`)
- Form-level error banners for non-field-specific errors

### Phase 8: Polish & Production

- Accessibility audit (WCAG 2.1 AA)
- Performance optimization (bundle splitting, lazy loading)
- E2E test coverage
- Mobile-first responsive refinement

---

## 9. Conventions

### File Organization

- Pages: `src/app/(group)/route/page.tsx` — always `"use client"`
- Hooks: `src/hooks/use-*.ts` (personal), `src/hooks/admin/use-admin-*.ts`, `src/hooks/business/use-business-*.ts`
- Types: `src/lib/types.ts` (personal), `src/lib/admin-types.ts`, `src/lib/business-types.ts`
- Components: `src/components/shared/`, `src/components/dashboard/`, `src/components/business/`, `src/components/admin/`, `src/components/cards/`, `src/components/ui/`
- Nav items: `src/lib/nav-items.ts` (personal), `src/lib/business-nav-items.ts`

### Page Pattern

Every page follows: `PageHeader` → content with `Skeleton` loading states → `motion` animations → toast feedback via `sonner`.

### Hook Pattern

Hooks use `api` or `adminApi` client, return TanStack Query results, show toasts on error/success.

### Testing

- Framework: vitest with jsdom
- Helpers: `mockFetchSuccess(data)`, `expectApiCall(fetch, method, path)`, `expectApiCallBody(fetch, body)`
- Known pre-existing failures: split-request.test, recipient-detail.test, loan-detail.test (TS type errors)
