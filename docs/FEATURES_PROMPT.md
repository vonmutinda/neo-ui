# Neo UI — Recipients, Payment Requests & Loan Operations

> Prompt for an AI agent to build three feature areas in the Next.js frontend
> that align with the Go backend API. Follow every convention already
> established in the codebase — no new libraries, no new patterns.

---

## Codebase Conventions (must follow)

| Concern | Convention |
|---------|-----------|
| Pages | `"use client"` client components in `src/app/(group)/` route groups |
| Hooks | One file per domain in `src/hooks/`, wrapping `useQuery`/`useMutation` from `@tanstack/react-query` v5 |
| API calls | Via `api.get<T>()` / `api.post<T>()` from `@/lib/api-client` — never raw `fetch` |
| Types | Exported from `@/lib/types.ts`, field names match backend JSON exactly |
| Validation | Pure functions in `@/lib/validation.ts` returning `string | null` |
| Formatting | Helpers in `@/lib/format.ts` (`formatMoney`, `currencySymbol`) |
| Layout | `AuthGuard > UserProfileLoader > Sidebar + BottomNav + ErrorBoundary > main` |
| Styling | Tailwind v4 + shadcn/ui (New York). Use `cn()` from `@/lib/utils`. Rounded corners: `rounded-2xl` for cards, `rounded-[10px]` for inputs. Heights: `h-14` for primary buttons/inputs. |
| Colors | Semantic tokens only — `bg-muted`, `text-muted-foreground`, `bg-primary/10`, `text-primary`, `bg-success/10`, `text-success`, `bg-warning/10`, `text-warning`, `bg-destructive/10`, `text-destructive`. Dark mode via `dark:bg-card dark:border dark:border-border`. |
| Animations | Framer Motion — `motion.div` with `initial={{ opacity: 0, y: 10 }}` / `animate={{ opacity: 1, y: 0 }}`. Staggered lists: `transition={{ delay: 0.05 * index }}`. Bottom sheets: spring with `damping: 25, stiffness: 300`. |
| Loading | `<Skeleton>` components matching the final layout shape |
| Errors | Toast via `sonner` for mutations. Inline error states with retry for queries. |
| Empty states | Centered icon + text + optional CTA inside a `rounded-2xl bg-muted` container |
| Icons | `lucide-react` only |
| Navigation | Back button: `<Link href="..">` with `ArrowLeft` in a `h-10 w-10 rounded-full` container |
| Section headers | `text-[11px] font-semibold uppercase tracking-widest text-muted-foreground` |
| Money display | `font-tabular` class for tabular numbers, `formatMoney(cents, currency)` |
| Forms | Controlled state with `useState`. Disable submit until valid. No react-hook-form. |
| Toasts | `toast.success(title, { description })` and `toast.error(title, { description })` |
| Tests | Vitest + React Testing Library. Mock hooks via `vi.mock()`. Wrap renders in `QueryClientProvider`. Test loading, error, empty, and populated states. |

---

## Feature 1: Recipients

### Backend API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/recipients?q=&type=&favorite=&limit=20&offset=0` | List with filters |
| `GET` | `/v1/recipients/{id}` | Get single |
| `GET` | `/v1/recipients/search/bank?institution=CBE&account=1000` | Search by bank account |
| `GET` | `/v1/recipients/search/name?q=abebe` | Search by name |
| `PATCH` | `/v1/recipients/{id}/favorite` | Toggle favorite `{ "isFavorite": true }` |
| `DELETE` | `/v1/recipients/{id}` | Archive (soft-delete) |
| `GET` | `/v1/banks` | List available banks |

### Types to Add (`src/lib/types.ts`)

```typescript
export type RecipientType = "neo_user" | "bank_account";
export type RecipientStatus = "active" | "archived";

export interface Recipient {
  id: string;
  ownerUserId: string;
  type: RecipientType;
  displayName: string;
  neoUserId?: string;
  countryCode?: string;
  number?: string;
  username?: string;
  institutionCode?: string;
  bankName?: string;
  swiftBic?: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  bankCountryCode?: string;
  beneficiaryId?: string;
  isBeneficiary: boolean;
  isFavorite: boolean;
  lastUsedAt?: string;
  lastUsedCurrency?: string;
  transferCount: number;
  status: RecipientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientListResponse {
  recipients: Recipient[];
  total: number;
}

export interface Bank {
  institutionCode: string;
  name: string;
  swiftBic: string;
  countryCode: string;
}
```

