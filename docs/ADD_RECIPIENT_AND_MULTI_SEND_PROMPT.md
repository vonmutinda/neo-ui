# Neo — Add Recipient & Multi-Recipient Send

> Prompt for an AI agent to implement two features across the Go backend
> (`neo`) and the Next.js frontend (`neo-ui`):
>
> 1. **Manually adding a recipient** — new backend endpoint + UI form
> 2. **Sending to multiple recipients** — new batch transfer endpoint + multi-send UI flow

---

## Codebase Conventions

### Backend (Go)

| Concern | Convention |
|---------|-----------|
| Router | chi v5, routes registered in `cmd/api/routes.go` under the `/v1` group |
| Handlers | One struct per domain in `internal/transport/http/handlers/personal/`, methods are `func (h *XHandler) Method(w, r)` |
| Services | Business logic in `internal/services/<domain>/service.go`, injected into handlers |
| Repository | Interface in `internal/repository/`, Postgres implementation via `pgx/v5` |
| Domain | Structs and enums in `internal/domain/`, JSON tags match frontend types |
| Validation | `validate` struct tags + manual `Validate()` methods in form structs |
| Errors | Domain sentinel errors (`domain.ErrInvalidInput`, `domain.ErrUserNotFound`, etc.), mapped to HTTP status by `httputil.HandleError` |
| Auth | JWT middleware on `/v1/*`, user ID via `middleware.UserIDFromContext(r.Context())` |
| Idempotency | Global middleware sets `Idempotency-Key` header for mutating requests |
| Audit | `audit.Log()` after state-changing operations |
| Tests | Table-driven tests with `testcontainers` for Postgres, test suites via `testify/suite` |

### Frontend (Next.js)

| Concern | Convention |
|---------|-----------|
| Pages | `"use client"` client components in `src/app/(group)/` route groups |
| Hooks | One file per domain in `src/hooks/`, wrapping `useQuery`/`useMutation` from `@tanstack/react-query` v5 |
| API calls | Via `api.get<T>()` / `api.post<T>()` from `@/lib/api-client` — never raw `fetch` |
| Types | Exported from `@/lib/types.ts`, field names match backend JSON exactly |
| Validation | Pure functions in `@/lib/validation.ts` returning `string \| null` |
| Formatting | Helpers in `@/lib/format.ts` (`formatMoney`, `currencySymbol`) |
| State | Zustand stores in `src/lib/` or `src/providers/` |
| Styling | Tailwind v4 + shadcn/ui (New York). `cn()` from `@/lib/utils`. `rounded-2xl` for cards, `h-14` for primary buttons/inputs. |
| Colors | Semantic tokens: `bg-muted`, `bg-primary/10`, `bg-success/10`, `bg-destructive/10`. Dark mode: `dark:bg-card dark:border dark:border-border`. |
| Animations | Framer Motion. `initial={{ opacity: 0, y: 10 }}` / `animate={{ opacity: 1, y: 0 }}`. Bottom sheets: spring `damping: 25, stiffness: 300`. |
| Loading | `<Skeleton>` components matching final layout |
| Errors | Toast via `sonner` for mutations. Inline error states with retry for queries. |
| Icons | `lucide-react` only |
| Tests | Vitest + React Testing Library. Mock hooks via `vi.mock()`. Wrap in `QueryClientProvider`. |

---

## Feature 1: Add Recipient Manually

### Current State

Recipients are auto-created after successful transfers via `SaveFromTransfer`
in `internal/services/recipient/service.go`. There is no `POST /v1/recipients`
endpoint. The UI at `src/app/(dashboard)/recipients/page.tsx` has no "Add
Recipient" button on the Recipients tab (only the Beneficiaries tab has an
"Add" button).

### Backend Changes

#### 1.1 New endpoint: `POST /v1/recipients`

Register in `cmd/api/routes.go` alongside the existing recipient routes:

```go
// Recipients
r.Post("/recipients", h.Personal.Recipients.Create)   // <-- NEW
r.Get("/recipients", h.Personal.Recipients.List)
r.Get("/recipients/search/bank", h.Personal.Recipients.SearchByBank)
// ... existing routes unchanged
```

#### 1.2 Request shape

Define in `internal/transport/http/handlers/personal/recipients.go`:

```go
type createRecipientRequest struct {
    Type            domain.RecipientType `json:"type" validate:"required,oneof=neo_user bank_account"`
    // Neo user fields (required when type = neo_user)
    Identifier      string               `json:"identifier"`      // phone (E.164) or username
    // Bank account fields (required when type = bank_account)
    InstitutionCode string               `json:"institutionCode"`
    AccountNumber   string               `json:"accountNumber"`
    // Optional
    DisplayName     string               `json:"displayName"`     // override auto-resolved name
}
```

