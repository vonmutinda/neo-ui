# Enviar UI Documentation

> Single source of truth for Enviar UI's architecture, feature inventory, and roadmap.
> Last updated: 2026-03-26

---

## 1. What Is Enviar UI?

Enviar is a **cross-border payments platform** (neobank) — not a bank. Think Wise, Revolut, Monzo, Payset — built for Africa, starting with Ethiopia.

This repo (`enviar-ui`) is a single **Next.js 16** app serving three audiences through route groups:

| App          | Audience                | Port  | Route Group(s)                                                      |
| ------------ | ----------------------- | ----- | ------------------------------------------------------------------- |
| **Business** | Business owners & teams | :3000 | `(business)`                                                        |
| **Personal** | End users               | :3000 | `(auth)`, `(dashboard)`, `(cards)`, `(loans)`, `(profile)`, `(kyc)` |
| **Admin**    | Operations staff        | :3001 | `admin/`, `admin/(authenticated)`                                   |

**Account model:** A user registers → instantly gets a personal account → can optionally create one or more business accounts later.

**Backend:** Go monorepo at `/Users/vonmutinda/code/enviar` — see `docs/DOCS_PROMPT.md` there for full API documentation.

**Priority order:** Business → Personal → Admin.

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
| Validation     | Zod v4                                                                   |

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

| Client              | File                          | Prefix      | Auth                                  |
| ------------------- | ----------------------------- | ----------- | ------------------------------------- |
| Personal / Business | `src/lib/api-client.ts`       | `/v1`       | Bearer token from `useAuthStore`      |
| Admin               | `src/lib/admin-api-client.ts` | `/admin/v1` | Bearer token from `useAdminAuthStore` |

- **Response envelope:** `{ "data": ..., "error": "" }` — clients unwrap automatically
- **Idempotency:** All POST/PUT/PATCH/DELETE include `Idempotency-Key` header
- **Token refresh:** 401 responses auto-trigger refresh via `/v1/auth/refresh`
- **Rate limiting:** 429 responses retry after `Retry-After` header
- **Timeout:** 15 seconds

### 2.5 File Organization

```
src/
├── app/
│   ├── (auth)/              # Login, register, forgot/reset password
│   ├── (dashboard)/         # Personal app pages
│   ├── (business)/business/ # Business app pages
│   ├── (cards)/             # Card pages
│   ├── (loans)/             # Loan pages
│   ├── (profile)/           # Profile & settings
│   ├── (kyc)/               # KYC flow
│   └── admin/               # Admin app (separate port :3001)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── shared/              # Cross-app components
│   ├── dashboard/           # Personal dashboard components
│   ├── business/            # Business app components
│   ├── admin/               # Admin app components
│   └── cards/               # Card components
├── hooks/
│   ├── use-*.ts             # Personal hooks
│   ├── business/            # Business hooks (use-*.ts)
│   └── admin/               # Admin hooks (use-admin-*.ts)
├── lib/
│   ├── types.ts             # Personal types
│   ├── business-types.ts    # Business types
│   ├── admin-types.ts       # Admin types
│   ├── api-client.ts        # Personal/business API client
│   ├── admin-api-client.ts  # Admin API client
│   ├── schemas.ts           # Zod validation schemas
│   ├── nav-items.ts         # Personal nav
│   └── business-nav-items.ts# Business nav
└── providers/               # Auth stores, query provider
```

---

## 3. Apps & Routing

### 3.1 Business App (Priority)

**Shell:** `BusinessAppShell` + `BusinessContextLoader` (manages active business selection)