### Hooks (`src/hooks/use-recipients.ts`)

```typescript
export function useRecipients(params?: {
  q?: string;
  type?: RecipientType;
  favorite?: boolean;
  limit?: number;
  offset?: number;
}) { /* useQuery, queryKey: ["recipients", params] */ }

export function useRecipient(id: string) {
  /* useQuery, queryKey: ["recipients", id], enabled: !!id */
}

export function useSearchRecipientsByBank(institution: string, account: string) {
  /* useQuery, enabled: institution.length > 0 && account.length >= 4 */
}

export function useSearchRecipientsByName(name: string) {
  /* useQuery, enabled: name.length >= 2 */
}

export function useToggleFavorite() {
  /* useMutation, PATCH, invalidate ["recipients"], toast */
}

export function useArchiveRecipient() {
  /* useMutation, DELETE, invalidate ["recipients"], toast */
}

export function useBanks() {
  /* useQuery, queryKey: ["banks"], staleTime: 5 * 60 * 1000 */
}
```

### Pages

#### Route group: `src/app/(dashboard)/recipients/`

Nest under the `(dashboard)` route group so it inherits the existing layout
with Sidebar, BottomNav, AuthGuard, and UserProfileLoader.

#### List page (`src/app/(dashboard)/recipients/page.tsx`)

- Header: back arrow + "Recipients" title
- Search bar: debounced text input filtering by name
- Filter chips: "All", "Neo Users", "Bank Accounts", "Favorites"
- List: each row shows:
  - Avatar circle: first letter of `displayName` with `bg-primary/10 text-primary` for neo users, `bg-muted text-muted-foreground` for bank accounts
  - `displayName` (bold), subtitle: username or masked account number
  - Star icon (filled if `isFavorite`, tap to toggle)
  - Chevron right → links to detail
- Empty state: "No recipients yet. They'll appear here after your first transfer."
- Staggered entry animation on list items

#### Detail page (`src/app/(dashboard)/recipients/[id]/page.tsx`)

- Header: back arrow + recipient name
- Info card with:
  - Type badge: "Neo User" or "Bank Account"
  - For neo users: phone number, username
  - For bank accounts: bank name, masked account number, SWIFT/BIC
  - Favorite toggle button
  - Transfer count + last used date
- Action buttons:
  - "Send Money" → navigates to `/send` with recipient pre-filled (set in `useSendStore`)
  - "Request Money" → navigates to `/requests/new` with recipient pre-filled
  - "Archive" → confirmation dialog, then soft-delete, redirect to list
- If `isBeneficiary`: show a "Verified Beneficiary" badge with a shield icon

---

## Feature 2: Beneficiaries

### Backend API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/beneficiaries` | Create `{ fullName, relationship, documentUrl? }` |
| `GET` | `/v1/beneficiaries` | List all for user |
| `DELETE` | `/v1/beneficiaries/{id}` | Soft-delete |

### Types to Add (`src/lib/types.ts`)

```typescript
export type BeneficiaryRelationship = "spouse" | "child" | "parent";

export interface Beneficiary {
  id: string;
  userId: string;
  fullName: string;
  relationship: BeneficiaryRelationship;
  documentUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CreateBeneficiaryRequest {
  fullName: string;
  relationship: BeneficiaryRelationship;
  documentUrl?: string;
}
```

### Hooks (`src/hooks/use-beneficiaries.ts`)

```typescript
export function useBeneficiaries() {
  /* useQuery, queryKey: ["beneficiaries"] */
}

export function useCreateBeneficiary() {
  /* useMutation, POST, invalidate ["beneficiaries"], toast */
}

export function useDeleteBeneficiary() {
  /* useMutation, DELETE, invalidate ["beneficiaries"], toast */
}
```

