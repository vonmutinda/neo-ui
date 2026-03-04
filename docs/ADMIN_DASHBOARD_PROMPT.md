# Neo Admin Dashboard — Full UI Scaffold

> Complete specification for the bank operations admin dashboard. Lives in the
> `neo-ui` repository under `src/app/(admin)/` as a separate Next.js route group
> sharing the existing build pipeline, design system, and shadcn/ui components.

---

## Role

Act as a Principal Frontend Engineer building an internal bank operations dashboard
for Neo neobank. The dashboard gives bank staff full visibility and control over
customers, transactions, loans, cards, reconciliation, compliance, and platform
analytics. The backend API is fully implemented under `/admin/v1/`.

---

## Architecture

### Route Group

The admin UI lives under `src/app/(admin)/` — a Next.js App Router route group with
its own layout, navigation, and auth guard. It is completely isolated from the
customer-facing routes (`(dashboard)`, `(cards)`, `(loans)`, etc.).

### Auth Isolation

- **Separate auth store**: `src/providers/admin-auth-store.ts` (Zustand, sessionStorage)
- **Separate API client**: `src/lib/admin-api-client.ts` (prefixes all paths with `/admin/v1`)
- **Separate JWT**: Admin tokens use issuer `neobank-admin`, audience `neobank-admin-api`
- **Zero shared state**: The admin and customer auth stores are independent. A user can
  be logged into both simultaneously without interference.

### Stack (shared with customer app)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (new-york style) |
| State | TanStack Query 5, Zustand 5 |
| Icons | lucide-react |
| Font | Inter |
| Theme | CSS variables from `globals.css` |

### Design Principles

- **Data-dense**: Admin UIs prioritize information density over whitespace. Tables,
  not cards. Compact rows. Visible metadata.
- **Desktop-first**: The admin dashboard targets 1280px+ screens. Responsive down
  to 1024px (tablet). No mobile layout needed.
- **Sidebar navigation**: Persistent left sidebar with collapsible sections.
- **Consistent patterns**: Every list page has search, filters, pagination, and
  column sorting. Every detail page has tabs for related data.
- **Confirmation for destructive actions**: Freeze, write-off, cancel, and bulk
  operations require explicit confirmation dialogs.

---

## File Structure

```
src/
├── app/(admin)/
│   ├── layout.tsx                    -- Admin shell (sidebar + header + content)
│   ├── admin/
│   │   ├── page.tsx                  -- Dashboard overview
│   │   ├── login/
│   │   │   └── page.tsx              -- Staff login
│   │   ├── customers/
│   │   │   ├── page.tsx              -- Customer list
│   │   │   └── [id]/
│   │   │       └── page.tsx          -- Customer detail
│   │   ├── transactions/
│   │   │   ├── page.tsx              -- Transaction list
│   │   │   └── [id]/
│   │   │       └── page.tsx          -- Transaction detail
│   │   ├── loans/
│   │   │   ├── page.tsx              -- Loan book
│   │   │   └── [id]/
│   │   │       └── page.tsx          -- Loan detail
│   │   ├── cards/
│   │   │   ├── page.tsx              -- Card list
│   │   │   └── [id]/
│   │   │       └── page.tsx          -- Card detail
│   │   ├── reconciliation/
│   │   │   └── page.tsx              -- Recon dashboard
│   │   ├── audit/
│   │   │   └── page.tsx              -- Audit log explorer
│   │   ├── flags/
│   │   │   └── page.tsx              -- Flags dashboard
│   │   ├── staff/
│   │   │   └── page.tsx              -- Staff management
│   │   └── settings/
│   │       └── page.tsx              -- Config, FX rates, fees
│   └── ...
├── components/admin/
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   ├── AdminAuthGuard.tsx
│   ├── DataTable.tsx
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   ├── SearchInput.tsx
│   ├── PaginationControls.tsx
│   ├── FilterBar.tsx
│   ├── AuditTimeline.tsx
│   └── ConfirmDialog.tsx
├── hooks/admin/
│   ├── use-admin-auth.ts
│   ├── use-admin-customers.ts
│   ├── use-admin-transactions.ts
│   ├── use-admin-loans.ts
│   ├── use-admin-cards.ts
│   ├── use-admin-recon.ts
│   ├── use-admin-audit.ts
│   ├── use-admin-analytics.ts
│   ├── use-admin-flags.ts
│   ├── use-admin-staff.ts
│   ├── use-admin-config.ts
│   ├── use-admin-fx-rates.ts
│   ├── use-admin-fees.ts
│   └── __tests__/
│       ├── use-admin-auth.test.ts
│       ├── use-admin-customers.test.ts
│       ├── use-admin-transactions.test.ts
│       ├── use-admin-loans.test.ts
│       ├── use-admin-cards.test.ts
│       ├── use-admin-recon.test.ts
│       ├── use-admin-audit.test.ts
│       ├── use-admin-analytics.test.ts
│       ├── use-admin-flags.test.ts
│       ├── use-admin-staff.test.ts
│       └── use-admin-config.test.ts
├── lib/
│   ├── admin-api-client.ts
│   └── admin-types.ts
└── providers/
    └── admin-auth-store.ts
```