| Route                      | Purpose                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `/business`                | Dashboard (hero balance, quick actions, currency cards, recent transfers, pending approvals) |
| `/business/create`         | Create new business account                                                                  |
| `/business/wallets`        | Wallets & balances (hero balance, currency grid, transaction table)                          |
| `/business/transfers`      | Transfers list (segmented by status, filterable, approve/reject)                             |
| `/business/transfers/new`  | Initiate transfer (4-step: Type → Recipient → Amount → Review)                               |
| `/business/transfers/[id]` | Transfer detail (timeline, status, actions)                                                  |
| `/business/team`           | Team members & roles (permissions matrix, invite, create role)                               |
| `/business/invoices`       | Invoices list (metrics, status tabs, table)                                                  |
| `/business/invoices/new`   | Create invoice (form + live preview)                                                         |
| `/business/invoices/[id]`  | Invoice detail (send, record payment, cancel)                                                |
| `/business/payments`       | Batch payments list (status tabs, table)                                                     |
| `/business/payments/new`   | Create batch payment (multi-recipient form)                                                  |
| `/business/payments/[id]`  | Batch detail (progress, metrics, items)                                                      |
| `/business/cards`          | Business cards grid (issue, freeze/unfreeze)                                                 |
| `/business/settings`       | Settings (profile, KYB, approval policies)                                                   |
| `/business/imports`        | Trade finance imports list                                                                   |
| `/business/imports/new`    | Create import request                                                                        |
| `/business/imports/[id]`   | Import detail (timeline, documents, FX conversion)                                           |
| `/business/loans`          | Business loans (eligibility, active loan, repayment)                                         |
| `/business/tax`            | Tax categories & pots (category management, auto-sweep)                                      |
| `/business/documents`      | Document management (upload, expiry tracking)                                                |
| `/business/accounting`     | Statements & reports (generate, download)                                                    |

**RBAC:** 25+ granular permissions (`biz:transfers:initiate:external`, `biz:invoices:manage`, etc.) control what each member can see/do. System roles: Owner, Admin, Finance Manager, Accountant, Viewer. Custom roles supported. Permissions loaded via `useMyPermissions`. Shared helper: `useBusinessPermissionCheck`.

### 3.2 Personal App

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

### 3.3 Admin App

**Shell:** `AdminSidebar` + `AdminHeader` + `AdminAuthGuard`
**Runs on:** `:3001` via `ADMIN_DEV=1` env var

| Route                                                 | Purpose                           |
| ----------------------------------------------------- | --------------------------------- |
| `/admin/login`                                        | Admin login                       |
| `/admin`                                              | Dashboard (stats, flags, recon)   |
| `/admin/customers`, `/admin/customers/[id]`           | Customer management               |
| `/admin/businesses`, `/admin/businesses/[id]`         | Business management               |
| `/admin/transactions`, `/admin/transactions/[id]`     | Transaction inspection            |
| `/admin/loans`, `/admin/loans/[id]`                   | Loan administration               |
| `/admin/cards`, `/admin/cards/[id]`                   | Card management                   |
| `/admin/cards/simulator`                              | Card payment simulator (dev only) |
| `/admin/kyb`, `/admin/kyb/[id]`                       | KYB review                        |
| `/admin/compliance`                                   | Compliance dashboard              |
| `/admin/rules`                                        | System rules/limits               |
| `/admin/currencies`                                   | Currency configuration            |
| `/admin/reconciliation`                               | Bank reconciliation               |
| `/admin/imports`, `/admin/imports/[id]`               | Trade finance imports review      |
| `/admin/batch-payments`, `/admin/batch-payments/[id]` | Batch payment monitoring          |
| `/admin/billers`                                      | Biller configuration              |
| `/admin/fees`                                         | Fee schedules                     |
| `/admin/capital`                                      | System / capital accounts         |
| `/admin/staff`                                        | Staff management                  |
| `/admin/audit`                                        | Audit logs                        |
| `/admin/map`                                          | Money flow visualization          |
| `/admin/settings`                                     | Admin settings                    |
| `/admin/flags`                                        | Compliance flags                  |

---

## 4. Design System

### 4.1 Source of Truth

**Visual mockups:** `docs/mockups/00-design-system.html` — all design/aesthetic changes must be reflected here first, then implemented in code.