### Pages

#### Beneficiaries section on the Recipients page

Add a "Beneficiaries" tab or section below the recipients list on the
recipients page. Alternatively, add a dedicated page at
`src/app/(dashboard)/recipients/beneficiaries/page.tsx`.

Preferred approach: add a tab bar at the top of the recipients page with
"Recipients" and "Beneficiaries" tabs.

#### Beneficiaries tab content

- List: each row shows:
  - Avatar with relationship icon (Heart for spouse, Baby for child, User for parent)
  - Full name (bold), relationship label below
  - Verification badge: green checkmark if `isVerified`, gray clock if not
  - Delete button (trash icon, with confirmation)
- "Add Beneficiary" button at the top
- Empty state: "No beneficiaries added. Add family members for international transfers."

#### Add Beneficiary bottom sheet

- Fields:
  - Full name (text input, 2-200 chars)
  - Relationship (segmented control: Spouse / Child / Parent)
  - Supporting document URL (optional text input)
- Submit button: "Add Beneficiary"
- Validation: name required and 2-200 chars, relationship required

---

## Feature 3: Payment Requests (Request Money)

### Backend API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/payment-requests` | Create `{ recipient, amountCents, currencyCode, narration }` |
| `GET` | `/v1/payment-requests/sent?limit=&offset=` | List sent requests |
| `GET` | `/v1/payment-requests/received?limit=&offset=` | List received requests |
| `GET` | `/v1/payment-requests/received/count` | Pending received count |
| `GET` | `/v1/payment-requests/{id}` | Get single |
| `POST` | `/v1/payment-requests/{id}/pay` | Pay a request |
| `POST` | `/v1/payment-requests/{id}/decline` | Decline `{ reason? }` |
| `DELETE` | `/v1/payment-requests/{id}` | Cancel own request |
| `POST` | `/v1/payment-requests/{id}/remind` | Send reminder |

### Types to Add (`src/lib/types.ts`)

```typescript
export type PaymentRequestStatus =
  | "pending"
  | "paid"
  | "declined"
  | "cancelled"
  | "expired";

export interface PaymentRequest {
  id: string;
  requesterId: string;
  payerId?: string;
  payerPhone: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
  status: PaymentRequestStatus;
  transactionId?: string;
  declineReason?: string;
  reminderCount: number;
  lastRemindedAt?: string;
  paidAt?: string;
  declinedAt?: string;
  cancelledAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  requesterName?: string;
  payerName?: string;
}

export interface CreatePaymentRequestBody {
  recipient: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
}

export interface DeclinePaymentRequestBody {
  reason?: string;
}

export interface PendingCountResponse {
  count: number;
}
```

### Hooks (`src/hooks/use-payment-requests.ts`)

```typescript
export function useSentRequests(limit?: number, offset?: number) {
  /* useQuery, queryKey: ["payment-requests", "sent", limit, offset] */
}

export function useReceivedRequests(limit?: number, offset?: number) {
  /* useQuery, queryKey: ["payment-requests", "received", limit, offset] */
}

export function usePendingRequestCount() {
  /* useQuery, queryKey: ["payment-requests", "pending-count"], refetchInterval: 30_000 */
}

export function usePaymentRequest(id: string) {
  /* useQuery, queryKey: ["payment-requests", id], enabled: !!id */
}

export function useCreatePaymentRequest() {
  /* useMutation, POST, invalidate ["payment-requests"], toast */
}

export function usePayRequest() {
  /* useMutation, POST /v1/payment-requests/{id}/pay, invalidate ["payment-requests", "wallets"], toast */
}

export function useDeclineRequest() {
  /* useMutation, POST /v1/payment-requests/{id}/decline, invalidate ["payment-requests"], toast */
}

export function useCancelRequest() {
  /* useMutation, DELETE, invalidate ["payment-requests"], toast */
}

export function useRemindRequest() {
  /* useMutation, POST /v1/payment-requests/{id}/remind, invalidate ["payment-requests"], toast */
}
```

### Pages

#### Route group: `src/app/(dashboard)/requests/`

