# Neo UI -- Backend Sync & UX Improvements

> Prompt for an AI agent to update the Next.js frontend to align with recent
> backend changes (auth rework, password-based login) and fix critical UX
> issues in transaction display, currency conversion presentation, and card
> creation.

---

## Context

The Go backend has undergone significant changes:

1. **Auth rework**: Registration and login now require `username` + `password`
   (not just a phone number). The backend returns `{ accessToken, refreshToken,
   expiresAt, user }` from `/v1/auth/register` and `/v1/auth/login`. The
   access token is also set in the `Authorization` response header.

2. **Password hashing**: Switched from bcrypt to PBKDF2-SHA256 (irrelevant to
   the frontend, but the API contract changed).

3. **JWT simplification**: Tokens no longer carry issuer/audience claims. The
   frontend just stores and sends the access token as `Bearer <token>`.

4. **Transaction receipts**: The backend has a `TransactionReceipt` model with
   human-readable fields (`counterpartyName`, `counterpartyPhone`, `narration`,
   `type`, `currency`, `feeCents`), but the `/v1/wallets/transactions` endpoint
   currently returns raw Formance ledger entries with internal wallet IDs and
   `fx_pool` references.

5. **Card creation**: There is no `POST /v1/cards` endpoint in the backend.
   The UI has a "Create Virtual Card" button that does nothing.

---

## Current State of the UI

### Auth (`src/app/(auth)/login/page.tsx`)

- Only collects a phone number
- Calls `POST /v1/register` with `{ phoneNumber }` -- no username or password
- Stores `user.id` as both the token and userId (dev-mode hack)
- No login vs register distinction
- No refresh token handling

### Auth Store (`src/providers/auth-store.ts`)

- Stores `token`, `userId`, `userProfile` in sessionStorage
- `login(token, userId)` -- no refresh token
- No token refresh logic
- No `Authorization` header extraction from responses

### Types (`src/lib/types.ts`)

- `RegisterRequest` only has `phoneNumber` -- missing `username`, `password`
- No `LoginRequest` type
- No `RefreshRequest` / `TokenResponse` types
- `Transaction` type has `source`, `destination`, `asset`, `isCredit`,
  `metadata` -- these are raw Formance ledger fields, not the receipt model
- `Card` type has `tokenizedPan` -- this is an internal field that should
  never be exposed to the frontend
- `CardLimitsUpdate` field names don't match the backend JSON
  (`perTransactionLimitCents` vs `perTxnLimitCents`)
- `CardTogglesUpdate` field names don't match (`onlineEnabled` vs
  `allowOnline`)

### Transactions (`src/app/(dashboard)/transactions/page.tsx`)

- Displays raw Formance data: `source` and `destination` are internal wallet
  IDs like `wallet:abc123:main` or `neo:fx_pool`
- Currency conversions show as two separate entries (debit from one currency +
  credit to another) instead of one condensed "Converted ETB to USD" entry
- P2P receives show the sender's wallet ID instead of their name/phone
- Card purchases show `neo:transit:card_auth` instead of the merchant name
- No transaction type icons or labels

### Cards (`src/app/(cards)/cards/page.tsx`)

- "New Card" and "Create Virtual Card" buttons exist but have no `onClick`
  handler and no backend endpoint to call

---

## Changes Required

### 1. Auth Flow -- Register & Login Pages

#### New Register Page (`src/app/(auth)/register/page.tsx`)

Currently redirects to login. Replace with a proper registration form:

- **Fields**: phone number (with +251 prefix), username, password, confirm
  password
- **Validation**: phone 9 digits, username 3-30 chars, password min 8 chars,
  passwords match
- **API call**: `POST /v1/auth/register`
  ```json
  {
    "phoneNumber": { "countryCode": "251", "number": "911223344" },
    "username": "abebe",
    "password": "securepass123"
  }
  ```
- **Response**: `TokenResponse` with `accessToken`, `refreshToken`, `expiresAt`,
  `user` (id, phoneNumber, username, firstName, lastName, kycLevel)
- **On success**: store tokens via auth store, redirect to dashboard

#### Update Login Page (`src/app/(auth)/login/page.tsx`)

Replace the phone-only flow with username/phone + password login:

- **Fields**: identifier (phone or username), password
- **API call**: `POST /v1/auth/login`
  ```json
  { "identifier": "+251911223344", "password": "securepass123" }
  ```
  or
  ```json
  { "identifier": "abebe", "password": "securepass123" }
  ```