---

## Backend API Contract

All admin endpoints live under `/admin/v1/`. The login endpoint is unauthenticated;
all others require a valid admin JWT in the `Authorization: Bearer <token>` header.

### Auth

```
POST /admin/v1/auth/login              -- { email, password } -> { token, staff }
POST /admin/v1/auth/change-password    -- { currentPassword, newPassword }
GET  /admin/v1/staff/me                -- Current staff profile
```

### Staff Management (requires staff:manage)

```
GET    /admin/v1/staff                 -- List staff (paginated)
POST   /admin/v1/staff                 -- Create staff member
GET    /admin/v1/staff/{id}            -- Staff detail
PATCH  /admin/v1/staff/{id}            -- Update role/department
DELETE /admin/v1/staff/{id}            -- Deactivate
```

### Customers

```
GET    /admin/v1/customers                    -- List/search (paginated, filterable)
GET    /admin/v1/customers/{id}               -- Rich profile (balances, cards, loans, flags, audit)
POST   /admin/v1/customers/{id}/freeze        -- Freeze account
POST   /admin/v1/customers/{id}/unfreeze      -- Unfreeze account
POST   /admin/v1/customers/{id}/kyc-override  -- Override KYC level
POST   /admin/v1/customers/{id}/note          -- Add internal note
GET    /admin/v1/customers/{id}/flags         -- Customer flags
```

### Transactions

```
GET    /admin/v1/transactions                 -- List/search (paginated, filterable)
GET    /admin/v1/transactions/{id}            -- Transaction detail
POST   /admin/v1/transactions/{id}/reverse    -- Reverse transaction
```

### Loans

```
GET    /admin/v1/loans                        -- List/search (paginated, filterable)
GET    /admin/v1/loans/summary                -- Loan book aggregates
GET    /admin/v1/loans/{id}                   -- Loan detail with installments
POST   /admin/v1/loans/{id}/write-off         -- Write off defaulted loan
GET    /admin/v1/credit-profiles              -- List credit profiles
GET    /admin/v1/credit-profiles/{userId}     -- Credit profile detail
POST   /admin/v1/credit-profiles/{userId}/override -- Override credit limit
```

### Cards

```
GET    /admin/v1/cards                        -- List/search (paginated, filterable)
GET    /admin/v1/cards/{id}                   -- Card detail
GET    /admin/v1/cards/{id}/authorizations    -- Auth history (paginated)
POST   /admin/v1/cards/{id}/freeze            -- Freeze card
POST   /admin/v1/cards/{id}/unfreeze          -- Unfreeze card
POST   /admin/v1/cards/{id}/cancel            -- Cancel card
PATCH  /admin/v1/cards/{id}/limits            -- Update limits
```

### Reconciliation

```
GET    /admin/v1/reconciliation/runs          -- List recon runs
GET    /admin/v1/reconciliation/exceptions    -- List exceptions (filterable)
POST   /admin/v1/reconciliation/exceptions/{id}/assign      -- Assign to analyst
POST   /admin/v1/reconciliation/exceptions/{id}/investigate -- Mark investigating
POST   /admin/v1/reconciliation/exceptions/{id}/resolve     -- Resolve
POST   /admin/v1/reconciliation/exceptions/{id}/escalate    -- Escalate
```

### Audit

```
GET    /admin/v1/audit                        -- Search audit log (filterable)
GET    /admin/v1/audit/{id}                   -- Audit entry detail
```

### Analytics

```
GET    /admin/v1/analytics/overview           -- Platform KPI dashboard
```

### Flags

```
GET    /admin/v1/flags                        -- List open flags
POST   /admin/v1/flags                        -- Create flag
POST   /admin/v1/flags/{id}/resolve           -- Resolve flag
```

### Regulatory Rules

```
GET    /admin/v1/rules                        -- List rules
GET    /admin/v1/rules/{id}                   -- Rule detail
POST   /admin/v1/rules                        -- Create rule
PATCH  /admin/v1/rules/{id}                   -- Update rule
GET    /admin/v1/compliance/report            -- Compliance report
```

### System Config

```
GET    /admin/v1/config                       -- List all config entries
PATCH  /admin/v1/config                       -- Update config entries
```

### FX Rates