#### List page (`src/app/(dashboard)/requests/page.tsx`)

- Header: back arrow + "Requests" title + "New Request" button (top right)
- Tab bar: "Received" | "Sent" (default: Received)
- **Received tab**: list of incoming requests
  - Each row:
    - Avatar circle with requester initial
    - Requester name (bold), narration below
    - Amount in primary color, status badge
    - For `pending`: "Pay" and "Decline" action buttons inline
  - Pending requests sorted first, then by date descending
- **Sent tab**: list of outgoing requests
  - Each row:
    - Avatar circle with payer initial
    - Payer name (bold), narration below
    - Amount, status badge
    - For `pending`: "Remind" and "Cancel" action buttons inline
- Badge on "Received" tab showing pending count (from `usePendingRequestCount`)
- Empty states per tab

#### Detail page (`src/app/(dashboard)/requests/[id]/page.tsx`)

- Header: back arrow + "Request Detail"
- Status card:
  - Large amount display
  - Status badge (color-coded like loans)
  - Requester → Payer direction indicator
  - Narration
  - Timestamps: created, expires/paid/declined/cancelled
- Action buttons (contextual):
  - If received + pending: "Pay" (primary) + "Decline" (outline)
  - If sent + pending: "Remind" + "Cancel"
  - If paid: link to transaction detail
- Decline flow: bottom sheet with optional reason text input

#### New Request page (`src/app/(dashboard)/requests/new/page.tsx`)

Multi-step flow (separate pages or in-page steps):

1. **Select recipient**: search input resolving phone/username via `useResolveRecipient`, or pick from recent recipients
2. **Enter amount**: amount input + currency selector + narration field
3. **Confirm**: summary card with recipient, amount, narration → submit

Use `useState` for step state (no Zustand store needed for this simpler flow).

#### Split Request page (`src/app/(dashboard)/requests/new/split/page.tsx`)

Request money from multiple people at once (inspired by Monzo Split). This is
the inverse of batch send — instead of sending to N people, you request from
N people. Each recipient gets their own individual payment request.

**Backend: `POST /v1/payment-requests/batch`**

New endpoint that creates multiple payment requests in one call. Unlike batch
transfers, this does not touch the ledger — it simply creates N individual
`payment_request` rows.

Request shape:

```typescript
export interface BatchPaymentRequestBody {
  totalAmountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
  recipients: string[];  // phone numbers or usernames (2-10)
  splitType: "equal" | "custom";
  customAmounts?: Record<string, number>; // recipient -> amountCents (for custom split)
}
```

Response: array of the created payment requests.

```typescript
export interface BatchPaymentRequestResponse {
  requests: PaymentRequest[];
  totalAmountCents: number;
  recipientCount: number;
}
```

Validation:
- 2-10 recipients, no duplicates, no self-requests
- All recipients must be valid Neo users
- For `"equal"` split: `totalAmountCents` divided evenly (remainder goes to first recipient)
- For `"custom"` split: `customAmounts` must sum to `totalAmountCents`

**Hook: `useCreateBatchPaymentRequest`**

Add to `src/hooks/use-payment-requests.ts`:

```typescript
export function useCreateBatchPaymentRequest() {
  /* useMutation, POST /v1/payment-requests/batch, invalidate ["payment-requests"], toast */
}
```

**UI flow:**

- Accessible from the "New Request" page via a "Split with friends" button
- Step 1: add recipients (same recents row + lookup pattern as multi-send)
- Step 2: enter total amount + narration, choose equal or custom split
  - Equal: shows "Br X.XX / N people = Br Y.YY each"
  - Custom: per-recipient amount inputs (same as multi-send custom mode)
- Step 3: confirm — shows recipient list with amounts, submit creates all requests
- Result: "Requested from N people" success screen
- Each recipient sees an individual pending payment request in their received tab

### Dashboard Integration

- Add a "Requests" quick action on the dashboard alongside Send/Receive/Convert
- Show pending received count as a badge on the BottomNav or dashboard card
- Icon: `HandCoins` from lucide-react

---

## Feature 4: Loan Repayment (extend existing)