- **Response**: same `TokenResponse`
- **Link**: "Don't have an account? Register" linking to `/register`

#### Update Auth Store (`src/providers/auth-store.ts`)

- Store `accessToken` and `refreshToken` separately
- Add `refreshToken` to state and sessionStorage
- Update `login(accessToken, refreshToken, userId)` signature
- Add `setTokens(accessToken, refreshToken)` for refresh flow
- The API client should read the `Authorization` header from login/register
  responses and use it for subsequent requests

#### Update API Client (`src/lib/api-client.ts`)

- On 401 responses, attempt a token refresh using `POST /v1/auth/refresh`
  with the stored refresh token before logging out
- Extract `Authorization` header from register/login responses as a fallback
  token source

### 2. Types Alignment (`src/lib/types.ts`)

#### Add missing request/response types

```typescript
interface RegisterRequest {
  phoneNumber: PhoneNumber;
  username: string;
  password: string;
}

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

interface RefreshRequest {
  refreshToken: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

interface UserInfo {
  id: string;
  phoneNumber: PhoneNumber;
  username?: string;
  firstName?: string;
  lastName?: string;
  kycLevel: number;
}
```

#### Fix `Transaction` type

Replace the raw Formance `Transaction` type with the backend's
`TransactionReceipt` model:

```typescript
interface TransactionReceipt {
  id: string;
  type: ReceiptType;
  status: ReceiptStatus;
  amountCents: number;
  currency: SupportedCurrency;
  counterpartyName?: string;
  counterpartyPhone?: string;
  narration?: string;
  feeCents: number;
  createdAt: string;
  updatedAt: string;
}
```

This requires a backend change: the `/v1/wallets/transactions` endpoint should
return `TransactionReceipt[]` instead of raw Formance ledger entries. If the
backend hasn't been updated yet, add a TODO and use the receipt endpoint when
available.

#### Fix `Card` type

- Remove `tokenizedPan` -- this is PCI-sensitive internal data
- Fix field name mismatches:
  - `last4` -> `lastFour` (match backend JSON `lastFour`)
  - `onlineEnabled` -> `allowOnline`
  - `contactlessEnabled` -> `allowContactless`
  - `atmEnabled` -> `allowAtm`
  - `internationalEnabled` -> `allowInternational`
  - `perTransactionLimitCents` -> `perTxnLimitCents`

#### Fix `CardLimitsUpdate` and `CardTogglesUpdate`

Match the backend JSON field names:

```typescript
interface CardLimitsUpdate {
  dailyLimitCents?: number;
  monthlyLimitCents?: number;
  perTxnLimitCents?: number;
}

interface CardTogglesUpdate {
  allowOnline?: boolean;
  allowContactless?: boolean;
  allowAtm?: boolean;
  allowInternational?: boolean;
}
```

### 3. Transaction Display Improvements

#### Condense currency conversions

When the user converts ETB to USD, the backend currently produces two Formance
ledger entries. The UI should display this as a single transaction:

- **Icon**: currency exchange icon (ArrowLeftRight)
- **Title**: "Converted ETB to USD"
- **Subtitle**: "Br 5,000.00 -> $95.00"
- **Amount**: show the destination amount with a "+" prefix

Detection logic: if two consecutive transactions have the same timestamp and
one debits currency A while the other credits currency B, merge them into a
single "Conversion" entry.

Alternatively (preferred): once the backend returns `TransactionReceipt`
objects, conversions will have `type: "fx_conversion"` with both currencies in
the metadata. Display them directly.

#### Show sender info for received funds

For `p2p_receive` transactions, display:

- **Title**: counterparty name (e.g. "Abebe Bikila") or phone if name is
  unavailable
- **Subtitle**: narration or "Received money"
- **Icon**: ArrowDownLeft (incoming)

Never show wallet IDs, ledger account paths, or internal references.

#### Transaction type labels and icons

Map `ReceiptType` to user-friendly labels:

| Type | Label | Icon |
|------|-------|------|
| `p2p_send` | "Sent to {name}" | ArrowUpRight |
| `p2p_receive` | "Received from {name}" | ArrowDownLeft |
| `ethswitch_out` | "Bank transfer to {name}" | Building2 |
| `ethswitch_in` | "Bank transfer from {name}" | Building2 |
| `card_purchase` | "Card purchase" | CreditCard |
| `card_atm` | "ATM withdrawal" | Banknote |
| `loan_disbursement` | "Loan disbursed" | HandCoins |
| `loan_repayment` | "Loan repayment" | Receipt |
| `fee` | "Service fee" | CircleDollarSign |

