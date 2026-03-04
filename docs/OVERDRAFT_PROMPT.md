# Overdraft Feature — Full-Stack Prompt

Use this prompt to implement overdraft across the Neo stack: customer UI (Monzo-inspired), backend APIs and behaviour (including fee recovery and clear fee communication), and admin visibility of capital pools (loans, overdrafts, etc.). Follow existing codebase conventions and the existing overdraft design in `docs/COMPETITIVE_FEATURES_PROPOSAL.md`.

---

## 1. Design principles (Monzo-inspired)

- **Opt-in only.** User explicitly enables overdraft after seeing eligibility, limit, and fee terms.
- **Fees are explicit.** Before opt-in and whenever in use: state interest-free period (e.g. 7 days), then daily fee (e.g. 0.15% per day on used amount), with example amounts in ETB.
- **Recovery is automatic where possible.** Auto-repay from the next ETB inflow (P2P receive, EthSwitch inbound, loan disbursement). Allow manual repay at any time.
- **ETB only.** Overdraft applies only to ETB; other currencies are unchanged.
- **Bank can recover overdraft with fees.** Backend must support fee accrual (after interest-free days), ledger movements to/from a dedicated overdraft capital pool, and clear communication of fees to the user in API and UI.

---

## 2. Backend (neo)

### 2.1 Domain and persistence

- Add overdraft sentinel errors to `internal/domain/errors.go`: `ErrOverdraftNotEligible`, `ErrOverdraftAlreadyActive`, `ErrOverdraftNotActive`, `ErrOverdraftInUse`, `ErrOverdraftLimitExceeded`, `ErrOverdraftETBOnly`.
- Add overdraft audit actions to `internal/domain/audit.go`: `AuditOverdraftOptedIn`, `AuditOverdraftOptedOut`, `AuditOverdraftUsed`, `AuditOverdraftRepaid`, `AuditOverdraftFeeAccrued`, `AuditOverdraftSuspended`.
- Overdraft table and domain model already exist (`migrations/000018_overdraft.up.sql`, `internal/domain/overdraft.go`). Add an overdraft repository: get/create/update by user, ensure `available_cents` is derived from `limit_cents - used_cents` (DB already has generated column).

### 2.2 Ledger and capital pool

- In `internal/ledger/chart.go`, add `SystemOverdraftCapital() string` returning `{prefix}:system:overdraft_capital`.
- In `internal/ledger/client.go`, add:
  - `CreditFromOverdraft(ctx, ik, walletID, amountCents, asset string) (txID string, err error)` — move from `@system:overdraft_capital` to wallet.
  - `DebitToOverdraft(ctx, ik, walletID, amountCents, asset string) error` — move from wallet to `@system:overdraft_capital`.
- Implement these in `internal/ledger/formance.go` with a single posting each (source/destination as overdraft capital or wallet).

### 2.3 Overdraft service

- Create `internal/services/overdraft/` (or under `lending` if you prefer): eligibility, opt-in, opt-out, get status, use-cover, repay (manual), and (called from payment service) auto-repay on inflow.
- **Eligibility:** e.g. 10% of user's approved loan limit from credit profile, capped at 50,000 ETB; trust score and NBE blacklist checks as per proposal. If no credit profile or not eligible, return `ErrOverdraftNotEligible`.
- **Opt-in:** Ensure user eligible, create or update overdraft row to `active`, set `limit_cents`, `opted_in_at`; log `AuditOverdraftOptedIn`.
- **Opt-out:** Only if `used_cents == 0`; set status to `inactive`; log `AuditOverdraftOptedOut`. Else return `ErrOverdraftInUse`.
- **Use cover (internal):** When a payment would fail due to insufficient ETB balance, payment service calls overdraft service. If user has active overdraft and `available_cents >= shortfall`, then: (1) `CreditFromOverdraft` to user wallet for shortfall, (2) update overdraft `used_cents`, set `overdrawn_since` if transitioning to used; (3) proceed with debit. ETB only; otherwise return `ErrOverdraftETBOnly`.
- **Repay (manual):** Body `{ "amountCents": number }`. Debit user wallet, credit overdraft capital, reduce `used_cents` (and accrued fee as per policy). If balance fully cleared, set status back to `active` and clear `overdrawn_since`; log `AuditOverdraftRepaid`.
- **Auto-repay on inflow:** After any ETB credit to a user (inbound P2P, EthSwitch inbound, loan disbursement), if overdraft status is `used` and `used_cents + accrued_fee_cents > 0`, repay `min(creditAmountCents, used_cents + accrued_fee_cents)` from wallet to overdraft capital and update overdraft row; log `AuditOverdraftRepaid`.
- **Fee accrual:** Daily cron in `cmd/lending-worker`: for overdrafts with status `used` and past interest-free period, accrue `(used_cents * daily_fee_basis_points) / 10000` into `accrued_fee_cents`, update `last_fee_accrual_at`; log `AuditOverdraftFeeAccrued`. Ensure fees are well communicated (see 2.5).

### 2.4 Payment flow integration

