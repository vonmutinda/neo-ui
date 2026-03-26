// Domain enums -- 1:1 match with the Go backend

export type SupportedCurrency =
  | "ETB"
  | "USD"
  | "EUR"
  | "GBP"
  | "AED"
  | "SAR"
  | "CNY"
  | "KES";

export type KYCLevel = 1 | 2 | 3;

export type ReceiptType =
  | "p2p_send"
  | "p2p_receive"
  | "ethswitch_out"
  | "ethswitch_in"
  | "card_purchase"
  | "card_atm"
  | "loan_disbursement"
  | "loan_repayment"
  | "fee"
  | "convert_out"
  | "convert_in"
  | "batch_send"
  | "pot_deposit"
  | "pot_withdraw"
  | "bill_payment"
  | "business_transfer_out"
  | "business_transfer_in";

export type ReceiptStatus = "pending" | "completed" | "failed" | "reversed";

export type LoanStatus =
  | "active"
  | "in_arrears"
  | "defaulted"
  | "repaid"
  | "written_off";

export type CardType = "physical" | "virtual" | "ephemeral";

export type CardStatus =
  | "active"
  | "frozen"
  | "cancelled"
  | "expired"
  | "pending_activation";

// --- Phone number value type (matches backend pkg/phone) ---

export interface PhoneNumber {
  countryCode: string;
  number: string;
}

// --- Auth request/response types ---

export interface RegisterRequest {
  phoneNumber: PhoneNumber;
  username: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  phoneNumber: PhoneNumber;
  username?: string;
  firstName?: string;
  lastName?: string;
  kycLevel: number;
}

// --- Transfer request types ---

export interface KYCOTPRequest {
  faydaId: string;
}

export interface KYCVerifyRequest {
  faydaId: string;
  otp: string;
}

export interface OutboundTransferRequest {
  amountCents: number;
  currency: SupportedCurrency;
  destPhone: string;
  destInstitution: string;
  narration: string;
}

export interface InboundTransferRequest {
  recipient: string;
  amountCents: number;
  currency: SupportedCurrency;
  narration: string;
}