```
GET    /admin/v1/fx/rates                     -- Current rates
GET    /admin/v1/fx/rates/history             -- Rate history
POST   /admin/v1/fx/rates                     -- Manual override
POST   /admin/v1/fx/rates/refresh             -- Trigger refresh
```

### Fees

```
GET    /admin/v1/fees                         -- List fee schedules
POST   /admin/v1/fees                         -- Create schedule
PUT    /admin/v1/fees/{id}                    -- Update schedule
DELETE /admin/v1/fees/{id}                    -- Deactivate schedule
GET    /admin/v1/fees/providers               -- List providers
PUT    /admin/v1/fees/providers/{id}          -- Update provider
```

### System

```
GET    /admin/v1/system/accounts              -- Formance system account balances
```

---

## Pagination Contract

All list endpoints return:

```json
{
  "data": [...],
  "pagination": {
    "total": 15420,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

Query params: `?limit=20&offset=0&sort=created_at&order=desc`

Default limit: 20. Maximum: 100.

---

## Staff Roles and Permissions

| Role | Department | Permissions |
|---|---|---|
| `super_admin` | Executive | All permissions |
| `customer_support` | Operations | `users:read`, `transactions:read`, `cards:read`, `loans:read`, `audit:read` |
| `customer_support_lead` | Operations | Above + `users:freeze`, `transactions:reverse` |
| `compliance_officer` | Compliance | `users:read`, `users:freeze`, `transactions:read`, `transactions:export`, `loans:read`, `cards:read`, `recon:read`, `audit:read`, `analytics:read`, `flags:manage` |
| `lending_officer` | Credit | `users:read`, `loans:read`, `loans:write_off`, `loans:credit_override`, `audit:read` |
| `reconciliation_analyst` | Finance | `transactions:read`, `recon:read`, `recon:manage`, `audit:read` |
| `card_operations` | Cards | `users:read`, `cards:read`, `cards:manage`, `audit:read` |
| `treasury` | Finance | `transactions:read`, `analytics:read`, `system:accounts`, `audit:read`, `recon:read` |
| `auditor` | Compliance | Read-only access to everything |

The sidebar navigation should hide menu items the current staff member cannot access.

---

## Pages

### Login (`/admin/login`)

- Centered card layout on `bg-background`
- Email + password fields
- "Sign in" primary button
- Error toast on invalid credentials
- On success: store admin JWT in `admin-auth-store`, redirect to `/admin`
- No link to customer registration

### Dashboard Overview (`/admin`)

- **Top row**: 4 StatsCards — Total Customers, Active Today, Open Flags, Pending Recon Exceptions
- **Second row**: 4 StatsCards — Active Loans, Outstanding (ETB), Active Cards, Transactions Today
- **Charts section**: Registration trend (line chart), Transaction volume (bar chart),
  Loan book breakdown (donut chart)
- **Recent activity**: Last 10 audit entries in a compact timeline
- Data from `GET /analytics/overview`

### Customer List (`/admin/customers`)

- SearchInput (debounced, searches phone/name/Fayda ID)
- FilterBar: KYC Level (1/2/3), Frozen (yes/no), Date range
- DataTable columns: Name, Phone (masked in list), KYC Level (badge), Status (active/frozen badge), Created At
- Click row -> navigate to `/admin/customers/{id}`
- Data from `GET /customers?search=...&kyc_level=...&is_frozen=...`

### Customer Detail (`/admin/customers/[id]`)

- Header: Full name, phone, KYC badge, frozen status badge, account age
- Action buttons: Freeze/Unfreeze, KYC Override, Add Note
- Tabs:
  - **Overview**: Currency balances (table), credit profile summary, pots list
  - **Transactions**: Paginated transaction table (reuses TransactionFilter)
  - **Cards**: Card list with status badges
  - **Loans**: Loan list with status badges
  - **Flags**: Customer flags with resolve action
  - **Audit**: Audit timeline for this customer
- Data from `GET /customers/{id}` (enriched profile)

### Transaction List (`/admin/transactions`)

- SearchInput (counterparty, narration, reference)
- FilterBar: Type (dropdown), Status (dropdown), Currency, Amount range, Date range
- DataTable columns: ID (truncated), User, Type (badge), Amount, Currency, Status (badge), Counterparty, Created At
- Click row -> navigate to `/admin/transactions/{id}`

### Transaction Detail (`/admin/transactions/[id]`)

- Full transaction data: amount, currency, type, status, counterparty, narration, fee
- User link (click to navigate to customer detail)
- Audit trail for this transaction
- Reverse button (with ConfirmDialog) — visible only if `transactions:reverse` permission

### Loan Book (`/admin/loans`)

- Summary cards at top: Total Issued, Outstanding, Repaid, Portfolio at Risk %, Repayment Rate %
- FilterBar: Status (active/in_arrears/defaulted/repaid/written_off), Date range
- DataTable columns: Loan ID, User, Principal, Outstanding, Status (badge), Due Date, Days Past Due
- Click row -> navigate to `/admin/loans/{id}`
- Data from `GET /loans` + `GET /loans/summary`

### Loan Detail (`/admin/loans/[id]`)

- Loan summary: principal, interest, total due, total paid, remaining, status
- Installment table: number, amount due, amount paid, due date, paid date, status
- Write-off button (with ConfirmDialog) — visible only for defaulted loans with `loans:write_off` permission
- Credit profile section for the borrower
- Audit trail

### Card List (`/admin/cards`)

- FilterBar: Type (physical/virtual/ephemeral), Status, Date range
- DataTable columns: Card ID, User, Last Four, Type (badge), Status (badge), Daily Limit, Created At
- Click row -> navigate to `/admin/cards/{id}`

### Card Detail (`/admin/cards/[id]`)

- Card info: last four, type, status, limits, toggles
- Action buttons: Freeze/Unfreeze, Cancel, Update Limits
- Tabs:
  - **Authorizations**: Paginated auth history table (merchant, amount, status, MCC, timestamp)
  - **Audit**: Card audit trail

### Reconciliation (`/admin/reconciliation`)

- Summary cards: Last Run Date, Last Run Status, Open Exceptions, Investigating, Escalated
- Two sections:
  - **Runs**: Table of recon runs (date, file, total records, matched, exceptions, status)
  - **Exceptions**: Filterable table (type, status, amount mismatch, assigned to)
- Exception actions: Assign, Investigate, Resolve, Escalate (each opens a dialog)

### Audit Log (`/admin/audit`)

- SearchInput (free-text across metadata)
- FilterBar: Action (dropdown of all audit actions), Actor Type (user/admin/system/cron), Resource Type, Date range
- DataTable columns: Timestamp, Action (badge), Actor, Resource, IP Address
- Click row -> expand to show full metadata JSON
- Data from `GET /audit?action=...&actor_type=...`

### Flags (`/admin/flags`)

- FilterBar: Severity (info/warning/critical), Type, Resolved (yes/no)
- DataTable columns: Customer, Type, Severity (color-coded badge), Description, Created By, Created At
- Actions: Resolve (with note dialog), click customer name to navigate to customer detail
- "Create Flag" button -> dialog with customer ID, type, severity, description

### Staff Management (`/admin/staff`)

- Only visible to `super_admin` role
- DataTable columns: Name, Email, Role (badge), Department, Status (active/deactivated), Last Login
- "Create Staff" button -> dialog with email, full name, role, department, password
- Row actions: Edit role/department, Deactivate

### Settings (`/admin/settings`)

- Tabs:
  - **Feature Flags**: Toggle switches for each flag (registrations_enabled, ethswitch_enabled, lending_enabled, p2p_enabled)
  - **System Limits**: Editable fields for max_single_transfer_cents, daily limits, max loan amount
  - **FX Rates**: Current rates table with manual override form and refresh button
  - **Fee Schedules**: Fee schedule table with create/edit/deactivate actions
  - **Regulatory Rules**: Rules table with create/edit actions

---

## Components

### AdminSidebar

- Fixed left sidebar, 256px wide, `bg-card border-r border-border`
- Logo at top: Forest Green square with white "N" + "Neo Admin" text
- Navigation sections:
  - **Main**: Dashboard, Customers, Transactions
  - **Finance**: Loans, Cards, Reconciliation
  - **Compliance**: Audit, Flags
  - **System**: Staff, Settings
- Active item: `bg-primary/10 text-primary` with 3px left border
- Hover: `bg-muted`
- Collapse to icon-only on smaller screens (1024-1280px)
- Hide items the current role cannot access (check permissions)

### AdminHeader

- Top bar, `h-16 bg-card border-b border-border`
- Left: Page title (dynamic based on route)
- Right: Staff name, role badge, avatar placeholder, logout button

### AdminAuthGuard

- Wraps all admin routes except `/admin/login`
- Checks `admin-auth-store` for valid token
- Redirects to `/admin/login` if no token
- On 401 from admin API client: clear admin auth store, redirect to `/admin/login`

### DataTable

- Reusable table component accepting:
  - `columns: Column[]` (header, accessor, sortable, render function)
  - `data: T[]`
  - `pagination: PaginationMeta`
  - `onPageChange: (offset: number) => void`
  - `onSort: (field: string, order: "asc" | "desc") => void`
  - `onRowClick?: (row: T) => void`
  - `isLoading: boolean`
- Renders: table header with sort indicators, table body, skeleton rows when loading,
  empty state when no data, PaginationControls at bottom

### StatsCard

- `bg-card rounded-2xl p-5 border border-border`
- Label (muted, text-sm), Value (text-2xl font-semibold font-tabular), optional trend indicator

### StatusBadge

- Maps status strings to colors:
  - `active`, `completed`, `verified`, `resolved` -> success (green)
  - `pending`, `investigating`, `in_arrears` -> warning (amber)
  - `frozen`, `defaulted`, `failed`, `declined`, `escalated`, `critical` -> destructive (red)
  - `cancelled`, `expired`, `written_off`, `deactivated` -> muted (gray)
- Pill shape: `rounded-3xl px-2.5 py-0.5 text-xs font-semibold`

### SearchInput

- Debounced input (300ms) with search icon prefix
- `h-10 rounded-[10px]` matching the design system
- Clears on Escape key

### PaginationControls

- Shows: "Showing 1-20 of 15,420"
- Previous / Next buttons
- Page size selector (20, 50, 100)

### FilterBar

- Horizontal row of filter chips/dropdowns
- Active filters shown as pills with "x" to remove
- "Clear all" button when any filter is active

### AuditTimeline

- Vertical timeline of audit entries
- Each entry: timestamp, action badge, actor name, description
- Expandable metadata JSON viewer

### ConfirmDialog

- Modal dialog for destructive actions
- Title, description, optional reason text input
- Cancel + Confirm buttons (confirm is destructive variant)
- Used for: freeze, unfreeze, write-off, cancel card, reverse transaction, resolve flag

---

## Admin Auth Store (`src/providers/admin-auth-store.ts`)

```typescript
interface AdminAuthState {
  token: string | null;
  staff: AdminStaff | null;
  login: (token: string, staff: AdminStaff) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
}
```

- Persisted in `sessionStorage` under key `neo-admin-auth`
- `hasPermission` checks the staff role against the `RolePermissions` map
- Completely independent from the customer `useAuthStore`

---

## Admin API Client (`src/lib/admin-api-client.ts`)

- Same structure as `src/lib/api-client.ts` but:
  - Reads token from `admin-auth-store` (not `useAuthStore`)
  - All paths are prefixed with `/admin/v1` automatically
  - On 401: clears admin auth store, redirects to `/admin/login` (not `/login`)
  - No idempotency key header (admin endpoints don't use the idempotency middleware)
  - Same timeout (15s), same error handling pattern

```typescript
export const adminApi = {
  get<T>(path: string): Promise<T>,
  post<T>(path: string, body: unknown): Promise<T>,
  patch<T>(path: string, body: unknown): Promise<T>,
  put<T>(path: string, body: unknown): Promise<T>,
  delete<T>(path: string): Promise<T>,
};
```

The `path` parameter should NOT include `/admin/v1` — the client prepends it.
Example: `adminApi.get("/customers")` calls `GET /admin/v1/customers`.

---

## Hooks

Each hook file exports TanStack Query hooks for its domain. All hooks use the
`adminApi` client. Query keys follow the pattern `["admin", domain, ...params]`.

### use-admin-auth.ts

- `useAdminLogin()` — mutation: `POST /auth/login`
- `useAdminChangePassword()` — mutation: `POST /auth/change-password`
- `useAdminMe()` — query: `GET /staff/me`

### use-admin-customers.ts

- `useAdminCustomers(filter)` — query: `GET /customers`
- `useAdminCustomer(id)` — query: `GET /customers/{id}`
- `useAdminCustomerFlags(id)` — query: `GET /customers/{id}/flags`
- `useAdminFreezeCustomer()` — mutation: `POST /customers/{id}/freeze`
- `useAdminUnfreezeCustomer()` — mutation: `POST /customers/{id}/unfreeze`
- `useAdminKYCOverride()` — mutation: `POST /customers/{id}/kyc-override`
- `useAdminAddNote()` — mutation: `POST /customers/{id}/note`

### use-admin-transactions.ts

- `useAdminTransactions(filter)` — query: `GET /transactions`
- `useAdminTransaction(id)` — query: `GET /transactions/{id}`
- `useAdminReverseTransaction()` — mutation: `POST /transactions/{id}/reverse`

### use-admin-loans.ts

- `useAdminLoans(filter)` — query: `GET /loans`
- `useAdminLoanSummary()` — query: `GET /loans/summary`
- `useAdminLoan(id)` — query: `GET /loans/{id}`
- `useAdminWriteOffLoan()` — mutation: `POST /loans/{id}/write-off`
- `useAdminCreditProfiles(filter)` — query: `GET /credit-profiles`
- `useAdminCreditProfile(userId)` — query: `GET /credit-profiles/{userId}`
- `useAdminOverrideCredit()` — mutation: `POST /credit-profiles/{userId}/override`

### use-admin-cards.ts

- `useAdminCards(filter)` — query: `GET /cards`
- `useAdminCard(id)` — query: `GET /cards/{id}`
- `useAdminCardAuthorizations(id, pagination)` — query: `GET /cards/{id}/authorizations`
- `useAdminFreezeCard()` — mutation: `POST /cards/{id}/freeze`
- `useAdminUnfreezeCard()` — mutation: `POST /cards/{id}/unfreeze`
- `useAdminCancelCard()` — mutation: `POST /cards/{id}/cancel`
- `useAdminUpdateCardLimits()` — mutation: `PATCH /cards/{id}/limits`

### use-admin-recon.ts

- `useAdminReconRuns(pagination)` — query: `GET /reconciliation/runs`
- `useAdminReconExceptions(filter)` — query: `GET /reconciliation/exceptions`
- `useAdminAssignException()` — mutation: `POST /reconciliation/exceptions/{id}/assign`
- `useAdminInvestigateException()` — mutation: `POST /reconciliation/exceptions/{id}/investigate`
- `useAdminResolveException()` — mutation: `POST /reconciliation/exceptions/{id}/resolve`
- `useAdminEscalateException()` — mutation: `POST /reconciliation/exceptions/{id}/escalate`

### use-admin-audit.ts

- `useAdminAuditLog(filter)` — query: `GET /audit`
- `useAdminAuditEntry(id)` — query: `GET /audit/{id}`

### use-admin-analytics.ts

- `useAdminOverview()` — query: `GET /analytics/overview`

### use-admin-flags.ts

- `useAdminFlags(filter)` — query: `GET /flags`
- `useAdminCreateFlag()` — mutation: `POST /flags`
- `useAdminResolveFlag()` — mutation: `POST /flags/{id}/resolve`

### use-admin-staff.ts

- `useAdminStaffList(filter)` — query: `GET /staff`
- `useAdminStaffMember(id)` — query: `GET /staff/{id}`
- `useAdminCreateStaff()` — mutation: `POST /staff`
- `useAdminUpdateStaff()` — mutation: `PATCH /staff/{id}`
- `useAdminDeactivateStaff()` — mutation: `DELETE /staff/{id}`

### use-admin-config.ts

- `useAdminConfig()` — query: `GET /config`
- `useAdminUpdateConfig()` — mutation: `PATCH /config`
- `useAdminRules()` — query: `GET /rules`
- `useAdminRule(id)` — query: `GET /rules/{id}`
- `useAdminCreateRule()` — mutation: `POST /rules`
- `useAdminUpdateRule()` — mutation: `PATCH /rules/{id}`
- `useAdminComplianceReport()` — query: `GET /compliance/report`

### use-admin-fx-rates.ts

- `useAdminFXRates()` — query: `GET /fx/rates`
- `useAdminFXRateHistory()` — query: `GET /fx/rates/history`
- `useAdminOverrideFXRate()` — mutation: `POST /fx/rates`
- `useAdminRefreshFXRates()` — mutation: `POST /fx/rates/refresh`

### use-admin-fees.ts

- `useAdminFeeSchedules()` — query: `GET /fees`
- `useAdminCreateFeeSchedule()` — mutation: `POST /fees`
- `useAdminUpdateFeeSchedule()` — mutation: `PUT /fees/{id}`
- `useAdminDeactivateFeeSchedule()` — mutation: `DELETE /fees/{id}`
- `useAdminProviders()` — query: `GET /fees/providers`
- `useAdminUpdateProvider()` — mutation: `PUT /fees/providers/{id}`

---

## Types (`src/lib/admin-types.ts`)

All admin-specific TypeScript types. Reuse `SupportedCurrency`, `KYCLevel`,
`ReceiptType`, `ReceiptStatus`, `LoanStatus`, `CardType`, `CardStatus` from
`src/lib/types.ts`.

### Staff

```typescript
type StaffRole = "super_admin" | "customer_support" | "customer_support_lead"
  | "compliance_officer" | "lending_officer" | "reconciliation_analyst"
  | "card_operations" | "treasury" | "auditor";