Validation rules:

- `type` is required, must be `"neo_user"` or `"bank_account"`
- When `type = "neo_user"`: `identifier` is required (phone E.164 or username 3-30 chars)
- When `type = "bank_account"`: `institutionCode` is required, `accountNumber` is required (min 4 chars)
- `displayName` is optional; if empty, auto-resolve from user profile (neo) or bank name + masked account (bank)

#### 1.3 Handler: `Create`

Add to `RecipientHandler` in `internal/transport/http/handlers/personal/recipients.go`:

```go
func (h *RecipientHandler) Create(w http.ResponseWriter, r *http.Request) {
    userID := middleware.UserIDFromContext(r.Context())
    var req createRecipientRequest
    if err := httputil.DecodeJSON(r, &req); err != nil {
        httputil.HandleError(w, r, err)
        return
    }
    // Validate
    // Call service
    rec, err := h.svc.Create(r.Context(), userID, recipient.CreateRequest{
        Type:            req.Type,
        Identifier:      req.Identifier,
        InstitutionCode: req.InstitutionCode,
        AccountNumber:   req.AccountNumber,
        DisplayName:     req.DisplayName,
    })
    if err != nil {
        httputil.HandleError(w, r, err)
        return
    }
    httputil.WriteJSON(w, http.StatusCreated, rec)
}
```

#### 1.4 Service: `Create` method

Add to `internal/services/recipient/service.go`:

```go
type CreateRequest struct {
    Type            domain.RecipientType
    Identifier      string // phone or username (for neo_user)
    InstitutionCode string // for bank_account
    AccountNumber   string // for bank_account
    DisplayName     string // optional override
}

func (s *Service) Create(ctx context.Context, ownerUserID string, req CreateRequest) (*domain.Recipient, error) {
    // 1. Validate based on type
    // 2. For neo_user:
    //    a. Resolve user by phone/username via s.users.ResolveByIdentifier()
    //    b. Prevent adding self as recipient
    //    c. Build Recipient with NeoUserID, CountryCode, Number, Username
    //    d. DisplayName = resolved user's FullName() if not provided
    // 3. For bank_account:
    //    a. Validate institution via domain.LookupBank(req.InstitutionCode)
    //    b. Build Recipient with InstitutionCode, BankName, SwiftBIC, AccountNumber, masked
    //    c. DisplayName = "BankName ****XXXX" if not provided
    // 4. Call s.recipients.Upsert(ctx, &recipient)
    //    - Existing upsert handles unique constraints (returns existing if duplicate)
    // 5. Audit log
    // 6. Return the created/upserted recipient
}
```

Key behaviors:

- Reuses the existing `Upsert` method which handles `ON CONFLICT` — if the
  recipient already exists (same owner + neo_user_id, or same owner +
  institution + account), it updates `display_name` and `updated_at` and
  returns the existing record
- Prevents adding yourself as a recipient (`ownerUserID == resolvedUser.ID`)
- Returns `domain.ErrUnknownInstitution` for invalid bank codes
- Returns `domain.ErrUserNotFound` if the neo user identifier doesn't resolve

#### 1.5 Response

Returns the full `domain.Recipient` JSON (same shape as `GET /v1/recipients/{id}`):

```json
{
  "id": "uuid",
  "ownerUserId": "uuid",
  "type": "neo_user",
  "displayName": "Abebe Bikila",
  "neoUserId": "uuid",
  "countryCode": "251",
  "number": "911223344",
  "username": "abebe",
  "isBeneficiary": false,
  "isFavorite": false,
  "transferCount": 0,
  "status": "active",
  "createdAt": "2026-02-25T00:00:00Z",
  "updatedAt": "2026-02-25T00:00:00Z"
}
```

HTTP 201 on new creation, HTTP 200 if upserted (already existed).

#### 1.6 Backend tests

Add to `internal/services/recipient/service_test.go`:

- `TestCreate_NeoUser_Success` — resolves user, creates recipient
- `TestCreate_NeoUser_SelfRecipient` — returns error when adding self
- `TestCreate_NeoUser_NotFound` — returns error for unknown identifier
- `TestCreate_NeoUser_Duplicate` — upserts, returns existing
- `TestCreate_BankAccount_Success` — creates with bank metadata
- `TestCreate_BankAccount_UnknownBank` — returns error for invalid institution
- `TestCreate_BankAccount_Duplicate` — upserts, returns existing
- `TestCreate_InvalidType` — returns validation error

### Frontend Changes

#### 1.7 Types (`src/lib/types.ts`)

Add:

