# Admin UI Refinements — Implementation Prompt

> Addresses four gaps in the admin dashboard: correct transaction counts,
> flag create/resolve operations, user-friendly transaction display, and
> enriched customer detail with balances.

---

## Role

Act as a Principal Frontend Engineer refining the Neo admin dashboard.
The backend API lives in the `neo` repo; the frontend in `neo-ui`.
Both repos share a workspace. Follow existing patterns exactly.

---

## 1. Dashboard — Display Total Transactions Correctly

### Problem

The backend `PlatformOverview` struct (`internal/services/admin/analytics_service.go`)
has no transaction count field. The frontend type `AdminAnalyticsOverview` references
`totalTransactionsToday` but the backend never populates it, so the dashboard card
always shows "—".

### Backend Changes (`neo` repo)

**`internal/repository/admin_queries.go`** — Add to the `AdminQueryRepository` interface:

```go
CountTransactions(ctx context.Context) (int64, error)
```

Add the implementation on `pgAdminQueryRepo`:

```go
func (r *pgAdminQueryRepo) CountTransactions(ctx context.Context) (int64, error) {
    return r.countQuery(ctx, `SELECT COUNT(*) FROM transaction_receipts`)
}
```

**`internal/services/admin/analytics_service.go`** — Add field to `PlatformOverview`:

```go
TotalTransactions int64 `json:"totalTransactions"`
```

Populate it in `Overview()`:

```go
if overview.TotalTransactions, err = s.adminRepo.CountTransactions(ctx); err != nil {
    return nil, err
}
```

**`internal/testutil/mocks.go`** — Add to `MockAdminQueryRepo`:

```go
func (m *MockAdminQueryRepo) CountTransactions(_ context.Context) (int64, error) {
    return 0, nil
}
```

**`internal/services/admin/analytics_service_test.go`** — Add assertion:

```go
s.Equal(int64(0), overview.TotalTransactions)
```

### Frontend Changes (`neo-ui` repo)

**`src/lib/admin-types.ts`** — Add to `AdminAnalyticsOverview`:

```typescript
totalTransactions: number;
```

**`src/app/admin/(authenticated)/page.tsx`** — Replace the "Transactions Today"
`StatsCard` with:

```tsx
<StatsCard
  label="Total Transactions"
  value={overview?.totalTransactions?.toLocaleString() ?? "—"}
  icon={ArrowLeftRight}
/>
```