#### Transaction detail sheet

When tapping a transaction, show:

- Full amount with currency symbol
- Transaction type label
- Counterparty name and phone (if P2P)
- Narration
- Fee breakdown (if feeCents > 0)
- Status badge (completed, pending, failed, reversed)
- Date and time
- Transaction ID (small, muted -- for support reference)

### 4. Card Creation

#### Backend gap

There is no `POST /v1/cards` endpoint. The card creation flow needs a backend
endpoint first. For now:

- **Disable** the "New Card" and "Create Virtual Card" buttons
- Show a tooltip or message: "Coming soon"
- Add a `useCreateCard` hook stub in `src/hooks/use-cards.ts` that calls
  `POST /v1/cards` when the endpoint is available

#### Card type field names

Update `src/hooks/use-cards.ts` mutations to use the correct backend field
names (see type fixes above).

### 5. User Profile Display

#### Username in header

The dashboard greeting (`GreetingHeader.tsx`) should display the username if
available:

- "Good morning, abebe" instead of "Good morning" with no name
- Fall back to first name, then phone number

#### Profile page

The profile page should show:

- Username
- Phone number
- KYC level badge
- Account type

### 6. Refresh Token Flow

Implement automatic token refresh:

1. Store `refreshToken` in sessionStorage alongside `accessToken`
2. When the API client receives a 401, before logging out:
   - Call `POST /v1/auth/refresh` with `{ refreshToken }`
   - If successful, update stored tokens and retry the original request
   - If refresh fails (expired/revoked), log out
3. Add a `POST /v1/auth/logout` call on explicit logout that sends the
   refresh token to revoke the session server-side

---

## Recommendations

1. **Transaction endpoint migration**: The highest-impact change is switching
   `/v1/wallets/transactions` from raw Formance ledger entries to
   `TransactionReceipt[]`. This is a backend change that should be prioritized.
   Until then, the UI can only do best-effort parsing of the raw data.

2. **Conversion condensing**: Even with receipts, consider adding an
   `fx_conversion` receipt type on the backend that captures both sides of the
   conversion in a single receipt. This eliminates the need for client-side
   merging logic.

3. **Card issuance**: The backend needs a `POST /v1/cards` endpoint that
   creates a virtual card (generates a tokenized PAN, sets default limits,
   creates the Formance card account). This is a backend task.

4. **Phone number format**: The backend now uses a `PhoneNumber` value type
   with `countryCode` and `number` fields (not a plain string). The UI types
   and API calls need to match this format for registration.

5. **Password strength indicator**: Consider adding a visual password strength
   meter on the register page (zxcvbn or similar) since we're moving from
   phone-only to password-based auth.

6. **Biometric auth**: For mobile web, consider adding WebAuthn/passkey support
   as an alternative to password entry on returning visits.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/(auth)/login/page.tsx` | Rewrite for username/phone + password login |
| `src/app/(auth)/register/page.tsx` | Rewrite for full registration form |
| `src/providers/auth-store.ts` | Add refresh token, update login signature |
| `src/lib/api-client.ts` | Add 401 refresh retry, header extraction |
| `src/lib/types.ts` | Fix all type mismatches (auth, card, transaction) |
| `src/app/(dashboard)/transactions/page.tsx` | Use receipt model, condense conversions |
| `src/components/dashboard/RecentTransactions.tsx` | Same transaction display fixes |
| `src/hooks/use-wallets.ts` | Update transaction type, endpoint if needed |
| `src/hooks/use-cards.ts` | Fix field names, add create card stub |
| `src/app/(cards)/cards/page.tsx` | Disable create button (no backend endpoint) |
| `src/app/(cards)/cards/[id]/page.tsx` | Fix field name references |
| `src/components/cards/CardVisual.tsx` | Remove tokenizedPan reference |
| `src/components/dashboard/GreetingHeader.tsx` | Show username |
| `src/providers/UserProfileLoader.tsx` | Map new UserInfo shape |

---

## Verification

After all changes:

1. Register a new user with phone + username + password
2. Log out, log back in with username + password
3. Verify token refresh works (wait 15min or manually expire)
4. View transactions -- no wallet IDs, fx_pool, or internal references visible
5. Convert currency -- single condensed entry in transaction list
6. Receive P2P transfer -- shows sender name, not wallet ID
7. Cards page -- create button disabled with "Coming soon"
8. Card detail -- toggles and limits save correctly with correct field names