```typescript
export interface CreateRecipientRequest {
  type: RecipientType;
  identifier?: string;       // phone or username (for neo_user)
  institutionCode?: string;  // for bank_account
  accountNumber?: string;    // for bank_account
  displayName?: string;      // optional override
}
```

#### 1.8 Hook (`src/hooks/use-recipients.ts`)

Add to existing file:

```typescript
export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation<Recipient, Error, CreateRecipientRequest>({
    mutationFn: (req) => api.post<Recipient>("/v1/recipients", req),
    onSuccess: () => {
      toast.success("Recipient added");
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Failed to add recipient", { description: err.message });
    },
  });
}
```

#### 1.9 UI: Add Recipient button + bottom sheet

Modify `src/app/(dashboard)/recipients/page.tsx`:

- Add an "Add" button in the header when the Recipients tab is active
  (matching the existing pattern for the Beneficiaries tab)
- Create an `AddRecipientSheet` component with:

**Two-mode selector** (matching the institution selector pattern from
`src/app/(dashboard)/send/page.tsx`):

- "Neo User" and "Bank Account" as two pill buttons at the top

**Neo User mode:**

- Phone/username input field
- "Lookup" button that calls `useResolveRecipient`
- On success: show resolved user card (name, phone, username) with green
  border, matching the resolve result pattern in the send page
- Optional display name override input
- "Add Recipient" submit button

**Bank Account mode:**

- Bank selector dropdown populated from `useBanks()` — show bank name +
  institution code
- Account number input (min 4 chars)
- Optional display name override input
- "Add Recipient" submit button

**Shared behavior:**

- Submit calls `useCreateRecipient`
- On success: close sheet, recipient appears in list
- On error: toast with error message
- Disable submit until form is valid
- Loading spinner on submit button while pending

#### 1.10 Frontend tests

Add to `src/hooks/__tests__/use-recipients.test.ts`:

- `useCreateRecipient` — calls `POST /v1/recipients` with correct body and
  idempotency key

Add to `src/app/(dashboard)/recipients/__tests__/recipients.test.tsx`:

- Shows "Add" button on Recipients tab
- Opens add recipient sheet on click

---

## Feature 2: Send to Multiple Recipients

### Current State

The send flow is a 3-step process (`/send` -> `/send/amount` -> `/send/confirm`)
tracking a single recipient in the Zustand store at `src/lib/send-store.ts`.
The backend has `POST /v1/transfers/inbound` for single P2P transfers.

Business accounts have a batch payment system
(`internal/transport/http/handlers/business/batch_payments.go`) with a
draft/approve/process workflow, but personal accounts have no equivalent.

### Design Principles

**All-or-nothing atomicity.** Formance supports atomic multi-posting
transactions via Numscript (see `convert_currency.numscript` and
`collect_repayment.numscript` which each contain multiple `send` statements
executed as one atomic ledger transaction). The batch transfer uses a dynamic
Numscript template with N `send` statements — all debits succeed together or
the entire batch rolls back. No partial success.

**Single receipt for the sender.** A batch send appears as one entry in the
sender's transaction history (type `batch_send`), with a `metadata` JSONB
field containing the per-recipient breakdown. Each recipient still gets their
own `p2p_receive` receipt as usual.

**P2P-only.** All recipients must be Neo users. Bank transfers via EthSwitch
require external network round-trips per item and are excluded. The UI
enforces this by hiding the institution selector in multi-send mode.

### Backend Changes

#### 2.1 Migration: `batch_send` receipt type + `metadata` column

Create a new migration (e.g. `000019_batch_send.up.sql`):

```sql
-- Add batch_send to the receipt_type enum
ALTER TYPE receipt_type ADD VALUE IF NOT EXISTS 'batch_send';

-- Add metadata JSONB column for extensible receipt details
ALTER TABLE transaction_receipts
    ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN transaction_receipts.metadata IS
    'Extensible JSONB for structured receipt details. '
    'For batch_send: { "recipients": [{ "name", "phone", "amountCents", "userId" }] }';
```

Down migration:

```sql
ALTER TABLE transaction_receipts DROP COLUMN IF EXISTS metadata;
-- Note: Postgres does not support removing enum values.
-- The batch_send value remains but is harmless if unused.
```

#### 2.2 Domain model updates

**`internal/domain/transaction.go`** — add the new receipt type and metadata
field:

```go
const ReceiptBatchSend ReceiptType = "batch_send"
```

Add `Metadata` field to `TransactionReceipt`:

```go
type TransactionReceipt struct {
    // ... existing fields ...
    Metadata  *json.RawMessage `json:"metadata,omitempty"` // JSONB for batch details etc.
}
```

Define the metadata shape for batch sends:

```go
type BatchSendMetadata struct {
    Recipients []BatchSendRecipient `json:"recipients"`
}

type BatchSendRecipient struct {
    Name        string `json:"name"`
    Phone       string `json:"phone"`
    UserID      string `json:"userId"`
    AmountCents int64  `json:"amountCents"`
    Narration   string `json:"narration"`
}
```

#### 2.3 Repository updates

**`internal/repository/transactions.go`** — update `Create`, scan functions,
and column lists to include the `metadata` column.

#### 2.4 New endpoint: `POST /v1/transfers/batch`

Register in `cmd/api/routes.go`:

```go
// Transfers
r.Post("/transfers/outbound", h.Personal.Transfers.Outbound)
r.Post("/transfers/inbound", h.Personal.Transfers.Inbound)
r.Post("/transfers/batch", h.Personal.Transfers.Batch)  // <-- NEW
```

#### 2.5 Request shape

Define in `internal/services/payments/forms.go`:

```go
type BatchTransferItem struct {
    Recipient   string `json:"recipient" validate:"required"` // phone or username
    AmountCents int64  `json:"amountCents" validate:"required,gt=0"`
    Narration   string `json:"narration" validate:"required"`
}

type BatchTransferRequest struct {
    Currency string              `json:"currency" validate:"required,currency"`
    Items    []BatchTransferItem `json:"items" validate:"required,min=2,max=10"`
}

func (r *BatchTransferRequest) Validate() error {
    if err := validate.Struct(r); err != nil {
        return err
    }
    if len(r.Items) < 2 {
        return fmt.Errorf("at least 2 recipients required: %w", domain.ErrInvalidInput)
    }
    if len(r.Items) > 10 {
        return fmt.Errorf("maximum 10 recipients per batch: %w", domain.ErrInvalidInput)
    }
    seen := make(map[string]bool)
    for i, item := range r.Items {
        if item.Recipient == "" {
            return fmt.Errorf("item %d: recipient is required: %w", i, domain.ErrInvalidInput)
        }
        if seen[item.Recipient] {
            return fmt.Errorf("item %d: duplicate recipient: %w", i, domain.ErrInvalidInput)
        }
        seen[item.Recipient] = true
        if err := money.ValidateAmountCents(item.AmountCents); err != nil {
            return fmt.Errorf("item %d: %w", i, err)
        }
    }
    return nil
}

func (r *BatchTransferRequest) TotalCents() int64 {
    var total int64
    for _, item := range r.Items {
        total += item.AmountCents
    }
    return total
}
```

#### 2.6 Response shape

On success, the batch transfer returns the sender's receipt:

```go
type BatchTransferResponse struct {
    Status         string `json:"status"`          // "completed"
    ReceiptID      string `json:"receiptId"`       // sender's batch_send receipt ID
    RecipientCount int    `json:"recipientCount"`
    TotalCents     int64  `json:"totalCents"`
    Currency       string `json:"currency"`
}
```

Example response:

```json
{
  "status": "completed",
  "receiptId": "a1b2c3d4-...",
  "recipientCount": 3,
  "totalCents": 300000,
  "currency": "ETB"
}
```

On validation failure (bad recipient, frozen user, self-transfer, etc.), the
entire request is rejected with an error before any ledger operation:

```json
{ "error": "item 2: recipient not found", "status": 400 }
```

On insufficient funds:

```json
{ "error": "insufficient funds", "status": 422 }
```

#### 2.7 Numscript template: `batch_send.numscript`

Create `internal/ledger/numscript/batch_send.numscript` — a Go template that
generates N `send` statements for atomic execution:

```
vars {
    account $source
{{- range $i, $r := .Recipients }}
    monetary $amount_{{ $i }}
    account $dest_{{ $i }}
{{- end }}
}

{{ range $i, $r := .Recipients -}}
send $amount_{{ $i }} (
    source = $source
    destination = $dest_{{ $i }}
)
{{ end }}
```

This template is rendered at runtime with the resolved recipient wallet
accounts and amounts. All `send` statements execute as a single atomic
Formance transaction — if any debit fails (e.g. insufficient funds partway
through), the entire transaction rolls back.

#### 2.8 Ledger client: `BatchSend` method

Add to the `Client` interface in `internal/ledger/client.go`:

```go
type BatchRecipient struct {
    WalletID    string
    AmountCents int64
}

BatchSend(ctx context.Context, ik string, senderWalletID string,
    recipients []BatchRecipient, asset string) (string, error)
```

Implementation in `internal/ledger/formance.go`:

1. Render `batch_send.numscript` template with the recipients list
2. Build `vars` map: `$source` = sender wallet account, `$amount_N` and
   `$dest_N` for each recipient
3. Call `createTransaction()` with the rendered script
4. Return the Formance transaction ID