- In `internal/services/payments`: for ETB debits (e.g. P2P send, outbound transfer), before calling `DebitWallet`, get wallet balance; if insufficient, call overdraft service "use cover" for the shortfall (only if currency is ETB). If cover succeeds, then perform the debit (balance is now sufficient). If not ETB or overdraft cannot cover, return insufficient funds as today.

### 2.5 Fee communication (backend)

- **GET /v1/overdraft** response must include: `limitCents`, `usedCents`, `availableCents`, `accruedFeeCents`, `dailyFeeBasisPoints`, `interestFreeDays`, `overdrawnSince`, `lastFeeAccrualAt`, `status`, and a **feeSummary** (string) suitable for UI, e.g. "No fee for the first 7 days. After that, 0.15% per day on the amount you use. Example: 1,000 ETB for 10 days (3 days after free period) ≈ 4.50 ETB."
- Optionally add a small **feeExampleCents** or structured examples in the response so the UI can show "Fees so far" and "If you repay in X days" without recalculating.

### 2.6 HTTP API

- Add personal overdraft routes under `/v1/` (authenticated):
  - `GET /v1/overdraft` — get overdraft status (and eligibility snapshot if not yet opted in).
  - `POST /v1/overdraft/opt-in` — enable overdraft (body optional or empty).
  - `POST /v1/overdraft/opt-out` — disable overdraft (only if not in use).
  - `POST /v1/overdraft/repay` — body `{ "amountCents": number }` for manual repayment.
- Wire handlers and overdraft service in `cmd/api` (deps, routes). Return 4xx with sentinel errors where appropriate.

---

## 3. Admin: capital pools and overdraft visibility

- **Capital pools:** Implement `GET /admin/system/accounts` (replace stub). Require `PermSystemAccounts`. Return a list of "capital pools" with at least:
  - **Loans:** label "Loan capital" (or "Loans"), balance from Formance `@system:loan_capital` (and/or from loan book summary total outstanding if you want book view).
  - **Overdrafts:** label "Overdraft capital", balance from Formance `@system:overdraft_capital`; optionally include overdraft book summary (total limit, total used, total available across all users).
  - Optionally: Fees, Interest (from chart) for a full treasury view.
- **Overdraft book (optional):** Add admin overdraft summary (e.g. total opted-in, total used, total limit) and, if desired, list overdrafts (by user) protected by a permission such as `PermOverdraftRead` or reusing `PermLoansRead` / `PermSystemAccounts` so only staff with sufficient permissions (e.g. Treasury, Lending, Super Admin) can see it. Document which roles can see capital pools.

---

## 4. Customer UI (neo-ui)

- **Conventions:** Follow existing patterns: `src/app/(dashboard)/` or `(loans)/`, hooks in `src/hooks/`, API via `@/lib/api-client`, types in `@/lib/types`, format with `formatMoney`, Tailwind + shadcn, Framer Motion, toasts for errors/success.
- **Overdraft types:** Add to `src/lib/types.ts`: overdraft status, limit/used/available/fees, feeSummary, interestFreeDays, dailyFeeBasisPoints, overdrawnSince, etc., matching backend JSON.
- **Hooks:** `useOverdraft()` (GET), `useOverdraftOptIn()`, `useOverdraftOptOut()`, `useOverdraftRepay()` mutations. Use existing API client and error handling.
- **Placement (Monzo-inspired):**
  - **Loans / Borrowing area:** Add an "Overdraft" section or tab: show status (inactive / active / used), limit and "available" (when active), "used" and "fees so far" when in use. CTA: "Turn on overdraft" (opt-in) or "Pay off overdraft" (manual repay) or "Turn off" (opt-out when balance 0). Show **fee communication** prominently: interest-free days, then daily fee with example; show accrued fee and optional "what you'll owe if you repay in X days."
  - **Home / account summary:** When overdraft is in use, show a compact line or banner: "You're using X ETB of your overdraft" with link to overdraft/repay.
- **Opt-in flow:** Before enabling, show eligibility (e.g. "You can get up to X ETB overdraft"), limit, and **full fee text** (no fee for first 7 days; then 0.15% per day; example). Require explicit confirm. On success, toast and refresh overdraft status.
- **Opt-out:** Only enable when `usedCents === 0`; confirm; on success refresh.
- **Manual repay:** Amount input (max = used + accrued fees), submit; show loading and success/error toast.
- **Empty / inactive state:** Short explanation of overdraft and "Turn on overdraft" if eligible.

---

## 5. Acceptance criteria (summary)

- Backend: overdraft repository and service; ledger methods and `@system:overdraft_capital`; opt-in/opt-out/get/repay APIs; payment flow uses overdraft when ETB insufficient; auto-repay on ETB inflow; daily fee accrual cron; fee summary in API.
- Admin: `GET /admin/system/accounts` returns loan and overdraft capital pools (and optionally fees/interest); staff with `PermSystemAccounts` (and any new overdraft read permission) can see pools and optionally overdraft book.
- UI: Overdraft section in loans/borrowing area; opt-in with clear fee communication; status, limit, used, fees; manual repay; opt-out when zero; home/balance hint when in use.
- Fees are well communicated in API responses and in the UI before opt-in and while in use.
