import type {
  SupportedCurrency,
  KYCLevel,
  ReceiptType,
  ReceiptStatus,
  LoanStatus,
  CardType,
  CardStatus,
} from "./types";

// --- Staff ---

export type StaffRole =
  | "super_admin"
  | "customer_support"
  | "customer_support_lead"
  | "compliance_officer"
  | "lending_officer"
  | "reconciliation_analyst"
  | "card_operations"
  | "treasury"
  | "auditor";

export interface AdminStaff {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  department: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  super_admin: [
    "users:read",
    "users:freeze",
    "users:kyc_override",
    "transactions:read",
    "transactions:reverse",
    "transactions:export",
    "loans:read",
    "loans:write_off",
    "loans:credit_override",
    "cards:read",
    "cards:manage",
    "recon:read",
    "recon:manage",
    "audit:read",
    "analytics:read",
    "staff:manage",
    "system:accounts",
    "flags:manage",
    "config:manage",
  ],
  customer_support: [
    "users:read",
    "transactions:read",
    "cards:read",
    "loans:read",
    "audit:read",
  ],
  customer_support_lead: [
    "users:read",
    "users:freeze",
    "transactions:read",
    "transactions:reverse",
    "cards:read",
    "loans:read",
    "audit:read",
  ],
  compliance_officer: [
    "users:read",
    "users:freeze",
    "transactions:read",
    "transactions:export",
    "loans:read",
    "cards:read",
    "recon:read",
    "audit:read",
    "analytics:read",
    "flags:manage",
  ],
  lending_officer: [
    "users:read",
    "loans:read",
    "loans:write_off",
    "loans:credit_override",
    "audit:read",
  ],
  reconciliation_analyst: [
    "transactions:read",
    "recon:read",
    "recon:manage",
    "audit:read",
  ],
  card_operations: ["users:read", "cards:read", "cards:manage", "audit:read"],
  treasury: [
    "transactions:read",
    "analytics:read",
    "system:accounts",
    "audit:read",
    "recon:read",
  ],
  auditor: [
    "users:read",
    "transactions:read",
    "loans:read",
    "cards:read",
    "recon:read",
    "audit:read",
    "analytics:read",
    "system:accounts",
  ],
};

// --- Pagination ---

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// --- Filters ---

