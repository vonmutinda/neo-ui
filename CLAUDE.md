# Enviar UI (enviar-ui)

## What is Enviar

- Multi-currency payments platform (think Wise, Revolut, Monzo, Payset)
- 3 apps in one repo: **Personal**, **Business**, **Admin**
- A user registers and instantly gets a personal account; they can optionally create a business account later
- KYC (personal) and KYB (business) screening processes are planned but not yet enforced

## Quick Start

- `npm run dev` — dev server on :3000
- `npm run dev:admin` — admin dev server on :3001
- `npm run type-check` — TypeScript check (`tsc --noEmit`)
- `npm run test` — vitest run
- `npm run test:watch` — vitest in watch mode
- `npm run lint` — eslint
- `npm run build` — production build

## Environment

- Node managed via nvm: `~/.nvm/versions/node/v24.4.0/bin`
- PATH must include nvm node dir for launch.json — use `/bin/bash -c "export PATH=...&&npm run dev"` pattern
- API URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)
- Backend repo: `/Users/vonmutinda/code/enviar` (Go)
- `patch-package` runs on `npm install` (postinstall) — check `patches/` dir for active patches
- Admin dev uses `ADMIN_DEV=1` env var (set automatically by `npm run dev:admin`)
- Pre-commit: husky + lint-staged runs eslint --fix and prettier on staged `.ts`/`.tsx`/`.json`/`.md` files

## Architecture

- Next.js 16 app router with route groups: `(auth)`, `(dashboard)`, `(cards)`, `(loans)`, `(profile)`, `(kyc)`, `(business)`, `admin`
- State: Zustand stores (auth-store, send-store, display-currency-store, business-store) + TanStack Query for server state
- Auth: sessionStorage with `enviar_*` keys, admin uses zustand persist `enviar-admin-auth`
- Styling: Tailwind CSS v4, shadcn/ui components in `src/components/ui/`
- Animations: framer-motion

## Apps & Routing

- **Personal** — route groups `(dashboard)`, `(cards)`, `(loans)`, `(profile)`, `(kyc)`, `(auth)` — wrapped by `PersonalAppShell` (sidebar desktop + bottom nav mobile)
- **Business** — route group `(business)` — wrapped by `BusinessAppShell` + `BusinessContextLoader` (manages active business selection)
- **Admin** — `admin/` with `(authenticated)` sub-group — uses `AdminSidebar` + `AdminAuthGuard`, runs on :3001
- Auth stores are separate: personal uses `auth-store` (sessionStorage `enviar_*` keys), admin uses `admin-auth-store` (zustand persist `enviar-admin-auth`), business uses `business-store` (`enviar_active_business_id`)
- **Route group conflict prevention.** Next.js route groups like `(business)` and `(dashboard)` are URL-invisible. Both cannot have a root `page.tsx` or they resolve to the same `/` path. Business pages live under an actual path segment: `src/app/(business)/business/page.tsx` → `/business`. All business sub-pages go under `src/app/(business)/business/` (e.g. `business/transfers/page.tsx`).

## Design System

- **Comprehensive doc:** `docs/DESIGN.md` — full architecture, feature inventory, design system, and roadmap. Keep it up to date when UI architecture, routes, components, or design system changes.
- **Visual source of truth:** `docs/mockups/00-design-system.html` — all design/aesthetic changes must be reflected here first, then implemented in code
- Business app screen mockups: `docs/mockups/01-*.html` through `15-*.html`
- Design philosophy: Apple-grade simplicity, monochrome palette with functional color only (blue=action, green=inflow, red=outflow, orange=attention)
- Future migration planned to HeroUI components and design aesthetics

## Code Patterns

- Personal hooks: `src/hooks/use-*.ts` — use `api` from `@/lib/api-client`, TanStack Query, toast from sonner
- Admin hooks: `src/hooks/admin/use-admin-*.ts` — use `adminApi` from `@/lib/admin-api-client` (auto-prepends `/admin/v1`)
- Business hooks: `src/hooks/business/use-business-*.ts` — types in `src/lib/business-types.ts`, nav in `src/lib/business-nav-items.ts`
- Pages: "use client", PageHeader component, Skeleton loading states, motion animations
- Types: `src/lib/types.ts` (personal), `src/lib/admin-types.ts` (admin), `src/lib/business-types.ts` (business)
- 8 currencies: ETB, USD, EUR, GBP, AED, SAR, CNY, KES
- RecipientType: `"enviar_user" | "bank_account"`
- Institution code for Enviar users: `"ENVIAR"`

## Testing

- vitest with jsdom
- Test helpers in `src/hooks/__tests__/setup.ts` and `src/hooks/admin/__tests__/setup.ts`
- Pattern: `mockFetchSuccess(data)`, `expectApiCall(fetch, method, path)`, `expectApiCallBody(fetch, body)`
- Known pre-existing failures: split-request.test, recipient-detail.test, loan-detail.test (TS type errors)

## API Response Envelope

- Backend returns `{ "data": ..., "error": "" }` — api client unwraps automatically
- All POST/PUT/PATCH/DELETE should include `Idempotency-Key` header