**Business app screen mockups:** `docs/mockups/01-*.html` through `15-*.html` (dashboard, transfers, invoices, members, trade finance, cards, batch payments, wallets, loans, settings, documents, statements, tax categories).

### 4.2 Design Philosophy

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

### 4.4 Typography

| Scale    | Size      | Usage            |
| -------- | --------- | ---------------- |
| Display  | 48px mono | Large amounts    |
| Heading  | 28px      | Section headings |
| Title    | 20px      | Card titles      |
| Body     | 15px      | Body text        |
| Caption  | 13px      | Labels, metadata |
| Overline | 12px      | Category labels  |

**Rule:** Numbers always in monospace (Geist Mono).

### 4.5 Component Conventions

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

### 5.1 Business App (23+ hooks)

| #   | Feature                               | Hook(s)                                                                                                   | Status  |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Business dashboard                    | `use-business-wallets`, `use-business-transfers`                                                          | Done    |
| 2   | Create business                       | `use-business`                                                                                            | Done    |
| 3   | Wallets & balances                    | `use-business-wallets`, `use-business-transactions`, `use-business-wallet-manage`                         | Done    |
| 4   | Transfers (list, initiate, detail)    | `use-business-transfers`, `use-business-transfer-detail`, `use-initiate-transfer`, `use-execute-transfer` | Done    |
| 5   | Transfer approval workflow            | `use-business-transfers` (approve/reject)                                                                 | Done    |
| 6   | Team members & roles                  | `use-business-members`, `use-manage-members`, `use-business-roles`                                        | Done    |
| 7   | Invoices (list, create, detail)       | `use-invoices`, `use-invoice-detail`, `use-create-invoice`                                                | Done    |
| 8   | Batch payments (list, create, detail) | `use-batch-payments`                                                                                      | Done    |
| 9   | Business cards                        | `use-business-cards`                                                                                      | Done    |
| 10  | Settings (profile, KYB, policies)     | `use-business-settings`                                                                                   | Done    |
| 11  | Trade finance — Imports               | `use-imports`                                                                                             | Done    |
| 12  | Trade finance — Exports               | —                                                                                                         | Planned |
| 13  | Recurring invoices                    | —                                                                                                         | Planned |
| 14  | Business loans                        | `use-business-loans`                                                                                      | Done    |
| 15  | Business KYB                          | `use-business-kyb`                                                                                        | Done    |
| 16  | Currency conversion                   | `use-business-convert`                                                                                    | Done    |
| 17  | Tax categories & pots                 | `use-categories`                                                                                          | Done    |
| 18  | Documents                             | `use-documents`                                                                                           | Done    |
| 19  | Accounting reports                    | `use-accounting`, `use-statements`                                                                        | Done    |
| 20  | Business registration flow            | —                                                                                                         | Planned |
| 21  | Dual-auth settings                    | —                                                                                                         | Planned |
| 22  | Card authorizations view              | —                                                                                                         | Planned |
| 23  | Transaction export                    | —                                                                                                         | Planned |

### 5.2 Personal App (30+ hooks)