interface AdminStaff {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  department: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface AdminLoginRequest { email: string; password: string; }
interface AdminLoginResponse { token: string; staff: AdminStaff; }
interface AdminChangePasswordRequest { currentPassword: string; newPassword: string; }
interface AdminCreateStaffRequest { email: string; fullName: string; role: StaffRole; department: string; password: string; }
interface AdminUpdateStaffRequest { role?: StaffRole; department?: string; fullName?: string; }
```

### Pagination

```typescript
interface PaginationMeta { total: number; limit: number; offset: number; hasMore: boolean; }
interface PaginatedResponse<T> { data: T[]; pagination: PaginationMeta; }
```

### Filters

```typescript
interface CustomerFilter { search?: string; kycLevel?: number; isFrozen?: boolean; createdFrom?: string; createdTo?: string; sort?: string; order?: "asc" | "desc"; limit?: number; offset?: number; }
interface TransactionFilter { search?: string; userId?: string; type?: string; status?: string; currency?: string; minAmountCents?: number; maxAmountCents?: number; createdFrom?: string; createdTo?: string; sort?: string; order?: "asc" | "desc"; limit?: number; offset?: number; }
interface LoanFilter { search?: string; userId?: string; status?: string; createdFrom?: string; createdTo?: string; sort?: string; order?: "asc" | "desc"; limit?: number; offset?: number; }
interface CardFilter { search?: string; userId?: string; type?: string; status?: string; sort?: string; order?: "asc" | "desc"; limit?: number; offset?: number; }
interface AuditFilter { search?: string; action?: string; actorType?: string; actorId?: string; resourceType?: string; resourceId?: string; createdFrom?: string; createdTo?: string; sort?: string; order?: "asc" | "desc"; limit?: number; offset?: number; }
interface ExceptionFilter { status?: string; errorType?: string; assignedTo?: string; createdFrom?: string; createdTo?: string; limit?: number; offset?: number; }
interface FlagFilter { severity?: string; flagType?: string; isResolved?: boolean; userId?: string; limit?: number; offset?: number; }
interface StaffFilter { role?: string; isActive?: boolean; limit?: number; offset?: number; }
```

### Customer Profile

```typescript
interface AdminCustomerProfile {
  user: { id: string; phoneNumber: string; firstName?: string; middleName?: string; lastName?: string; kycLevel: number; isFrozen: boolean; frozenReason?: string; ledgerWalletId: string; createdAt: string; };
  kycVerifications: Array<{ id: string; faydaFin: string; status: string; verifiedAt?: string; }>;
  currencyBalances: Array<{ currencyCode: string; isPrimary: boolean; balanceCents: number; display: string; accountDetails?: { iban: string; accountNumber: string; bankName: string; swiftCode: string; }; }>;
  totalInETBCents: number;
  totalDisplay: string;
  pots: Array<{ id: string; name: string; currencyCode: string; emoji?: string; balanceCents: number; targetCents?: number; progressPercent?: number; }>;
  creditProfile?: { trustScore: number; approvedLimitCents: number; currentOutstandingCents: number; isNbeBlacklisted: boolean; };
  activeLoans: number;
  activeCards: number;
  recentTransactions: AdminTransaction[];
  flags: AdminFlag[];
  internalNotes: AdminAuditEntry[];
}
```

### Domain Types

```typescript
interface AdminTransaction { id: string; userId: string; type: string; status: string; amountCents: number; currency: string; counterpartyName?: string; counterpartyPhone?: string; narration?: string; createdAt: string; }
interface AdminLoan { id: string; userId: string; principalAmountCents: number; interestFeeCents: number; totalDueCents: number; totalPaidCents: number; durationDays: number; disbursedAt: string; dueDate: string; status: string; daysPastDue: number; createdAt: string; }
interface AdminLoanDetail extends AdminLoan { installments: AdminLoanInstallment[]; remainingCents: number; }
interface AdminLoanInstallment { installmentNumber: number; amountDueCents: number; amountPaidCents: number; dueDate: string; isPaid: boolean; paidAt?: string; }
interface AdminLoanBookSummary { totalLoansIssued: number; totalDisbursedCents: number; totalOutstandingCents: number; totalRepaidCents: number; portfolioAtRiskPercent: number; byStatus: Record<string, { count: number; outstandingCents?: number; totalRepaidCents?: number; writtenOffCents?: number; }>; avgTrustScore: number; avgLoanSizeCents: number; repaymentRatePercent: number; asOf: string; }
interface AdminCard { id: string; userId: string; lastFour: string; expiryMonth: number; expiryYear: number; type: string; status: string; allowOnline: boolean; allowContactless: boolean; allowAtm: boolean; allowInternational: boolean; dailyLimitCents: number; monthlyLimitCents: number; perTxnLimitCents: number; createdAt: string; }
interface AdminCardAuthorization { id: string; cardId: string; merchantName: string; merchantId: string; merchantCategoryCode: string; authAmountCents: number; settlementAmountCents?: number; currency: string; status: string; declineReason?: string; authorizedAt: string; settledAt?: string; }
interface AdminReconRun { id: string; runDate: string; clearingFileName: string; totalRecords: number; matchedCount: number; exceptionCount: number; status: string; startedAt: string; finishedAt?: string; }
interface AdminReconException { id: string; ethSwitchReference: string; errorType: string; status: string; assignedTo?: string; resolutionNotes?: string; createdAt: string; }
interface AdminAuditEntry { id: string; action: string; actorType: string; actorId: string; resourceType: string; resourceId: string; metadata?: Record<string, unknown>; ipAddress?: string; userAgent?: string; createdAt: string; }
interface AdminFlag { id: string; userId: string; flagType: string; severity: string; description: string; createdBy?: string; isResolved: boolean; resolvedBy?: string; resolvedAt?: string; resolutionNote?: string; createdAt: string; }
interface AdminSystemConfig { key: string; value: unknown; description?: string; updatedBy?: string; updatedAt: string; }
interface AdminAnalyticsOverview { totalCustomers: number; activeCustomers30d: number; newCustomersToday: number; newCustomersThisWeek: number; newCustomersThisMonth: number; kycBreakdown: Record<string, number>; frozenAccounts: number; totalTransactionsToday: number; totalTransactionVolumeToday: Record<string, { count: number; volumeCents: number; }>; activeLoans: number; totalLoanOutstandingCents: number; activeCards: number; pendingReconExceptions: number; asOf: string; }
interface AdminFXRate { id: string; fromCurrency: string; toCurrency: string; midRate: number; bidRate: number; askRate: number; spreadPercent: number; source: string; fetchedAt: string; }
interface AdminFeeSchedule { id: string; name: string; feeType: string; amountCents?: number; percentBps?: number; minCents?: number; maxCents?: number; currency: string; isActive: boolean; createdAt: string; }
interface AdminRemittanceProvider { id: string; name: string; code: string; isActive: boolean; supportedCurrencies: string[]; }
interface AdminRegulatoryRule { id: string; key: string; scope: string; valueType: string; value: string; description?: string; effectiveFrom: string; effectiveTo?: string; version: number; createdAt: string; }
interface AdminComplianceReport { generatedAt: string; rules: AdminRegulatoryRule[]; violations: Array<{ ruleKey: string; count: number; }>; }
```

### Mutation Request Types

```typescript
interface FreezeRequest { reason: string; }
interface KYCOverrideRequest { kycLevel: number; reason: string; }
interface AddNoteRequest { note: string; }
interface ReverseTransactionRequest { reason: string; referenceTicket: string; }
interface WriteOffLoanRequest { reason: string; referenceTicket: string; }
interface CreditOverrideRequest { approvedLimitCents: number; reason: string; expiresAt?: string; }
interface UpdateCardLimitsRequest { dailyLimitCents?: number; monthlyLimitCents?: number; perTxnLimitCents?: number; }
interface CreateFlagRequest { userId: string; flagType: string; severity: string; description: string; }
interface ResolveFlagRequest { resolutionNote: string; }
interface AssignExceptionRequest { assignedTo: string; }
interface ResolveExceptionRequest { resolutionNotes: string; resolutionAction: string; }
interface EscalateExceptionRequest { notes: string; }
interface UpdateConfigRequest { entries: Array<{ key: string; value: unknown; }>; }
interface OverrideFXRateRequest { fromCurrency: string; toCurrency: string; midRate: number; spreadPercent: number; }
```

---

## Testing Strategy

Every admin hook must have a corresponding test file under
`src/hooks/admin/__tests__/`. Tests verify:

1. **Correct endpoint paths** — the hook calls the right URL
2. **Correct HTTP methods** — GET for queries, POST/PATCH/PUT/DELETE for mutations
3. **Query parameter serialization** — filter objects are correctly serialized to URL params
4. **Request body shape** — mutation payloads match the expected types
5. **Auth header** — admin JWT is included in requests
6. **Error handling** — 401 triggers admin logout (not customer logout)

Tests mock `fetch` globally using `vi.fn()` and assert on the URL, method, headers,
and body of each call.

---

## Acceptance Criteria

1. All admin pages render with data from the backend API
2. Navigation hides items the current role cannot access
3. Destructive actions require confirmation dialogs
4. All list pages have working search, filters, pagination, and sorting
5. Admin auth is completely isolated from customer auth
6. All hooks have passing tests that verify correct API calls
7. `npm run type-check` and `npm run build` pass with zero errors
8. The admin UI works on 1024px+ screens

---

## Implementation Order

1. `src/providers/admin-auth-store.ts` — admin auth state
2. `src/lib/admin-types.ts` — all TypeScript types
3. `src/lib/admin-api-client.ts` — admin API client
4. `src/hooks/admin/` — all 13 hook files
5. `src/hooks/admin/__tests__/` — all test files
6. `src/components/admin/` — shared admin components
7. `src/app/(admin)/layout.tsx` — admin shell
8. `src/app/(admin)/admin/login/page.tsx` — login page
9. `src/app/(admin)/admin/page.tsx` — dashboard overview
10. Remaining pages in order: customers, transactions, loans, cards, reconciliation, audit, flags, staff, settings