export interface CustomerFilter {
  search?: string;
  kycLevel?: KYCLevel;
  isFrozen?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface TransactionFilter {
  search?: string;
  userId?: string;
  type?: ReceiptType;
  status?: ReceiptStatus;
  currency?: SupportedCurrency;
  minAmountCents?: number;
  maxAmountCents?: number;
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface LoanFilter {
  search?: string;
  userId?: string;
  status?: LoanStatus;
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CardFilter {
  search?: string;
  userId?: string;
  type?: CardType;
  status?: CardStatus;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CardAuthFilter {
  limit?: number;
  offset?: number;
}

export interface AuditFilter {
  search?: string;
  action?: string;
  actorType?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ExceptionFilter {
  status?: string;
  errorType?: string;
  assignedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
}

export interface FlagFilter {
  severity?: string;
  flagType?: string;
  isResolved?: boolean;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface StaffFilter {
  role?: StaffRole;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// --- Auth ---

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  staff: AdminStaff;
}

export interface AdminChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminCreateStaffRequest {
  email: string;
  fullName: string;
  role: StaffRole;
  department: string;
  password: string;
}

export interface AdminUpdateStaffRequest {
  role?: StaffRole;
  department?: string;
  fullName?: string;
}

// --- Customer Profile ---

export interface AdminCustomerProfile {
  user: {
    id: string;
    phoneNumber: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    kycLevel: KYCLevel;
    isFrozen: boolean;
    frozenReason?: string;
    ledgerWalletId: string;
    createdAt: string;
  };
  kycVerifications: Array<{
    id: string;
    faydaFin: string;
    status: string;
    verifiedAt?: string;
  }>;
  currencyBalances: Array<{
    currencyCode: SupportedCurrency;
    isPrimary: boolean;
    balanceCents: number;
    display: string;
    accountDetails?: {
      iban: string;
      accountNumber: string;
      bankName: string;
      swiftCode: string;
    };
  }>;
  totalInETBCents: number;
  totalDisplay: string;
  pots: Array<{
    id: string;
    name: string;
    currencyCode: SupportedCurrency;
    emoji?: string;
    balanceCents: number;
    targetCents?: number;
    progressPercent?: number;
  }>;
  creditProfile?: {
    trustScore: number;
    approvedLimitCents: number;
    currentOutstandingCents: number;
    isNbeBlacklisted: boolean;
  };
  activeLoans: number;
  activeCards: number;
  recentTransactions: AdminTransaction[];
  flags: AdminFlag[];
  internalNotes: AdminAuditEntry[];
}

// --- Domain Types ---

export interface AdminTransaction {
  id: string;
  userId: string;
  type: ReceiptType;
  status: ReceiptStatus;
  amountCents: number;
  currency: SupportedCurrency;
  counterpartyName?: string;
  counterpartyPhone?: string;
  narration?: string;
  convertedCurrency?: string;
  convertedAmountCents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConversionView {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmountCents: number;
  toAmountCents: number;
  status: ReceiptStatus;
  narration?: string;
  ledgerTransactionId: string;
  createdAt: string;
}

export interface AdminLoan {
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

export interface AdminLoanInstallment {
  installmentNumber: number;
  amountDueCents: number;
  amountPaidCents: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
}

export interface AdminLoanDetail extends AdminLoan {
  installments: AdminLoanInstallment[];
  remainingCents: number;
}

export interface AdminLoanBookSummary {
  totalLoansIssued: number;
  totalDisbursedCents: number;
  totalOutstandingCents: number;
  totalRepaidCents: number;
  portfolioAtRiskPercent: number;
  byStatus: Record<
    string,
    {
      count: number;
      outstandingCents?: number;
      totalRepaidCents?: number;
      writtenOffCents?: number;
    }
  >;
  avgTrustScore: number;
  avgLoanSizeCents: number;
  repaymentRatePercent: number;
  asOf: string;
}

export interface AdminCreditProfile {
  userId: string;
  trustScore: number;
  approvedLimitCents: number;
  avgMonthlyInflowCents: number;
  avgMonthlyBalanceCents: number;
  activeDaysPerMonth: number;
  totalLoansRepaid: number;
  latePaymentsCount: number;
  currentOutstandingCents: number;
  isNbeBlacklisted: boolean;
  lastCalculatedAt: string;
}

export interface AdminCard {
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

export interface AdminCardAuthorization {
  id: string;
  cardId: string;
  retrievalReferenceNumber: string;
  stan: string;
  authCode: string;
  merchantName: string;
  merchantId: string;
  merchantCategoryCode: string;
  terminalId: string;
  acquiringInstitution: string;
  authAmountCents: number;
  settlementAmountCents?: number;
  currency: string;
  status: string;
  declineReason?: string;
  responseCode: string;
  authorizedAt: string;
  settledAt?: string;
  reversedAt?: string;
  createdAt: string;
}

export interface AdminReconRun {
  id: string;
  runDate: string;
  clearingFileName: string;
  totalRecords: number;
  matchedCount: number;
  exceptionCount: number;
  status: string;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  createdAt: string;
}

export interface AdminReconException {
  id: string;
  ethSwitchReference: string;
  idempotencyKey: string;
  errorType: string;
  ethSwitchAmountCents?: number;
  ledgerAmountCents?: number;
  postgresAmountCents?: number;
  differenceCents?: number;
  status: string;
  assignedTo?: string;
  resolutionNotes?: string;
  resolutionAction?: string;
  reconRunDate: string;
  clearingFileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  actorType: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  regulatoryRuleKey?: string;
  regulatoryAction?: string;
  nbeReference?: string;
  createdAt: string;
}

export interface AdminFlag {
  id: string;
  userId: string;
  flagType: string;
  severity: "info" | "warning" | "critical";
  description: string;
  createdBy?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSystemConfig {
  key: string;
  value: unknown;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminAnalyticsOverview {
  totalCustomers: number;
  activeCustomers30d: number;
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  kycBreakdown: Record<string, number>;
  frozenAccounts: number;
  totalTransactions: number;
  totalTransactionsToday: number;
  totalTransactionVolumeToday: Record<
    string,
    { count: number; volumeCents: number }
  >;
  activeLoans: number;
  totalLoanOutstandingCents: number;
  activeCards: number;
  openFlags: number;
  cardAuthorizationsToday?: Record<string, number>;
  currencyBalanceAdoption?: Record<string, number>;
  activePots?: number;
  totalPotBalanceCents?: number;
  conversionsToday?: { count: number; totalFromCents: number };
  pendingReconExceptions: number;
  asOf: string;
}

export interface MoneyFlowPoint {
  lat: number;
  lon: number;
  amountCents: number;
  currency: string;
  type: string;
  createdAt: string;
  transactionId: string;
  city?: string;
  country?: string;
}

export interface MoneyFlowCoord {
  lat: number;
  lon: number;
}

export interface MoneyFlowFlow {
  from: MoneyFlowCoord;
  to: MoneyFlowCoord;
  amountCents: number;
  currency: string;
  transactionId?: string;
}

export interface MoneyFlowMapResponse {
  points: MoneyFlowPoint[];
  flows: MoneyFlowFlow[];
}

export interface AdminFXRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  midRate: number;
  bidRate: number;
  askRate: number;
  spreadPercent: number;
  source: string;
  fetchedAt: string;
}

export interface AdminFeeSchedule {
  id: string;
  name: string;
  feeType: string;
  amountCents?: number;
  percentBps?: number;
  minCents?: number;
  maxCents?: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRemittanceProvider {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  supportedCurrencies: string[];
}

export interface AdminRegulatoryRule {
  id: string;
  key: string;
  scope: string;
  valueType: string;
  value: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminComplianceReport {
  generatedAt: string;
  rules: AdminRegulatoryRule[];
  violations: Array<{ ruleKey: string; count: number }>;
}

// --- Mutation Requests ---

export interface FreezeRequest {
  reason: string;
}

export interface KYCOverrideRequest {
  kycLevel: KYCLevel;
  reason: string;
}

export interface AddNoteRequest {
  note: string;
}

export interface ReverseTransactionRequest {
  reason: string;
  referenceTicket: string;
}

export interface WriteOffLoanRequest {
  reason: string;
  referenceTicket: string;
}

export interface CreditOverrideRequest {
  trustScore?: number; // 1-1000, optional; for testing
  approvedLimitCents: number;
  reason: string;
  expiresAt?: string;
}

export interface UpdateCardLimitsRequest {
  dailyLimitCents?: number;
  monthlyLimitCents?: number;
  perTxnLimitCents?: number;
}

export interface CreateFlagRequest {
  userId: string;
  flagType: string;
  severity: "info" | "warning" | "critical";
  description: string;
}

export interface ResolveFlagRequest {
  resolutionNote: string;
}

export interface AssignExceptionRequest {
  assignedTo: string;
}

export interface InvestigateExceptionRequest {
  notes?: string;
}

export interface ResolveExceptionRequest {
  resolutionNotes: string;
  resolutionAction: string;
}

export interface EscalateExceptionRequest {
  notes: string;
}

export interface UpdateConfigRequest {
  entries: Array<{ key: string; value: unknown }>;
}

export interface OverrideFXRateRequest {
  fromCurrency: string;
  toCurrency: string;
  midRate: number;
  spreadPercent: number;
}

export interface CreateFeeScheduleRequest {
  name: string;
  feeType: string;
  amountCents?: number;
  percentBps?: number;
  minCents?: number;
  maxCents?: number;
  currency: string;
}

export interface UpdateFeeScheduleRequest {
  name?: string;
  amountCents?: number;
  percentBps?: number;
  minCents?: number;
  maxCents?: number;
}

export interface UpdateProviderRequest {
  isActive?: boolean;
  supportedCurrencies?: string[];
}

export interface CreateRuleRequest {
  key: string;
  scope: string;
  valueType: string;
  value: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateRuleRequest {
  value?: string;
  description?: string;
  effectiveTo?: string;
}

// --- Business Admin ---

export interface AdminBusiness {
  id: string;
  ownerUserId: string;
  name: string;
  tradeName: string;
  taxId: string;
  registrationNumber: string;
  industryCategory: string;
  status: string;
  kybLevel: number;
  market: string;
  isFrozen: boolean;
  frozenReason?: string;
  relationshipManagerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFilter {
  search?: string;
  status?: string;
  kybLevel?: number;
  isFrozen?: boolean;
  market?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateBusinessStatusRequest {
  status: string;
  reason: string;
}

export interface AssignRMRequest {
  relationshipManagerId: string;
}

export interface RelationshipManager {
  id: string;
  fullName: string;
  businessCount: number;
}

// --- KYB Admin ---

export interface AdminKYBSubmission {
  id: string;
  businessId: string;
  status: string;
  documents: AdminKYBDocument[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AdminKYBDocument {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  reviewNotes?: string;
}

export interface KYBReviewRequest {
  decision: string;
  notes: string;
}

// --- Currency Admin ---

export interface AdminCurrency {
  code: string;
  name: string;
  symbol: string;
  countryCode: string;
  decimalPlaces: number;
  supportsAccountDetails: boolean;
  isActive: boolean;
  displayOrder: number;
}

// --- System Accounts ---

export interface SystemAccount {
  name: string;
  balanceCents: number;
  currency: string;
}

export interface TopUpRequest {
  account: string;
  amountCents: number;
  currency: string;
  reason: string;
}

// --- Card Simulator (dev/staging) ---

export interface SimulateAuthorizeRequest {
  cardId: string;
  merchantName: string;
  merchantCategoryCode: string;
  amountCents: number;
  currency: string;
}

export interface SimulateSettleRequest {
  authorizationId: string;
  amountCents?: number;
}

export interface SimulateReverseRequest {
  authorizationId: string;
  amountCents?: number;
}

// --- Customer Deposit ---

export interface AdminDepositRequest {
  amountCents: number;
  currency: string;
  narration: string;
}