| #   | Feature                                        | Hook(s)                                                   | Status  |
| --- | ---------------------------------------------- | --------------------------------------------------------- | ------- |
| 1   | Auth (login/register/forgot/reset)             | `use-auth`                                                | Done    |
| 2   | KYC verification (Fayda ID + OTP)              | `use-kyc`                                                 | Done    |
| 3   | Dashboard (currencies, pots, transactions, FX) | `use-wallets`, `use-fx-rates`                             | Done    |
| 4   | Multi-currency balances                        | `use-balances`                                            | Done    |
| 5   | Send money (recipient → amount → confirm)      | `use-transfers`, `use-resolve-recipient`, `use-fee-quote` | Done    |
| 6   | Currency conversion                            | `use-convert`                                             | Done    |
| 7   | Recipients (list/add/detail)                   | `use-recipients`, `use-beneficiaries`                     | Done    |
| 8   | Payment requests (send/receive/split)          | `use-payment-requests`                                    | Done    |
| 9   | Transaction history                            | `use-wallets`                                             | Done    |
| 10  | Cards (list/create/detail)                     | `use-cards`                                               | Done    |
| 11  | Savings pots                                   | `use-pots`, `use-pot-transactions`                        | Done    |
| 12  | Loans (list/apply/repay/credit-score)          | `use-loans`                                               | Done    |
| 13  | Bill payments                                  | `use-bill-payments`                                       | Done    |
| 14  | Scheduled/recurring transfers                  | `use-scheduled-transfers`                                 | Done    |
| 15  | Spending analytics                             | `use-analytics`, `use-spend-waterfall`                    | Done    |
| 16  | Statements (PDF)                               | `use-statements`                                          | Done    |
| 17  | Confirmation letters                           | `use-confirmations`                                       | Done    |
| 18  | Receipts                                       | `use-receipts`                                            | Done    |
| 19  | Transaction labels                             | `use-transaction-labels`                                  | Done    |
| 20  | Profile & settings                             | `use-user`                                                | Done    |
| 21  | Security (password, MFA)                       | `use-challenges`, `use-devices`                           | Done    |
| 22  | Notification preferences                       | `use-notifications`                                       | Done    |
| 23  | Analytics pages (spending/summary/trends)      | —                                                         | Planned |
| 24  | Public FX rates display                        | —                                                         | Planned |
| 25  | Server-side logout                             | —                                                         | Planned |

### 5.3 Admin App (20+ hooks, 23+ routes)

| #   | Feature                              | Hook(s)                     | Status  |
| --- | ------------------------------------ | --------------------------- | ------- |
| 1   | Admin auth                           | `use-admin-auth`            | Done    |
| 2   | Dashboard (stats, KYC, flags, recon) | `use-admin-analytics`       | Done    |
| 3   | Customer management                  | `use-admin-customers`       | Done    |
| 4   | Transaction management               | `use-admin-transactions`    | Done    |
| 5   | Loan management                      | `use-admin-loans`           | Done    |
| 6   | Card management                      | `use-admin-cards`           | Done    |
| 7   | Card simulator                       | `use-admin-card-simulator`  | Done    |
| 8   | Business management                  | `use-admin-businesses`      | Done    |
| 9   | KYB review                           | `use-admin-kyb`             | Done    |
| 10  | Compliance                           | —                           | Done    |
| 11  | System rules                         | `use-admin-rules`           | Done    |
| 12  | Currency config                      | `use-admin-currencies`      | Done    |
| 13  | Reconciliation                       | `use-admin-recon`           | Done    |
| 14  | Staff management                     | `use-admin-staff`           | Done    |
| 15  | Audit logs                           | `use-admin-audit`           | Done    |
| 16  | Money flow map                       | `use-admin-money-flow-map`  | Done    |
| 17  | Flags                                | `use-admin-flags`           | Done    |
| 18  | Settings                             | `use-admin-config`          | Done    |
| 19  | FX rates                             | `use-admin-fx-rates`        | Done    |
| 20  | Fee management                       | `use-admin-fees`            | Done    |
| 21  | Trade finance imports                | `use-admin-imports`         | Done    |
| 22  | Batch payment monitoring             | `use-admin-batch-payments`  | Done    |
| 23  | Biller management                    | `use-admin-billers`         | Done    |
| 24  | Capital / system accounts            | `use-admin-system-accounts` | Done    |
| 25  | Business cards viewing               | `use-admin-businesses`      | Done    |
| 26  | Business transfers                   | `use-admin-businesses`      | Done    |
| 27  | Invoice viewing                      | `use-admin-businesses`      | Done    |
| 28  | Trade finance exports                | —                           | Planned |
| 29  | Business deposit                     | —                           | Planned |
| 30  | FX rate management UI                | —                           | Planned |
| 31  | Bill payment list view               | —                           | Planned |

---

## 6. Domain Constants