#### 2.9 Service: `ProcessBatchTransfer` method

Add to `internal/services/payments/service.go`:

```go
func (s *Service) ProcessBatchTransfer(
    ctx context.Context,
    senderID string,
    req *BatchTransferRequest,
) (*BatchTransferResponse, error) {
    // 1. Validate request
    if err := req.Validate(); err != nil {
        return nil, err
    }

    // 2. Check sender exists and not frozen
    sender, err := s.users.GetByID(ctx, senderID)
    if err != nil { return nil, err }
    if sender.IsFrozen { return nil, domain.ErrUserFrozen }

    // 3. Resolve ALL recipients upfront
    //    For each item, resolve by phone/username to a User object.
    //    Reject the entire batch if any recipient:
    //      - does not exist
    //      - is frozen
    //      - is the sender (self-transfer)
    type resolvedItem struct {
        user      *domain.User
        item      BatchTransferItem
    }
    var resolved []resolvedItem
    for i, item := range req.Items {
        user, err := s.resolveRecipientByIdentifier(ctx, item.Recipient)
        if err != nil {
            return nil, fmt.Errorf("item %d: recipient not found: %w", i, domain.ErrUserNotFound)
        }
        if user.IsFrozen {
            return nil, fmt.Errorf("item %d: recipient is frozen: %w", i, domain.ErrUserFrozen)
        }
        if user.ID == senderID {
            return nil, fmt.Errorf("item %d: cannot send to yourself: %w", i, domain.ErrInvalidInput)
        }
        resolved = append(resolved, resolvedItem{user: user, item: item})
    }

    // 4. Pre-flight balance check
    totalCents := req.TotalCents()
    asset := money.FormatAsset(req.Currency)
    balance, err := s.ledger.GetWalletBalance(ctx, sender.LedgerWalletID, asset)
    if err != nil { return nil, err }
    if balance.Int64() < totalCents {
        return nil, domain.ErrInsufficientFunds
    }

    // 5. Build ledger recipients and execute atomic batch send
    idempotencyKey := uuid.NewString()
    var ledgerRecipients []ledger.BatchRecipient
    for _, r := range resolved {
        ledgerRecipients = append(ledgerRecipients, ledger.BatchRecipient{
            WalletID:    r.user.LedgerWalletID,
            AmountCents: r.item.AmountCents,
        })
    }
    txID, err := s.ledger.BatchSend(ctx, idempotencyKey,
        sender.LedgerWalletID, ledgerRecipients, asset)
    if err != nil {
        return nil, fmt.Errorf("batch ledger transfer: %w", err)
    }

    // 6. Create sender's batch_send receipt with metadata
    metaRecipients := make([]domain.BatchSendRecipient, len(resolved))
    for i, r := range resolved {
        metaRecipients[i] = domain.BatchSendRecipient{
            Name:        r.user.FullName(),
            Phone:       r.user.PhoneNumber,
            UserID:      r.user.ID,
            AmountCents: r.item.AmountCents,
            Narration:   r.item.Narration,
        }
    }
    metaJSON, _ := json.Marshal(domain.BatchSendMetadata{Recipients: metaRecipients})
    rawMeta := json.RawMessage(metaJSON)

    senderReceipt := &domain.TransactionReceipt{
        UserID:              senderID,
        LedgerTransactionID: txID,
        IdempotencyKey:      &idempotencyKey,
        Type:                domain.ReceiptBatchSend,
        Status:              domain.ReceiptCompleted,
        AmountCents:         totalCents,
        Currency:            req.Currency,
        Narration:           ptr(fmt.Sprintf("Sent to %d recipients", len(resolved))),
        Metadata:            &rawMeta,
    }
    _ = s.receipts.Create(ctx, senderReceipt)

    // 7. Create p2p_receive receipt for each recipient
    for _, r := range resolved {
        senderPhone := sender.PhoneNumber
        _ = s.receipts.Create(ctx, &domain.TransactionReceipt{
            UserID:              r.user.ID,
            LedgerTransactionID: txID + "-in-" + r.user.ID,
            IdempotencyKey:      &idempotencyKey,
            Type:                domain.ReceiptP2PReceive,
            Status:              domain.ReceiptCompleted,
            AmountCents:         r.item.AmountCents,
            Currency:            req.Currency,
            CounterpartyPhone:   &senderPhone,
            Narration:           &r.item.Narration,
        })
    }

    // 8. Audit log
    _ = s.audit.Log(ctx, &domain.AuditEntry{
        Action:       domain.AuditBatchTransfer,
        ActorType:    "user",
        ActorID:      &senderID,
        ResourceType: "batch_transfer",
        ResourceID:   txID,
    })

    // 9. Auto-save recipients (fire-and-forget)
    for _, r := range resolved {
        var username string
        if r.user.Username != nil { username = *r.user.Username }
        s.recipients.SaveFromTransferFireAndForget(ctx, senderID,
            recipientsvc.TransferCounterparty{
                Type:        domain.RecipientNeoUser,
                DisplayName: r.user.FullName(),
                NeoUserID:   r.user.ID,
                CountryCode: r.user.PhoneNumber.CountryCode,
                Number:      r.user.PhoneNumber.Number,
                Username:    username,
            }, req.Currency)
    }

    return &BatchTransferResponse{
        Status:         "completed",
        ReceiptID:      senderReceipt.ID,
        RecipientCount: len(resolved),
        TotalCents:     totalCents,
        Currency:       req.Currency,
    }, nil
}
```

