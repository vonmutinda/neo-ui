# Dev Testing Setup

> Manual steps to put the `vonmutinda` account into a state that lets you
> exercise the loans feature, foreign-currency balances, and the card creation
> flow from the UI.

---

## Prerequisites

All commands assume the local stack is running:

```bash
# From /Users/vonmutinda/code/neo
make up        # starts Postgres, Redis, Formance Ledger
make migrate   # runs all migrations
make run       # starts the API server
```

Database connection string (from `.env.local`):

```
postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable
```

Connect:

```bash
psql "postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable"
```

---

## Step 0 -- Resolve the User ID

All subsequent steps need the UUID primary key of the `vonmutinda` account.

```sql
SELECT id, username, kyc_level
FROM users
WHERE username = 'vonmutinda';
```

Save the `id` value. It is referenced as `<USER_ID>` throughout this document.

---

## 1. Enable Loans -- Update Trust Score

### Why

Loan eligibility requires `trust_score > 600` on the `credit_profiles` table
(`internal/domain/credit_profile.go`). A freshly registered account has no
credit profile row, so the eligibility check returns `isEligible: false` with
`trustScore: 0`.

### What to set

| Field | Recommended test value | Minimum to pass |
|---|---|---|
| `trust_score` | `750` | `601` |
| `approved_limit_cents` | `50000000` (500 ETB) | any `> 0` |

### SQL

```sql
INSERT INTO credit_profiles (user_id, trust_score, approved_limit_cents, last_calculated_at, created_at, updated_at)
VALUES (
    '<USER_ID>',
    750,
    50000000,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    trust_score          = EXCLUDED.trust_score,
    approved_limit_cents = EXCLUDED.approved_limit_cents,
    last_calculated_at   = NOW(),
    updated_at           = NOW();
```

### Verify

```sql
SELECT user_id, trust_score, approved_limit_cents, is_nbe_blacklisted
FROM credit_profiles
WHERE user_id = '<USER_ID>';
```

### Admin API alternative

If you prefer hitting the API (requires a super-admin token from `make seed-admin`):

```bash
curl -X POST http://localhost:8080/admin/v1/credit-profiles/<USER_ID>/override \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"approvedLimitCents": 50000000}'
```

> Note: The admin endpoint only sets `approved_limit_cents`, not `trust_score`
> directly. Use the SQL upsert above if you need a specific score value.

### Fund the wallet (so repayments can be tested)

```bash
# From /Users/vonmutinda/code/neo
make seed-funds PHONE=+251<NUMBER> AMOUNT=10000
```

Replace `<NUMBER>` with vonmutinda's phone number from the `users` table.

---

## 2. Enable Foreign Currency -- Update KYC Level

### Why

Attempting to open a USD or EUR balance returns `ErrKYCInsufficientForFX`
unless `kyc_level >= 2` (`KYCVerified`). The check lives in
`internal/services/balances/service.go`.

| Level | Constant | Allows FX | Daily limit |
|---|---|---|---|
| 1 | `KYCBasic` | No | 75,000 ETB |
| 2 | `KYCVerified` | **Yes** | 150,000 ETB |
| 3 | `KYCEnhanced` | Yes | Higher |

### SQL

```sql
UPDATE users
SET kyc_level = 2,
    updated_at = NOW()
WHERE id = '<USER_ID>';
```

### Verify

```sql
SELECT id, username, kyc_level
FROM users
WHERE id = '<USER_ID>';
```

### Admin API alternative

```bash
curl -X POST http://localhost:8080/admin/v1/customers/<USER_ID>/kyc-override \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"level": 2, "reason": "Manual override for local testing"}'
```

### After updating

From the UI, navigate to **Balances → Add currency** and open a USD or EUR
balance. The button will be enabled once `kyc_level = 2`.

---

## 3. Card Creation -- Current State and Path Forward

### Current state

The card creation flow is **not yet implemented**. Both sides are stubs:

| Layer | Status | File |
|---|---|---|
| Backend `POST /v1/cards` | Missing -- no handler | `cmd/api/routes.go` |
| Frontend "New Card" button | Disabled (`Coming soon`) | `src/app/(cards)/cards/page.tsx` |
| `useCreateCard()` hook | Stub (throws) | `src/hooks/use-cards.ts` |