### Backend API (new endpoint to integrate)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/loans/{id}/repay` | Repay `{ amountCents }` |
| `GET` | `/v1/loans/credit-score` | Credit score breakdown |

### Types to Add (`src/lib/types.ts`)

```typescript
export interface LoanRepayRequest {
  amountCents: number;
}

export interface CreditScore {
  trustScore: number;
  maxScore: number;
  cashFlowPoints: number;
  stabilityPoints: number;
  penaltyPoints: number;
  basePoints: number;
  tips: string[];
}
```

### Hooks to Add (`src/hooks/use-loans.ts`)

```typescript
export function useRepayLoan() {
  /* useMutation, POST /v1/loans/{id}/repay, invalidate ["loans", "wallets"], toast */
}

export function useCreditScore() {
  /* useQuery, queryKey: ["loans", "credit-score"] */
}
```

### UI Changes

#### Repay button on loan detail page (`src/app/(loans)/loans/[id]/page.tsx`)

- Add a "Make Payment" button below the installment schedule for `active` or
  `in_arrears` loans
- Opens a bottom sheet:
  - Amount input (pre-filled with next installment amount)
  - Quick-select buttons: "Next Installment", "Full Remaining"
  - "Confirm Payment" button
  - Shows wallet balance for reference

#### Credit score page (`src/app/(loans)/loans/credit-score/page.tsx`)

- Header: back arrow + "Credit Score"
- Score gauge (reuse `TrustScoreGauge` from loans page, scale to 1000)
- **Score history chart** (inspired by Monzo Credit Insights): a line chart
  showing the trust score over the last 6 months. This transforms the score
  from a static number into a visible journey. Use a simple SVG polyline
  (no chart library needed) with:
  - X-axis: months (labels like "Sep", "Oct", "Nov", ...)
  - Y-axis: score range (300-1000)
  - Current score highlighted as a larger dot at the end of the line
  - Green line if trending up, red if trending down
  - Requires a new backend endpoint: `GET /v1/loans/credit-score/history`
    returning `{ history: [{ month: "2026-01", score: 680 }, ...] }`
  - New hook: `useCreditScoreHistory()` in `src/hooks/use-loans.ts`
  - New type: `CreditScoreHistoryEntry` with `month: string` and
    `score: number`
- Score breakdown card:
  - Cash Flow: bar showing points out of 400
  - Stability: bar showing points out of 200
  - Penalties: red bar showing negative points
  - Base: fixed 300
- **Actionable tips with progress indicators**: each tip from the API is
  rendered as a card with a progress ring or checkmark. For example:
  - "Maintain 3 consecutive on-time payments" — show 2/3 completed
  - "Keep your account active for 6 months" — show 4/6 months
  - Tips that are already achieved show a green checkmark
  This requires the backend to return structured tips with `progress` and
  `target` fields (extend the `CreditScore.tips` from `string[]` to an
  array of `{ text: string; progress?: number; target?: number; done?: boolean }`)
- Link to "View Loan History"

---

## Validation Rules (`src/lib/validation.ts`)

Add these validators:

```typescript
export function validateNarration(value: string): string | null {
  if (!value.trim()) return "Description is required";
  if (value.length > 140) return "Description must be 140 characters or less";
  return null;
}

export function validateBeneficiaryName(value: string): string | null {
  if (!value.trim()) return "Full name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  if (value.trim().length > 200) return "Name must be 200 characters or less";
  return null;
}

export function validateDurationDays(value: string): string | null {
  const num = parseInt(value, 10);
  if (isNaN(num)) return "Duration is required";
  if (num < 7) return "Minimum duration is 7 days";
  if (num > 365) return "Maximum duration is 365 days";
  return null;
}
```

---

## Status Badge Config (reusable pattern)

Follow the same pattern used in loans for payment request statuses:

```typescript
const REQUEST_STATUS_CONFIG: Record<
  PaymentRequestStatus,
  { label: string; className: string }
> = {
  pending:   { label: "Pending",   className: "bg-warning/10 text-warning" },
  paid:      { label: "Paid",      className: "bg-success/10 text-success" },
  declined:  { label: "Declined",  className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  expired:   { label: "Expired",   className: "bg-muted text-muted-foreground" },
};
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Add Recipient, Beneficiary, PaymentRequest, CreditScore types |
| `src/lib/validation.ts` | Add narration, beneficiary name, duration validators |
| `src/hooks/use-recipients.ts` | All recipient query/mutation hooks |
| `src/hooks/use-beneficiaries.ts` | All beneficiary query/mutation hooks |
| `src/hooks/use-payment-requests.ts` | All payment request query/mutation hooks |
| `src/hooks/use-loans.ts` | Add `useRepayLoan`, `useCreditScore` |
| `src/app/(dashboard)/recipients/page.tsx` | Recipients + Beneficiaries list with tabs |
| `src/app/(dashboard)/recipients/[id]/page.tsx` | Recipient detail |
| `src/app/(dashboard)/requests/page.tsx` | Payment requests list (sent/received tabs) |
| `src/app/(dashboard)/requests/[id]/page.tsx` | Payment request detail |
| `src/app/(dashboard)/requests/new/page.tsx` | Create payment request flow |
| `src/app/(dashboard)/requests/new/split/page.tsx` | Split request (batch payment request) flow |
| `src/app/(loans)/loans/[id]/page.tsx` | Add repayment bottom sheet |
| `src/app/(loans)/loans/credit-score/page.tsx` | Credit score breakdown page |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/(dashboard)/page.tsx` or dashboard components | Add "Request" quick action, pending badge |
| `src/components/shared/BottomNav.tsx` | Add pending request count badge |

---

## Testing Requirements

### Hook Tests (`src/hooks/__tests__/`)

For each hook file, create a corresponding test file. Mock `globalThis.fetch`
and assert:

- Correct HTTP method and path
- Query parameters serialized correctly
- Request body matches expected shape
- Cache invalidation on mutations
- `enabled` flag respected (e.g. `useRecipient("")` should not fire)

Follow the pattern in `src/hooks/admin/__tests__/use-admin-loans.test.ts`:

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}
```

### Validation Tests (`src/lib/__tests__/validation.test.ts`)

Add tests for `validateNarration`, `validateBeneficiaryName`,
`validateDurationDays` following the existing pattern.

### Page Tests (`src/app/(dashboard)/recipients/__tests__/`, etc.)

For each page, test:

1. **Loading state**: renders skeletons
2. **Error state**: shows error message
3. **Empty state**: shows empty message
4. **Populated state**: renders data correctly
5. **Interactions**: button clicks trigger expected mutations

Mock hooks via `vi.mock("@/hooks/use-recipients")` etc.
Mock `next/navigation` (`useRouter`, `useParams`).
Mock `framer-motion` to passthrough.

---

## Verification Checklist

After all changes:

1. Navigate to `/recipients` — see list with search and filter chips
2. Tap a recipient — see detail with send/request/archive actions
3. Toggle favorite — star fills/unfills, toast confirms
4. Archive a recipient — removed from list, toast confirms
5. Switch to Beneficiaries tab — see list or empty state
6. Add a beneficiary — form validates, submits, appears in list
7. Navigate to `/requests` — see received tab with pending count badge
8. Create a new request — multi-step flow completes, appears in sent tab
9. Pay a received request — funds deducted, status updates to "paid"
10. Decline a request — optional reason, status updates to "declined"
11. Cancel a sent request — removed from pending, status "cancelled"
12. Create a split request — add 3 people, enter total, see equal split
13. Adjust one person's share — others auto-adjust to keep total constant
14. Submit split — 3 individual payment requests created, appear in sent tab
15. Each recipient sees their individual request in received tab
16. On loan detail — "Make Payment" button opens repay sheet
17. Repay a loan — balance updates, installment marked paid, toast
18. View credit score — gauge, breakdown bars, tips displayed
19. Credit score history chart — line chart shows 6-month trend
20. Tips show progress indicators (e.g. "2/3 on-time payments")
21. All pages show proper loading skeletons, error states, and empty states
22. Dark mode renders correctly on all new pages
23. All tests pass: `npm run test`