| Constant                  | Value                                                                                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supported currencies      | ETB, USD, EUR, GBP, AED, SAR, CNY, KES                                                                                                                                                              |
| RecipientType             | `"enviar_user"` \| `"bank_account"`                                                                                                                                                                 |
| Institution code (Enviar) | `"ENVIAR"`                                                                                                                                                                                          |
| Bank institutions         | CBE, DASHEN, AWASH, ABYSSINIA                                                                                                                                                                       |
| KYC levels                | 1 (Basic), 2 (Verified), 3 (Enhanced)                                                                                                                                                               |
| KYB levels                | 0–3 (progressive verification)                                                                                                                                                                      |
| Card types                | physical, virtual, ephemeral                                                                                                                                                                        |
| Card statuses             | active, frozen, cancelled, expired, pending_activation                                                                                                                                              |
| Loan statuses             | active, in_arrears, defaulted, repaid, written_off                                                                                                                                                  |
| Business statuses         | pending_verification, active, suspended, deactivated                                                                                                                                                |
| Invoice statuses          | draft, sent, viewed, partially_paid, paid, overdue, cancelled                                                                                                                                       |
| Transfer statuses         | pending, approved, rejected, expired, executed, failed                                                                                                                                              |
| Industry categories       | retail, wholesale, manufacturing, agriculture, technology, healthcare, education, construction, transport, hospitality, financial_services, import_export, professional_services, non_profit, other |

---

## 7. Component Library

### 7.1 App Shells

| Component                      | Location                                       | App      |
| ------------------------------ | ---------------------------------------------- | -------- |
| `BusinessAppShell`             | `src/components/business/BusinessAppShell.tsx` | Business |
| `PersonalAppShell`             | `src/components/shared/PersonalAppShell.tsx`   | Personal |
| `AdminSidebar` + `AdminHeader` | `src/components/admin/`                        | Admin    |

### 7.2 Shared Components (`src/components/shared/`)

`PageHeader`, `BalanceDisplay`, `CurrencyFlag`, `UserAvatar`, `EnviarLogo`, `EmptyState`, `AnimatedNumber`, `SuccessAnimation`, `PageTransition`, `BankLogos`, `Sidebar`, `BottomNav`, `MobileNav`, `AuthGuard`, `ErrorBoundary`, `OfflineBanner`

### 7.3 Dashboard Components (`src/components/dashboard/`)

`GreetingHeader`, `CurrencyCarousel`, `CurrencyCard`, `QuickActions`, `PotsCarousel`, `PotCard`, `PotCircle`, `PotProgressRing`, `RecentTransactions`, `FXRateTicker`, `DashboardSkeleton`, `SpendingInsight`

### 7.4 shadcn/ui (`src/components/ui/`)

`badge`, `button`, `card`, `input`, `skeleton`, `separator`, `sheet`, `sonner`, `alert-dialog`, `form-field`

---

## 8. Backend API Sync Status

This section tracks gaps between the frontend and the backend API. See GitHub issues for detailed tasks.

### 8.1 Business — Missing Endpoints (backend exists, frontend doesn't use)

| Endpoint                                                 | Purpose                                      | Issue |
| -------------------------------------------------------- | -------------------------------------------- | ----- |
| `POST /v1/business/register`                             | Business registration                        | #7    |
| `PUT /v1/business/{id}/settings/dual-auth`               | Dual-auth threshold                          | #3    |
| `GET /v1/business/{id}/kyb`                              | KYB status (GET)                             | #3    |
| `GET /v1/business/{id}/wallets/transactions/{txId}`      | Transaction detail                           | #2    |
| `GET /v1/business/{id}/wallets/transactions/export`      | Export transactions                          | #2    |
| `GET /v1/business/{id}/transactions/labeled`             | Labeled transactions                         | #2    |
| `GET /v1/business/{id}/transactions/tax-summary`         | Tax summary                                  | #2    |
| `GET /v1/business/{id}/tax-pots/summary`                 | Tax pot summary                              | #2    |
| `POST /v1/business/{id}/documents/upload-url`            | Presigned upload URL                         | #5    |
| `GET /v1/business/{id}/cards/{cardId}/authorizations`    | Card auth history                            | #4    |
| `POST /v1/business/{id}/batch-payments/{batchId}/reject` | Reject batch                                 | #4    |
| `/v1/business/{id}/exports/*`                            | Trade finance exports (full feature)         | #8    |
| `/v1/business/{id}/recurring-invoices/*`                 | Recurring invoices (full feature)            | #9    |
| `/v1/business/{id}/export/*`                             | Accounting reports (P&L, balance sheet, tax) | #12   |