The domain model, repository `Create` method, and frontend `CardVisual`
component all exist. Only the service layer, HTTP handler, and UI form are
missing.

### What exists and can be tested today

The following card operations work end-to-end for **pre-existing cards**:

- View cards list: `GET /v1/cards`
- View card detail: `GET /v1/cards/{id}`
- Freeze / unfreeze: `PATCH /v1/cards/{id}/status`
- Spending limits: `PATCH /v1/cards/{id}/limits`
- Payment channel toggles: `PATCH /v1/cards/{id}/toggles`

### Seed a card for testing the existing UI

Insert a card row directly so the UI shows something to interact with:

```sql
INSERT INTO cards (
    id,
    user_id,
    tokenized_pan,
    last_four,
    expiry_month,
    expiry_year,
    type,
    status,
    allow_online,
    allow_contactless,
    allow_atm,
    allow_international,
    daily_limit_cents,
    monthly_limit_cents,
    per_txn_limit_cents,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '<USER_ID>',
    'tok_test_vonmutinda_virtual',
    '4242',
    12,
    2027,
    'virtual',
    'active',
    true,
    true,
    false,
    false,
    500000,
    5000000,
    200000,
    NOW(),
    NOW()
);
```

### Implementing card creation (next task)

To unlock the "New Card" button properly, the following work is needed:

**Backend** (`/Users/vonmutinda/code/neo`):
1. Add `POST /v1/cards` route to `cmd/api/routes.go`
2. Implement `CreateCard` handler in
   `internal/transport/http/handlers/personal/cards.go`
3. Add `CreateCard(ctx, userID, req)` to the cards service in
   `internal/services/cards/service.go`
4. The repository `Create` method already exists in
   `internal/repository/cards.go`

Request body shape (matches existing domain model):
```json
{
  "type": "virtual",
  "dailyLimitCents": 500000,
  "monthlyLimitCents": 5000000,
  "perTxnLimitCents": 200000,
  "allowOnline": true,
  "allowContactless": true,
  "allowAtm": false,
  "allowInternational": false
}
```

**Frontend** (`/Users/vonmutinda/code/neo-ui`):
1. Remove `disabled` + "Coming soon" tooltip from the "New Card" button in
   `src/app/(cards)/cards/page.tsx`
2. Implement a card type selection sheet/modal
3. Wire it to `useCreateCard()` in `src/hooks/use-cards.ts` (currently a stub)
4. `CardVisual` already renders all card types correctly -- no changes needed there

---

## Quick Reference -- All Commands

```bash
# 0. Find user ID
psql "postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable" \
  -c "SELECT id, username, kyc_level FROM users WHERE username = 'vonmutinda';"

# 1. Set trust score (replace <USER_ID>)
psql "postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable" \
  -c "INSERT INTO credit_profiles (user_id, trust_score, approved_limit_cents, last_calculated_at, created_at, updated_at)
      VALUES ('<USER_ID>', 750, 50000000, NOW(), NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET trust_score = 750, approved_limit_cents = 50000000, updated_at = NOW();"

# 2. Set KYC level 2 (replace <USER_ID>)
psql "postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable" \
  -c "UPDATE users SET kyc_level = 2, updated_at = NOW() WHERE id = '<USER_ID>';"

# 3. Seed a virtual card (replace <USER_ID>)
psql "postgres://neobank:neobank_dev@localhost:5432/neobank?sslmode=disable" \
  -c "INSERT INTO cards (id, user_id, tokenized_pan, last_four, expiry_month, expiry_year, type, status, allow_online, allow_contactless, allow_atm, allow_international, daily_limit_cents, monthly_limit_cents, per_txn_limit_cents, created_at, updated_at)
      VALUES (gen_random_uuid(), '<USER_ID>', 'tok_test_virtual', '4242', 12, 2027, 'virtual', 'active', true, true, false, false, 500000, 5000000, 200000, NOW(), NOW());"
```