Key behaviors:

- **All-or-nothing**: all recipients are resolved and validated before any
  ledger operation. If any recipient is invalid, frozen, or is the sender,
  the entire batch is rejected upfront.
- **Atomic ledger transaction**: the Numscript template generates N `send`
  statements executed as one Formance transaction. If the sender's balance
  is insufficient partway through, Formance rolls back all postings.
- **Single sender receipt**: one `batch_send` receipt with `metadata.recipients`
  containing the per-recipient breakdown (name, phone, amount, narration).
- **Per-recipient receive receipts**: each recipient gets their own standard
  `p2p_receive` receipt so their transaction history is unaffected.
- **Auto-save recipients**: each successful recipient is saved via the
  existing fire-and-forget mechanism.

#### 2.10 Handler: `Batch`

Add to `internal/transport/http/handlers/personal/transfers.go`:

```go
func (h *TransferHandler) Batch(w http.ResponseWriter, r *http.Request) {
    userID := middleware.UserIDFromContext(r.Context())
    var req payments.BatchTransferRequest
    if err := httputil.DecodeJSON(r, &req); err != nil {
        httputil.HandleError(w, r, err)
        return
    }
    if req.Currency == "" {
        req.Currency = money.CurrencyETB
    }
    result, err := h.svc.ProcessBatchTransfer(r.Context(), userID, &req)
    if err != nil {
        httputil.HandleError(w, r, err)
        return
    }
    httputil.WriteJSON(w, http.StatusOK, result)
}
```

#### 2.11 Audit action constant

Add to `internal/domain/audit.go`:

```go
const AuditBatchTransfer = "batch_transfer"
```

#### 2.12 Backend tests

Add to `internal/services/payments/service_test.go`:

- `TestBatchTransfer_Success` — all items succeed, single receipt created with metadata
- `TestBatchTransfer_InvalidRecipient` — one bad recipient rejects entire batch
- `TestBatchTransfer_FrozenRecipient` — frozen recipient rejects entire batch
- `TestBatchTransfer_SelfTransfer` — self in items rejects entire batch
- `TestBatchTransfer_InsufficientFunds` — pre-flight check rejects
- `TestBatchTransfer_FrozenSender` — returns error
- `TestBatchTransfer_DuplicateRecipient` — validation rejects
- `TestBatchTransfer_TooManyItems` — validation rejects > 10
- `TestBatchTransfer_TooFewItems` — validation rejects < 2
- `TestBatchTransfer_ReceiptsCreated` — verify 1 batch_send + N p2p_receive receipts

### Frontend Changes

#### 2.13 Types (`src/lib/types.ts`)

Add:

```typescript
export interface BatchTransferItem {
  recipient: string;
  amountCents: number;
  narration: string;
}

export interface BatchTransferRequest {
  currency: SupportedCurrency;
  items: BatchTransferItem[];
}

export interface BatchTransferResponse {
  status: string;
  receiptId: string;
  recipientCount: number;
  totalCents: number;
  currency: SupportedCurrency;
}

export interface BatchSendRecipient {
  name: string;
  phone: string;
  userId: string;
  amountCents: number;
  narration: string;
}

export interface BatchSendMetadata {
  recipients: BatchSendRecipient[];
}
```

Update `TransactionReceipt` to include metadata:

```typescript
export interface TransactionReceipt {
  // ... existing fields ...
  metadata?: Record<string, unknown>;
}
```

Add `"batch_send"` to the `ReceiptType` union.

#### 2.14 Hook (`src/hooks/use-transfers.ts`)

Add to existing file:

```typescript
export function useBatchTransfer() {
  const qc = useQueryClient();
  return useMutation<BatchTransferResponse, Error, BatchTransferRequest>({
    mutationFn: (req) =>
      api.post<BatchTransferResponse>("/v1/transfers/batch", req),
    onSuccess: (result) => {
      toast.success("Batch transfer sent", {
        description: `Sent to ${result.recipientCount} recipients`,
      });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Batch transfer failed", { description: err.message });
    },
  });
}
```