Also add an "Open Flags" card using `overview?.openFlags` (the backend already
returns this field but the dashboard doesn't display it):

```tsx
<StatsCard
  label="Open Flags"
  value={overview?.openFlags?.toLocaleString() ?? "—"}
  icon={Flag}
/>
```

**`src/app/admin/__tests__/dashboard.test.tsx`** — Update the populated-overview
test data to include `totalTransactions` and `openFlags`, and assert they render.

---

## 2. Flags — Create and Resolve Operations

### Problem

The flags page (`src/app/admin/(authenticated)/flags/page.tsx`) is read-only.
The hooks `useAdminCreateFlag()` and `useAdminResolveFlag()` exist but the UI
has no buttons or dialogs to invoke them.

### Frontend Changes

**`src/app/admin/(authenticated)/flags/page.tsx`** — Add:

1. A "Create Flag" button in the header that opens a dialog with fields:
   - `userId` (text input, required)
   - `flagType` (select: `suspicious_activity`, `aml_alert`, `fraud_alert`,
     `compliance_review`, `manual_review`)
   - `severity` (select: `info`, `warning`, `critical`)
   - `description` (textarea, required)
2. An "Actions" column in the table. For unresolved flags, show a "Resolve" button.
3. A "Resolve Flag" dialog with a `resolutionNote` textarea (required).
4. Toast notifications via `sonner` on success/error for both operations.
5. Import and use `useAdminCreateFlag` and `useAdminResolveFlag` from the hooks.

The create dialog should call:

```typescript
createFlag.mutate({
  userId,
  flagType,
  severity,
  description,
});
```

The resolve dialog should call:

```typescript
resolveFlag.mutate({
  id: flag.id,
  resolutionNote: note,
});
```

On success, close the dialog and show `toast.success(...)`.
On error, show `toast.error(...)`.

**`src/app/admin/__tests__/flags.test.tsx`** — New test file covering:

- Renders loading state
- Renders empty state
- Renders flags with data
- "Create Flag" button opens dialog
- Create form submits with correct data
- "Resolve" button appears only for unresolved flags
- Resolve dialog submits with note
- Resolved flags show "Resolved" badge instead of resolve button

---

## 3. Transactions — User-Friendly Display

### Problem

The transaction list shows raw `counterpartyName ?? counterpartyPhone ?? "—"` in
the Counterparty column. The `userId` is not displayed at all. The `type` column
shows raw snake_case values like `p2p_send`.

### Frontend Changes

**`src/app/admin/(authenticated)/transactions/page.tsx`**:

1. Add a human-readable type label map:

```typescript
const TYPE_LABELS: Record<string, string> = {
  p2p_send: "P2P Send",
  p2p_receive: "P2P Receive",
  ethswitch_out: "Bank Transfer Out",
  ethswitch_in: "Bank Transfer In",
  card_purchase: "Card Purchase",
  card_atm: "ATM Withdrawal",
  loan_disbursement: "Loan Disbursement",
  loan_repayment: "Loan Repayment",
  fee: "Fee",
};
```

2. Replace the Type column cell from `<StatusBadge status={tx.type} />` to show
   the human-readable label.
3. Add a "User" column that links to the customer detail page:
   `<Link href={/admin/customers/${tx.userId}}>` showing a truncated userId.
4. Format the Counterparty column to prefer `counterpartyName`, fall back to
   formatted `counterpartyPhone`, then "—".
5. Show date+time instead of just date in the Date column.

**`src/app/admin/(authenticated)/transactions/[id]/page.tsx`**:

1. Make the "User ID" a clickable link to `/admin/customers/${tx.userId}`.
2. Show fee amount if `tx.feeCents` exists.
3. Show date+time for Created/Updated fields.

**`src/app/admin/__tests__/transactions.test.tsx`** — Add tests for:

- Human-readable type labels render correctly
- Counterparty name/phone fallback works
- User column links to customer detail

---

## 4. Customer Detail — Show All Relevant Info

### Problem

The backend `CustomerProfile` only returns `User`, `KYCVerifications`, and `Flags`.
The frontend type `AdminCustomerProfile` is richer (includes `currencyBalances`,
`totalDisplay`, `creditProfile`, `recentTransactions`, `pots`, `activeLoans`,
`activeCards`). The UI already renders these but they come as null from the real API.

### Backend Changes (`neo` repo)

**`internal/services/admin/customer_service.go`** — Enrich `CustomerProfile`:

```go
type CustomerProfile struct {
    User              domain.User              `json:"user"`
    KYCVerifications  []domain.KYCVerification `json:"kycVerifications"`
    Flags             []domain.CustomerFlag    `json:"flags"`
    CurrencyBalances  []CurrencyBalanceView    `json:"currencyBalances"`
    TotalInETBCents   int64                    `json:"totalInETBCents"`
    TotalDisplay      string                   `json:"totalDisplay"`
    CreditProfile     *domain.CreditProfile    `json:"creditProfile,omitempty"`
    ActiveLoans       int64                    `json:"activeLoans"`
    ActiveCards       int64                    `json:"activeCards"`
    RecentTransactions []domain.TransactionReceipt `json:"recentTransactions"`
}

type CurrencyBalanceView struct {
    CurrencyCode string `json:"currencyCode"`
    IsPrimary    bool   `json:"isPrimary"`
    BalanceCents int64  `json:"balanceCents"`
    Display      string `json:"display"`
}
```

Add dependencies to `CustomerService`: `creditRepo`, `loanRepo`, `cardRepo`,
`txnRepo` (or use `adminRepo` methods). In `GetProfile()`, after fetching user/KYC/flags,
also fetch:

- Currency balances from the ledger (via `ledgerClient.GetWalletBalances`)
- Credit profile from `creditRepo.GetByUserID`
- Active loan count from `adminRepo.ListLoans` with user filter
- Active card count from `adminRepo.ListCards` with user filter
- Recent transactions from `adminRepo.ListTransactions` with user filter (limit 10)

### Frontend Changes

**`src/app/admin/(authenticated)/customers/[id]/page.tsx`**:

The page already renders `currencyBalances`, `creditProfile`, `recentTransactions`,
`totalDisplay`, `activeLoans`, `activeCards`. Ensure:

1. The Total Balance stats card shows `profile.totalDisplay` (already does).
2. Currency balances section shows each currency with formatted amount.
3. Credit profile section shows trust score, approved limit, outstanding, blacklist.
4. Recent transactions link to transaction detail pages.
5. Add account details display (IBAN, account number) when available.
6. Show `pots` section if the customer has savings pots.
7. Show KYC verifications section with Fayda ID and verification status.

**`src/app/admin/__tests__/customer-detail.test.tsx`** — Add/update tests for:

- Renders all currency balances with correct formatting
- Renders credit profile section
- Renders KYC verifications
- Renders pots when present
- Handles null/undefined gracefully for all new sections

---

## Testing Strategy

All tests use Vitest + Testing Library. Follow the existing patterns in
`src/app/admin/__tests__/` and `src/hooks/admin/__tests__/`.

### Page Tests

- Mock hooks with `vi.mock()` and `vi.fn()`
- Test loading, empty, populated, and error states
- Test user interactions (button clicks, form submissions)
- Test navigation links

### Hook Tests

- Existing hook tests already verify API call correctness
- No new hooks needed — all mutations already exist

### Run Tests

```bash
cd neo-ui && npx vitest run src/app/admin/__tests__/ src/hooks/admin/__tests__/
```

---

## 5. FX Conversions — Display as Single Transaction

### Problem

FX conversions are stored as two separate `transaction_receipts` rows:
- `convert_out`: debit of the source currency (e.g., 500 ETB)
- `convert_in`: credit of the destination currency (e.g., 10 USD)

Both share the same `ledger_transaction_id` and `idempotency_key`. The admin UI
previously did not include conversion types in `TYPE_LABELS` or `RECEIPT_TYPES`,
so conversions were invisible or showed raw snake_case labels.

### Backend Changes (`neo` repo)

**`internal/repository/admin_queries.go`** — Add to `AdminQueryRepository`:

```go
GetPairedReceipt(ctx context.Context, ledgerTxID string, excludeID string) (*domain.TransactionReceipt, error)
```

Queries `transaction_receipts` by `ledger_transaction_id`, excluding the current
receipt ID, to find the paired half of a conversion.

**`internal/services/admin/transaction_service.go`**:

1. `AdminTransactionView` — extends `TransactionReceipt` with optional
   `ConvertedCurrency` and `ConvertedAmountCents` fields. When listing
   transactions, `convert_out` receipts are enriched with the paired
   `convert_in` data so the UI can display them as a single row.

2. `ConversionView` — merges a `convert_out`/`convert_in` pair into a single
   view with `FromCurrency`, `ToCurrency`, `FromAmountCents`, `ToAmountCents`.

3. `GetConversion(ctx, id)` — given either receipt ID, finds its pair and
   returns a unified `ConversionView`.

**`GET /admin/v1/transactions/{id}/conversion`** — New endpoint returning the
merged conversion view.

### Frontend Changes (`neo-ui` repo)

**All TYPE_LABELS maps** (in transactions list, detail, and customer detail):

```typescript
convert_out: "FX Conversion",
convert_in: "FX Conversion (In)",
```

**RECEIPT_TYPES array** — Add `"convert_out"` and `"convert_in"` so they appear
in the type filter dropdown.

**`AdminTransaction` type** — Add optional fields:

```typescript
convertedCurrency?: string;
convertedAmountCents?: number;
```

**Transaction list Amount column** — When `convertedCurrency` is present, display:

```
Br500.00 → $10.00
```

And in the Currency column: `ETB → USD`.

**`useAdminConversion(id)` hook** — Calls `GET /transactions/{id}/conversion`.

**`AdminConversionView` type** — New interface for the merged conversion response.

### Tests

**Backend** (`transaction_service_test.go`):
- `TestGetConversion_FromConvertOut` — seed a conversion pair, look up from the
  `convert_out` ID, verify `FromCurrency`/`ToCurrency`/amounts
- `TestGetConversion_FromConvertIn` — same but look up from `convert_in` ID
- `TestGetConversion_NonConvertReceipt` — returns `ErrInvalidInput`
- `TestList_EnrichesConvertOut` — list with type filter, verify `ConvertedCurrency`
  and `ConvertedAmountCents` are populated

**Frontend** (`transactions.test.tsx`):
- Conversion row renders "FX Conversion" label and "ETB → USD" notation
- Filter dropdown includes "FX Conversion" option

**Frontend** (`customer-detail.test.tsx`):
- Conversion transaction in recent transactions shows "FX Conversion" label

**Frontend** (`use-admin-transactions.test.ts`):
- `useAdminConversion` calls `GET /transactions/{id}/conversion`

### Investigation: Why Conversions Were Not Visible

**Root cause**: Three compounding issues prevented FX conversions from displaying:

1. **Customer-facing `getReceiptDisplay` had no conversion cases.** Both
   `src/app/(dashboard)/transactions/page.tsx` and
   `src/components/dashboard/RecentTransactions.tsx` had a `switch` on `tx.type`
   with no `convert_out` or `convert_in` cases. They fell through to the
   `default` case which rendered `tx.narration ?? "Transaction"` with generic
   gray styling, making conversions look like unknown transactions.

2. **Two rows per conversion.** Each FX conversion produced both a `convert_out`
   (debit) and `convert_in` (credit) row. Users expected a single entry.

3. **Admin `List` did not suppress `convert_in`.** The backend enriched
   `convert_out` with paired data but still returned both halves.

**Fix applied:**

- **Backend**: `List()` now skips `convert_in` receipts when a paired
  `convert_out` exists. Pagination total is adjusted accordingly.
- **Customer UI**: Added explicit `convert_out` / `convert_in` cases to both
  `getReceiptDisplay` functions with blue `ArrowLeftRight` icon and narration
  label. Filtered `convert_in` from displayed lists so each conversion shows
  once via its `convert_out` row.
- **Tests**: Backend `TestList_HidesConvertIn` verifies suppression.
  `RecentTransactions.test.tsx` verifies label rendering, `convert_in`
  filtering, and blue icon styling.

### Fix: Conversion Receipts Missing in Per-Currency Views

**Problem**: The initial `convert_in` blanket filter (`tx.type === "convert_in"
return false`) broke per-currency balance pages. When viewing the USD balance,
the `convert_in` receipt (currency=USD) was the only record of the conversion
and got filtered out, making conversions invisible on currency-specific views.

**Fix applied**:

- **Narration-based deduplication**: Instead of blanket-removing all `convert_in`,
  build a set of narrations from `convert_out` receipts in the current result set.
  Only hide `convert_in` when its narration matches a `convert_out` in the same
  list. When viewing a currency-filtered list where only `convert_in` exists
  (no matching `convert_out`), it is preserved and displayed.
- **Balance detail page styling**: `TransactionRow` in `balances/[code]/page.tsx`
  now detects `convert_out`/`convert_in` types and renders with blue
  `ArrowLeftRight` icon and "Currency conversion" label instead of generic
  credit/debit styling.
- **Test**: Added `shows convert_in when no matching convert_out exists` to
  verify `convert_in` is preserved when it appears alone.

---

## 6. Wallet Service — Aggregate Transactions for Personal Banking

### Problem

The `WalletHandler` was the only personal handler that talked directly to
repositories and the ledger client instead of going through a service layer.
This meant:

1. **No conversion deduplication** — the raw DB query returned both
   `convert_out` and `convert_in` rows with no merging.
2. **No enrichment** — `convert_out` was not annotated with the paired
   `convertedCurrency`/`convertedAmountCents`.
3. **No aggregation** — `GetBalance` and `GetSummary` each independently
   fetched user, balances, and rates with no shared logic.

### Fix

Created `internal/services/wallet/service.go` with three methods:

- **`GetBalance(ctx, userID, currencyCode)`** — looks up user, resolves
  currency, calls ledger, returns a `BalanceView` struct.
- **`GetSummary(ctx, userID)`** — lists active currency balances, fetches
  multi-currency balances from Formance, fetches FX rates, returns
  `money.AccountSummary`.
- **`ListTransactions(ctx, userID, currency, limit, offset)`** — fetches
  receipts from DB, then performs **in-memory deduplication**: indexes
  `convert_out` by `ledgerTransactionId`, skips `convert_in` when a paired
  `convert_out` exists in the same result set, and enriches `convert_out`
  with `ConvertedCurrency`/`ConvertedAmountCents`. When `convert_in` appears
  alone (e.g., currency-filtered view), it is preserved.

Refactored `WalletHandler` to delegate entirely to `wallet.Service`.
Updated `NewHandlers` signature, `deps.go` wiring, and all handler tests.

Also fixed the `receipt_type` enum migration to include `convert_out` and
`convert_in` values that were missing from `000003_transaction_receipts.up.sql`.

### Files Changed

| File | Action |
|------|--------|
| `internal/services/wallet/service.go` | New |
| `internal/services/wallet/service_test.go` | New (8 integration tests) |
| `internal/transport/http/handlers/personal/wallets.go` | Refactored |
| `internal/transport/http/handlers/personal/handlers.go` | Updated signature |
| `cmd/api/deps.go` | Wired `walletSvc` |
| `migrations/000003_transaction_receipts.up.sql` | Added enum values |
| Handler test files | Updated `NewHandlers` calls |

---

## Acceptance Criteria

1. Dashboard shows "Total Transactions" with correct count from backend
2. Dashboard shows "Open Flags" count from backend
3. Flags page has "Create Flag" button that opens a form dialog
4. Flags page has "Resolve" action on unresolved flags
5. Both flag operations show success/error toasts
6. Transaction list shows human-readable type labels
7. Transaction list shows counterparty name or formatted phone
8. Transaction detail links userId to customer detail
9. Customer detail shows all currency balances
10. Customer detail shows credit profile, pots, KYC verifications
11. FX conversions display as a single row with "Br500.00 -> $10.00" notation
12. FX conversion types appear in filter dropdown and type labels
13. Conversion detail endpoint returns merged from/to view
14. `convert_in` rows deduplicated (hidden only when paired `convert_out` exists)
15. Per-currency balance pages show `convert_in` when no `convert_out` is present
16. Balance detail page renders conversions with blue icon and styling
17. Customer-facing UI shows conversions with blue icon and narration label
18. All new features have comprehensive tests
19. `npx vitest run` passes with zero failures
20. `npx tsc --noEmit` passes with zero errors
21. `WalletHandler` has zero direct repository or ledger imports
22. `GET /v1/wallets/transactions` returns deduplicated conversions
23. `wallet.Service` integration tests pass with real Postgres
24. `go build ./...` and `go test ./internal/services/wallet/...` pass