export interface RecipientInfo {
  id: string;
  phoneNumber: string | PhoneNumber;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoanApplyRequest {
  principalCents: number;
  durationDays: number;
}

// --- Card types (field names match backend JSON) ---

export interface Card {
  id: string;
  userId: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  type: CardType;
  status: CardStatus;
  allowOnline: boolean;
  allowContactless: boolean;
  allowAtm: boolean;
  allowInternational: boolean;
  dailyLimitCents: number;
  monthlyLimitCents: number;
  perTxnLimitCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardStatusUpdate {
  status: CardStatus;
}

export interface CardLimitsUpdate {
  dailyLimitCents?: number;
  monthlyLimitCents?: number;
  perTxnLimitCents?: number;
}

export interface CardTogglesUpdate {
  allowOnline?: boolean;
  allowContactless?: boolean;
  allowAtm?: boolean;
  allowInternational?: boolean;
}

export interface CreateCardRequest {
  type: CardType;
  allowOnline?: boolean;
  allowContactless?: boolean;
  allowAtm?: boolean;
  allowInternational?: boolean;
  dailyLimitCents?: number;
  monthlyLimitCents?: number;
  perTxnLimitCents?: number;
}

// --- Response types ---

export interface User {
  id: string;
  phoneNumber: PhoneNumber;
  username?: string;
  faydaIdNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  kycLevel: KYCLevel;
  isFrozen: boolean;
  ledgerWalletId: string;
  email?: string;
  language?: string;
  faydaPhotoUrl?: string;
  market?: string;
  mfaEnabled?: boolean;
  gender?: string;
  dateOfBirth?: string;
  accountType?: string;
  spendWaterfallOrder?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KYCResponse {
  status: string;
  kycLevel?: KYCLevel;
}

export interface CurrencyBalance {
  currency: SupportedCurrency;
  symbol: string;
  name: string;
  balanceCents: number;
  display: string;
}

export interface WalletBalance {
  walletId: string;
  currency: SupportedCurrency;
  symbol: string;
  balanceCents: number;
  display: string;
}

export interface WalletSummary {
  walletId: string;
  primaryCurrency: SupportedCurrency;
  balances: CurrencyBalance[];
  totalInPrimaryCents: number;
  totalDisplay: string;
}

// --- Transaction receipt (matches backend TransactionReceipt) ---

export interface TransactionReceipt {
  id: string;
  type: ReceiptType;
  status: ReceiptStatus;
  amountCents: number;
  currency: SupportedCurrency;
  counterpartyName?: string;
  counterpartyPhone?: string;
  counterpartyInstitution?: string;
  narration?: string;
  purpose?: string;
  feeCents: number;
  feeBreakdown?: Record<string, number>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Legacy transaction type from Formance ledger (still used by /v1/wallets/transactions)
export interface Transaction {
  id: string;
  source: string;
  destination: string;
  amountCents: number;
  asset: string;
  isCredit: boolean;
  metadata: Record<string, string>;
  timestamp?: string;
}

export interface TransferResponse {
  status: string;
}

// --- Loans ---

export interface LoanEligibility {
  isEligible: boolean;
  trustScore: number;
  approvedLimitCents: number;
  approvedLimitDisplay: string;
  outstandingCents: number;
  outstandingDisplay: string;
  availableCents: number;
  availableDisplay: string;
  isNbeBlacklisted: boolean;
  totalLoansRepaid: number;
  latePaymentsCount: number;
  facilitationFeePct: string;
  reason?: string;
}

export interface Loan {
  id: string;
  userId: string;
  principalAmountCents: number;
  interestFeeCents: number;
  totalDueCents: number;
  totalPaidCents: number;
  durationDays: number;
  disbursedAt: string;
  dueDate: string;
  status: LoanStatus;
  daysPastDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanSummary extends Loan {
  remainingCents: number;
  remainingDisplay: string;
  progressPct: number;
}

export interface LoanStats {
  totalBorrowedCents: number;
  totalBorrowedDisplay: string;
  totalRepaidCents: number;
  totalRepaidDisplay: string;
  activeLoansCount: number;
  completedLoansCount: number;
}

export interface LoanHistoryPage {
  loans: LoanSummary[];
  totalCount: number;
  limit: number;
  offset: number;
  stats: LoanStats;
}

export interface LoanInstallment {
  installmentNumber: number;
  amountDueCents: number;
  amountPaidCents: number;
  isPaid: boolean;
  dueDate: string;
  paidAt?: string;
}

export interface LoanDetail extends LoanSummary {
  installments: LoanInstallment[];
}

// --- Overdraft ---

export type OverdraftStatus = "inactive" | "active" | "used" | "suspended";

export interface Overdraft {
  id: string;
  userId: string;
  limitCents: number;
  usedCents: number;
  availableCents: number;
  dailyFeeBasisPoints: number;
  interestFreeDays: number;
  accruedFeeCents: number;
  status: OverdraftStatus;
  overdrawnSince?: string | null;
  lastFeeAccrualAt?: string | null;
  optedInAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OverdraftStatusResponse extends Overdraft {
  feeSummary: string;
}

export interface OverdraftRepayRequest {
  amountCents: number;
}

// --- Currency Balance Detail ---

export interface AccountDetails {
  id: string;
  currencyBalanceId: string;
  iban: string;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
  routingNumber?: string;
  sortCode?: string;
  createdAt: string;
}

export interface CurrencyBalanceDetail {
  id: string;
  userId: string;
  currencyCode: SupportedCurrency;
  isPrimary: boolean;
  createdAt: string;
  accountDetails?: AccountDetails | null;
  balanceCents: number;
  display: string;
}

// --- Pots ---

export interface Pot {
  id: string;
  userId: string;
  name: string;
  currencyCode: SupportedCurrency;
  targetCents?: number | null;
  emoji?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  balanceCents: number;
  display: string;
  progressPercent?: number;
}

export interface CreatePotRequest {
  name: string;
  currencyCode: SupportedCurrency;
  targetCents?: number;
  emoji?: string;
}

export interface PotTransferRequest {
  amountCents: number;
}

export interface UpdatePotRequest {
  name?: string;
  targetCents?: number;
  emoji?: string;
}

export interface CreateBalanceRequest {
  currencyCode: SupportedCurrency;
}

export interface ArchivePotResponse {
  archived: boolean;
  fundsReturned: boolean;
  amountReturnedCents: number;
  currency: string;
  display: string;
}

// --- Convert ---

export interface ConvertRequest {
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  amountCents: number;
}

export interface ConvertResponse {
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  fromAmountCents: number;
  toAmountCents: number;
  rate: number;
  transactionId: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  mid: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: string;
  source: string;
}

// --- Recipients ---

export type RecipientType = "enviar_user" | "bank_account";
export type RecipientStatus = "active" | "archived";

export interface Recipient {
  id: string;
  ownerUserId: string;
  type: RecipientType;
  displayName: string;
  enviarUserId?: string;
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

// --- Beneficiaries ---

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

// --- Payment Requests ---

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
  payerPhone: PhoneNumber;
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

// --- Credit Score ---

export interface CreditScore {
  trustScore: number;
  maxScore: number;
  cashFlowPoints: number;
  stabilityPoints: number;
  penaltyPoints: number;
  basePoints: number;
  tips: string[];
}

export interface LoanRepayRequest {
  amountCents: number;
}

// --- Batch Transfers ---

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

// --- Batch Payment Requests ---

export interface BatchPaymentRequestBody {
  totalAmountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
  recipients: string[];
  customAmounts?: Record<string, number>;
}

export interface BatchPaymentRequestResponse {
  requests: PaymentRequest[];
  totalAmountCents: number;
  recipientCount: number;
}

// --- Credit Score History ---

export interface CreditScoreHistoryEntry {
  month: string;
  score: number;
}

export interface CreditScoreHistory {
  history: CreditScoreHistoryEntry[];
}

// --- Create Recipient ---

export interface CreateRecipientRequest {
  type: RecipientType;
  identifier?: string;
  institutionCode?: string;
  accountNumber?: string;
  displayName?: string;
}

// --- Scheduled Transfers ---

export type ScheduledFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type ScheduledTransferStatus =
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export interface ScheduledTransfer {
  id: string;
  userId: string;
  transferType: string;
  recipient: string;
  destInstitution?: string;
  amountCents: number;
  currency: SupportedCurrency;
  narration: string;
  purpose?: string;
  frequency: ScheduledFrequency;
  nextRunAt: string;
  lastRunAt?: string;
  status: ScheduledTransferStatus;
  runCount: number;
  maxRuns?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledTransferRequest {
  transferType: string;
  recipient: string;
  destInstitution?: string;
  amountCents: number;
  currency: SupportedCurrency;
  frequency: ScheduledFrequency;
  narration: string;
  purpose?: string;
  maxRuns?: number;
}

// --- Bill Payments ---

export type BillerCategory =
  | "electricity"
  | "water"
  | "telecom"
  | "internet"
  | "tv"
  | "government"
  | "other";

export interface Biller {
  id: string;
  code: string;
  name: string;
  category: BillerCategory;
  minAmountCents: number;
  maxAmountCents: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillPaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "reversed";

export interface BillPayment {
  id: string;
  userId: string;
  billerId: string;
  accountNumber: string;
  amountCents: number;
  currency: SupportedCurrency;
  feeCents: number;
  status: BillPaymentStatus;
  receiptId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  billerName?: string;
  billerCode?: string;
}

export interface PayBillRequest {
  billerCode: string;
  accountNumber: string;
  amountCents: number;
  currency: SupportedCurrency;
}

// --- Statements ---

export type StatementFormat = "pdf" | "csv";
export type StatementStatus =
  | "queued"
  | "generating"
  | "ready"
  | "failed"
  | "expired";
export type StatementType = "on_demand" | "monthly" | "daily";
export type StatementVariant = "personal" | "standard" | "accounting";

export interface Statement {
  id: string;
  userId?: string;
  businessId?: string;
  type: StatementType;
  format: StatementFormat;
  variant: StatementVariant;
  currency: SupportedCurrency;
  dateFrom: string;
  dateTo: string;
  status: StatementStatus;
  storageKey?: string;
  downloadUrl?: string;
  downloadExpiry?: string;
  errorMessage?: string;
  openingBalanceCents?: number;
  closingBalanceCents?: number;
  transactionCount: number;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestStatementBody {
  fromDate: string;
  toDate: string;
  currency: SupportedCurrency;
}

// --- Confirmation Letters ---

export type ConfirmationPurpose =
  | "visa"
  | "employment"
  | "third_party"
  | "regulatory"
  | "other";
export type ConfirmationStatus = "pending" | "ready" | "failed" | "revoked";
export type ConfirmationLanguage = "en" | "am";

export interface ConfirmationLetter {
  id: string;
  userId: string;
  businessId?: string;
  letterNumber: string;
  purpose: ConfirmationPurpose;
  language: ConfirmationLanguage;
  recipientName?: string;
  recipientInstitution?: string;
  includeBalance: boolean;
  status: ConfirmationStatus;
  storageKey?: string;
  downloadUrl?: string;
  downloadExpiry?: string;
  verificationHash: string;
  generatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Notification Preferences ---

export interface NotificationPreferences {
  transferReceived: boolean;
  transferSent: boolean;
  loanDisbursed: boolean;
  loanDueReminder: boolean;
  loginAlert: boolean;
  cardTransaction: boolean;
  paymentRequestReceived: boolean;
  billPaymentConfirmation: boolean;
}

// --- Analytics ---

export interface SpendingCategory {
  category: string;
  totalCents: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingSummary {
  totalInCents: number;
  totalOutCents: number;
  netCents: number;
  currency: SupportedCurrency;
  periodStart: string;
  periodEnd: string;
}

export interface SpendingTrend {
  month: string;
  inCents: number;
  outCents: number;
}

// --- Fee Quote ---

export interface FeeQuote {
  feeCents: number;
  currency: SupportedCurrency;
  feeType: string;
  breakdown: Record<string, number>;
}

// --- Spend Waterfall ---

export interface SpendWaterfall {
  order: SupportedCurrency[];
}

// --- Challenges (Push Pre-Auth) ---

export interface Challenge {
  id: string;
  type: string;
  status: string;
  metadata: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
}

// --- Device Registration ---

export interface Device {
  id: string;
  userId: string;
  fcmToken: string;
  platform: string;
  deviceName?: string;
  createdAt: string;
}

// --- MFA ---

export interface MFASetupResponse {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}

// --- Forgot/Reset Password ---

export interface ForgotPasswordRequest {
  phoneNumber: PhoneNumber;
}

export interface ResetPasswordRequest {
  phoneNumber: PhoneNumber;
  otp: string;
  newPassword: string;
}

// --- Change Password ---

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// --- Transaction Label ---

export interface TransactionLabel {
  label: string;
}

// --- API envelope ---

export interface ApiError {
  error: string;
  status: number;
}