#### 2.15 Send store (`src/lib/send-store.ts`)

Extend the existing store to support multi-recipient mode:

```typescript
interface ResolvedRecipient {
  phone: string;
  name: string;
  id: string;
  amountCents: number;
  narration: string;
}

interface SendState {
  // ... existing single-recipient fields unchanged ...

  // Multi-send fields
  isMultiSend: boolean;
  recipients: ResolvedRecipient[];

  // New methods
  setMultiSend: (on: boolean) => void;
  addRecipient: (r: Omit<ResolvedRecipient, "amountCents" | "narration">) => void;
  removeRecipient: (phone: string) => void;
  setRecipientAmount: (phone: string, cents: number) => void;
  setRecipientNarration: (phone: string, narration: string) => void;
  setBulkAmount: (cents: number) => void;
  setBulkNarration: (narration: string) => void;
  // Updated reset clears multi-send fields too
}
```

Initial multi-send state:

```typescript
isMultiSend: false,
recipients: [],
```

#### 2.16 UI: Multi-send flow

The multi-send flow reuses the existing 3-step structure but adapts each page.

**Step 1: Recipient selection (`src/app/(dashboard)/send/page.tsx`)**

**Recents row (both single and multi mode):**

Add a horizontal scrollable row of recent recipients above the manual input,
sourced from `useRecipients({ limit: 8 })` sorted by `lastUsedAt`. Each
item is a tappable circle (avatar initial + name below). Tapping a recent
recipient in single mode auto-fills the identifier and resolves them. In
multi mode, tapping adds them to the recipients list. This eliminates typing
for repeat payments (inspired by Monzo and Revolut).

**"Send to Multiple" toggle:**

Add a toggle below the header to switch between single and multi mode:

- Toggle between single and multi mode
- In multi mode:
  - Hide the institution selector (batch is Neo-only)
  - Show the phone/username input with "Lookup" + "Add" flow
  - Each resolved recipient appears as a removable chip/card below the input
  - Chip shows: avatar initial, name, phone, X button to remove
  - Minimum 2 recipients required to continue
  - Maximum 10 recipients
  - Counter: "3 of 10 recipients"
  - "Continue" button enabled when >= 2 recipients added

**Step 2: Amount entry (`src/app/(dashboard)/send/amount/page.tsx`)**

In multi mode:

- Two sub-modes via a segmented control (default: "Split total"):
  - **Split total** (default, inspired by Monzo Split): user enters the
    total amount (e.g. Br 3,000 for dinner) and a shared narration. The app
    divides equally across N recipients (e.g. Br 1,000 each for 3 people).
    Each recipient's share is shown below the input. Users can tap an
    individual share to override it — the remaining shares auto-adjust to
    keep the total constant.
    Summary line: "Br 3,000.00 split across 3 people"
  - **Custom amounts**: list of recipients, each with its own amount input
    and narration. Show running total at the bottom.
- Validate: each amount > 0, total <= wallet balance
- "Continue" navigates to confirm

**Step 3: Confirm & execute (`src/app/(dashboard)/send/confirm/page.tsx`)**

In multi mode:

- Summary card showing:
  - Number of recipients
  - Total amount
  - Currency
- Recipient list: each row shows name, phone, individual amount
- `SlideToConfirm` component (reuse existing)
- Calls `useBatchTransfer` on confirm
- Result screen:
  - Green success with "Sent to N recipients" message
  - Total amount displayed
  - "Done" button returns to home
  - On error: red error screen with the specific error message (e.g.
    "Recipient 'xyz' not found" or "Insufficient funds")

**Transaction history: batch_send receipt detail**

When a `batch_send` receipt is tapped in the transaction list:

- Show the total amount and "Sent to N recipients" as the title
- Parse `metadata.recipients` and render a list of individual recipients:
  - Each row: avatar initial, name, phone, individual amount
- Show the date and transaction ID as usual

**Pre-population from recipients page:**

Modify `src/app/(dashboard)/recipients/page.tsx`:

- Add a "Select" mode toggle on the Recipients tab
- In select mode: checkboxes on each recipient row (neo_user only, bank
  accounts are dimmed/disabled)
- "Send to Selected (N)" floating action button at the bottom
- On tap: populate the send store with selected recipients, navigate to
  `/send` in multi mode

#### 2.17 Frontend tests

Add to `src/hooks/__tests__/use-transfers.test.ts` (create file):

- `useBatchTransfer` — calls `POST /v1/transfers/batch` with correct body
- Verify idempotency key is set

Add to `src/app/(dashboard)/send/__tests__/send.test.tsx` (create file):