### 8.2 Personal — Missing Endpoints

| Endpoint                     | Purpose                   | Issue |
| ---------------------------- | ------------------------- | ----- |
| `POST /v1/auth/logout`       | Server-side logout        | #6    |
| `GET /v1/analytics/spending` | Spending analytics        | #10   |
| `GET /v1/analytics/summary`  | Summary analytics         | #10   |
| `GET /v1/analytics/trends`   | Spending trends           | #10   |
| `GET /v1/fx/rates`           | Public FX rates (no auth) | #11   |

### 8.3 Admin — Missing Endpoints

| Endpoint                                 | Purpose                                         | Issue |
| ---------------------------------------- | ----------------------------------------------- | ----- |
| `POST /admin/v1/businesses/{id}/deposit` | Business deposit                                | #13   |
| `/admin/v1/fx/rates/*`                   | FX rate management (history, override, refresh) | #14   |
| `/admin/v1/fees/*`                       | Fee schedule CRUD                               | #15   |
| `/admin/v1/currencies/*`                 | Currency management                             | #16   |
| `/admin/v1/system/accounts/*`            | System accounts + top-up                        | #17   |
| `/admin/v1/billers/*`                    | Biller CRUD                                     | #18   |
| `/admin/v1/exports/*`                    | Exports review                                  | #19   |
| `GET /admin/v1/bill-payments`            | Bill payments list                              | #20   |

### 8.4 Type Drift

TypeScript types in `types.ts`, `admin-types.ts`, and `business-types.ts` need auditing against current backend structs. See issue #1.

---

## 9. Conventions

### Page Pattern

Every page follows: `PageHeader` → content with `Skeleton` loading states → `motion` animations → toast feedback via `sonner`.

### Hook Pattern

Hooks use `api` or `adminApi` client, return TanStack Query results, show toasts on error/success.

### Route Group Conflict Prevention

Next.js route groups like `(business)` and `(dashboard)` are URL-invisible. Both cannot have a root `page.tsx` or they resolve to the same `/` path. Business pages live under an actual path segment: `src/app/(business)/business/page.tsx` → `/business`.

### Testing

- Framework: vitest with jsdom
- Helpers: `mockFetchSuccess(data)`, `expectApiCall(fetch, method, path)`, `expectApiCallBody(fetch, body)`
- Test setup: `src/hooks/__tests__/setup.ts` and `src/hooks/admin/__tests__/setup.ts`

### Validation

- Zod v4 schemas in `src/lib/schemas.ts` (auth, business, trade finance, invoices, batch payments)
- `useFormErrors` hook for lightweight on-demand validation
- `FormField` component for label + inline error display

---

## 10. Dev Testing Setup

### Test Account: vonmutinda

**Enable loans:**

```sql
UPDATE credit_profiles SET trust_score = 750 WHERE user_id = '<user-id>';
```

**Enable FX (multi-currency):**

```sql
UPDATE users SET kyc_level = 2 WHERE id = '<user-id>';
```

**Card creation:** Still stubbed — no backend endpoint fully wired yet.

**Fund business wallet (workaround):** Admin deposits to owner's personal wallet via `POST /admin/v1/customers/{ownerId}/deposit`, then owner transfers to business. Backend endpoint `POST /admin/v1/businesses/{id}/deposit` now exists (see #13).