- Renders multi-send toggle
- Adding recipients shows chips
- Cannot continue with < 2 recipients
- Confirm page shows recipient list with amounts

---

## Files to Create

### Backend (`neo`)

| File | Purpose |
|------|---------|
| `migrations/000019_batch_send.up.sql` | Add `batch_send` enum value + `metadata` JSONB column |
| `migrations/000019_batch_send.down.sql` | Drop `metadata` column |
| `internal/ledger/numscript/batch_send.numscript` | Dynamic Numscript template for atomic multi-send |

### Frontend (`neo-ui`)

| File | Purpose |
|------|---------|
| `src/hooks/__tests__/use-transfers.test.ts` | Tests for `useBatchTransfer` hook |
| `src/app/(dashboard)/send/__tests__/send.test.tsx` | Tests for multi-send UI |

## Files to Modify

### Backend (`neo`)

| File | Change |
|------|--------|
| `cmd/api/routes.go` | Add `POST /v1/recipients` and `POST /v1/transfers/batch` routes |
| `internal/transport/http/handlers/personal/recipients.go` | Add `Create` handler with `createRecipientRequest` |
| `internal/services/recipient/service.go` | Add `Create` method and `CreateRequest` type |
| `internal/domain/transaction.go` | Add `ReceiptBatchSend` type, `Metadata` field, `BatchSendMetadata` struct |
| `internal/repository/transactions.go` | Update Create/scan for `metadata` column |
| `internal/ledger/client.go` | Add `BatchSend` to `Client` interface, `BatchRecipient` struct |
| `internal/ledger/formance.go` | Implement `BatchSend` using `batch_send.numscript` template |
| `internal/services/payments/forms.go` | Add `BatchTransferRequest`, `BatchTransferItem`, `BatchTransferResponse` |
| `internal/services/payments/service.go` | Add `ProcessBatchTransfer` method |
| `internal/transport/http/handlers/personal/transfers.go` | Add `Batch` handler |
| `internal/domain/audit.go` | Add `AuditBatchTransfer` constant |

### Frontend (`neo-ui`)

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `CreateRecipientRequest`, `BatchTransfer*` types, `metadata` on `TransactionReceipt`, `batch_send` in `ReceiptType` |
| `src/hooks/use-recipients.ts` | Add `useCreateRecipient` hook |
| `src/hooks/use-transfers.ts` | Add `useBatchTransfer` hook |
| `src/lib/send-store.ts` | Add multi-send state and methods |
| `src/app/(dashboard)/send/page.tsx` | Add multi-send toggle, multi-recipient input |
| `src/app/(dashboard)/send/amount/page.tsx` | Add same-amount / custom-amount modes |
| `src/app/(dashboard)/send/confirm/page.tsx` | Add batch confirm + result screen |
| `src/app/(dashboard)/recipients/page.tsx` | Add "Add Recipient" button + sheet, select mode for multi-send |
| Transaction detail component | Render `batch_send` metadata as recipient list |

---

## Verification Checklist

### Add Recipient

1. Navigate to `/recipients` — "Add" button visible on Recipients tab
2. Tap "Add" — bottom sheet opens with Neo User / Bank Account toggle
3. Neo User mode: enter phone, tap Lookup, see resolved user, tap "Add Recipient"
4. Recipient appears in list immediately
5. Adding same recipient again — upserts without error
6. Adding yourself — shows error toast
7. Bank Account mode: select bank, enter account number, tap "Add Recipient"
8. Bank recipient appears with bank name and masked account
9. Invalid bank code — shows error toast
10. All new recipients have `transferCount: 0` and `isFavorite: false`

### Multi-Recipient Send

11. Navigate to `/send` — "Send to Multiple" toggle visible
12. Toggle on — institution selector hidden, input shows "Phone or username"
13. Resolve + add 3 recipients — chips appear below input
14. Remove one — chip removed, counter updates
15. Try to continue with 1 recipient — button disabled
16. Continue with 2+ — navigates to amount page
17. Amount page: "Same amount" mode — enter amount, see total calculation
18. Switch to "Custom amounts" — per-recipient inputs appear
19. Continue — confirm page shows recipient list with amounts
20. Slide to confirm — batch executes atomically
21. Success — green screen with "Sent to N recipients" and total amount
22. Bad recipient in batch — entire batch rejected with clear error message
23. Insufficient funds — error toast, no money moved
24. Transaction history — batch_send appears as single entry
25. Tap batch_send receipt — detail shows list of individual recipients with amounts
26. Each recipient's transaction history — shows individual `p2p_receive` entry
27. From `/recipients` — select mode, pick 3 neo users, tap "Send to Selected"
28. Navigates to `/send` in multi mode with recipients pre-populated
