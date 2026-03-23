// Business domain types — 1:1 match with the Go backend

import type { PhoneNumber, SupportedCurrency } from "./types";

// --- Status enums ---

export type BusinessStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "deactivated";

export type BusinessTransferStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "executed"
  | "failed";

/** Matches `domain.ValidIndustryCategories` in the API. */
export type IndustryCategory =
  | "retail"
  | "wholesale"
  | "manufacturing"
  | "agriculture"
  | "technology"
  | "healthcare"
  | "education"
  | "construction"
  | "transport"
  | "hospitality"
  | "financial_services"
  | "import_export"
  | "professional_services"
  | "non_profit"
  | "other";

export const BUSINESS_INDUSTRY_OPTIONS: {
  value: IndustryCategory;
  label: string;
}[] = [
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "agriculture", label: "Agriculture" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "construction", label: "Construction" },
  { value: "transport", label: "Transport" },
  { value: "hospitality", label: "Hospitality" },
  { value: "financial_services", label: "Financial services" },
  { value: "import_export", label: "Import / export" },
  { value: "professional_services", label: "Professional services" },
  { value: "non_profit", label: "Non-profit" },
  { value: "other", label: "Other" },
];

/** Request body for `POST /v1/business/register`. */
export interface BusinessRegisterRequest {
  name: string;
  tradeName?: string;
  taxId: string;
  registrationNumber: string;
  industryCategory: IndustryCategory;
  industrySubCategory?: string;
  phoneNumber: PhoneNumber;
  email?: string;
  city?: string;
  subRegion?: string;
}

// --- Core entities ---

export interface Business {
  id: string;
  ownerUserId: string;
  name: string;
  tradeName?: string;
  taxId: string;
  registrationNumber: string;
  industryCategory: IndustryCategory;
  industrySubCategory?: string;
  registrationDate?: string;
  address?: string;
  city?: string;
  subRegion?: string;
  district?: string;
  market: string;
  phoneNumber: PhoneNumber;
  email?: string;
  website?: string;
  status: BusinessStatus;
  ledgerWalletId: string;
  kybLevel: number;
  relationshipManagerId?: string;
  isFrozen: boolean;
  frozenReason?: string;
  frozenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRole {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: BusinessPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  roleId: string;
  role?: BusinessRole;
  title?: string;
  invitedBy: string;
  joinedAt: string;
  isActive: boolean;
  removedAt?: string;
  removedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Wallet / Balance ---

export interface AccountDetails {
  id: string;
  currencyBalanceId: string;
  iban?: string;
  accountNumber?: string;
  bankName?: string;
  swiftCode?: string;
  routingNumber?: string;
  sortCode?: string;
  createdAt: string;
}

export interface BusinessCurrencyBalance {
  id: string;
  userId: string;
  businessId: string;
  currencyCode: SupportedCurrency;
  isPrimary: boolean;
  accountDetails?: AccountDetails;
  balanceCents: number;
  display: string;
}

export interface BusinessWalletSummary {
  businessId: string;
  businessName: string;
  balances: BusinessCurrencyBalance[];
  totalHomeCurrencyCents: number;
  totalHomeCurrencyDisplay: string;
}

// --- Transfers ---

export interface BusinessTransfer {
  id: string;
  businessId: string;
  initiatedBy: string;
  transferType: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  recipientInfo: Record<string, unknown>;
  status: BusinessTransferStatus;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  expiresAt: string;
  executedAt?: string;
  transactionId?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Pagination ---

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

// --- Permissions ---

export type BusinessPermission =
  | "biz:dashboard:view"
  | "biz:balances:view"
  | "biz:transactions:view"
  | "biz:transactions:export"
  | "biz:transactions:label"
  | "biz:transfers:initiate:internal"
  | "biz:transfers:initiate:external"
  | "biz:transfers:approve"
  | "biz:convert:initiate"
  | "biz:batch:create"
  | "biz:batch:approve"
  | "biz:batch:execute"
  | "biz:invoices:manage"
  | "biz:invoices:view"
  | "biz:documents:view"
  | "biz:documents:manage"
  | "biz:wallets:manage"
  | "biz:cards:manage"
  | "biz:cards:view"
  | "biz:loans:view"
  | "biz:loans:apply"
  | "biz:pots:manage"
  | "biz:tax_pots:manage"
  | "biz:tax_pots:withdraw"
  | "biz:imports:manage"
  | "biz:imports:view"
  | "biz:exports:manage"
  | "biz:exports:view"
  | "biz:members:manage"
  | "biz:roles:manage"
  | "biz:settings:manage";

// --- Wallet Transactions ---

export type BusinessTransactionDirection = "in" | "out" | "fx";

export interface BusinessTransaction {
  id: string;
  businessId: string;
  currencyCode: SupportedCurrency;
  amountCents: number;
  direction: BusinessTransactionDirection;
  type: string;
  narration?: string;
  counterpartyName?: string;
  category?: string;
  balanceAfterCents: number;
  createdAt: string;
}

export interface BusinessTransactionFilter {
  currencyCode?: SupportedCurrency;
  direction?: BusinessTransactionDirection;
  limit?: number;
  offset?: number;
}

// --- Transfer Initiation ---

export type BusinessTransferType = "internal" | "external";

export interface InitiateTransferRequest {
  transferType: BusinessTransferType;
  recipientPhone?: string;
  recipientAccountNumber?: string;
  recipientBankCode?: string;
  recipientName?: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  narration?: string;
  purpose?: string;
  category?: string;
}

// --- Filter types for hooks ---

export interface BusinessTransferFilter {
  status?: BusinessTransferStatus;
  limit?: number;
  offset?: number;
  search?: string;
  currencyCode?: SupportedCurrency;
  transferType?: BusinessTransferType;
  initiatedBy?: string;
}

// --- Member & Role Management ---

export interface InviteMemberRequest {
  phoneNumber: string;
  roleId: string;
  title?: string;
}

export interface UpdateMemberRequest {
  roleId: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: BusinessPermission[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: BusinessPermission[];
}

// --- Invoices ---

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  categoryId?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerUserId?: string;
  currencyCode: SupportedCurrency;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes?: string;
  paymentLink?: string;
  createdBy: string;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  totalInvoicedCents: number;
  totalInvoices: number;
  outstandingCents: number;
  outstandingCount: number;
  overdueCents: number;
  overdueCount: number;
  collectedCents: number;
}

export interface CreateInvoiceRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  currencyCode: SupportedCurrency;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
  lineItems: Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt">[];
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest>;

export interface RecordPaymentRequest {
  amountCents: number;
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  limit?: number;
  offset?: number;
}

// --- Batch Payments ---

export type BatchPaymentStatus =
  | "draft"
  | "approved"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type BatchItemStatus = "pending" | "processing" | "completed" | "failed";

export interface BatchPaymentItem {
  id: string;
  batchId: string;
  recipientName: string;
  recipientPhone?: string;
  recipientBank?: string;
  recipientAccount?: string;
  amountCents: number;
  narration?: string;
  categoryId?: string;
  status: BatchItemStatus;
  transactionId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchPayment {
  id: string;
  businessId: string;
  name: string;
  currencyCode: SupportedCurrency;
  totalCents: number;
  itemCount: number;
  status: BatchPaymentStatus;
  initiatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  completedAt?: string;
  items?: BatchPaymentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchPaymentRequest {
  name: string;
  currencyCode: SupportedCurrency;
  items: {
    recipientName: string;
    recipientPhone?: string;
    recipientBank?: string;
    recipientAccount?: string;
    amountCents: number;
    narration?: string;
  }[];
}

export interface BatchPaymentFilter {
  status?: BatchPaymentStatus;
  limit?: number;
  offset?: number;
}

// --- Business Cards ---
// Business cards can be physical or virtual. Single-use (ephemeral) cards are personal-only.

export type BusinessCardType = "physical" | "virtual";

export interface BusinessCard {
  id: string;
  businessId: string;
  memberId: string;
  cardId: string;
  label: string;
  cardType: BusinessCardType;
  spendLimitCents: number;
  spentCents: number;
  periodType: "daily" | "weekly" | "monthly";
  periodResetAt?: string;
  isActive: boolean;
  memberName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueBusinessCardRequest {
  memberId: string;
  label: string;
  cardType: BusinessCardType;
  spendLimitCents: number;
  periodType: "daily" | "weekly" | "monthly";
}

export interface UpdateCardLimitsRequest {
  spendLimitCents: number;
  periodType: "daily" | "weekly" | "monthly";
}

export interface BusinessCardFilter {
  limit?: number;
  offset?: number;
}

// --- Business Settings ---

export interface UpdateBusinessRequest {
  name?: string;
  tradeName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  subRegion?: string;
  industryCategory?: IndustryCategory;
  website?: string;
}

// --- Trade Finance: Imports ---

export type ImportStatus =
  | "draft"
  | "submitted"
  | "bank_reviewing"
  | "forex_allocated"
  | "payment_pending"
  | "shipped"
  | "customs_clearing"
  | "completed"
  | "rejected"
  | "cancelled";

export type ImportPaymentMethod =
  | "lc"
  | "cad"
  | "advance_payment"
  | "open_account";

export interface ImportRequest {
  id: string;
  businessId: string;
  importNumber: string;
  supplierName: string;
  supplierCountry: string;
  goodsDescription: string;
  hsCode?: string;
  proformaAmountCents: number;
  proformaCurrency: SupportedCurrency;
  paymentMethod: ImportPaymentMethod;
  etbEquivalentCents?: number;
  fxRate?: number;
  insuranceAmountCents?: number;
  insuranceProvider?: string;
  portOfEntry?: string;
  expectedArrivalDate?: string;
  status: ImportStatus;
  documents?: ImportDocument[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportDocument {
  id: string;
  importId: string;
  documentType: string;
  name: string;
  fileKey: string;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

export interface CreateImportRequest {
  supplierName: string;
  supplierCountry: string;
  goodsDescription: string;
  hsCode?: string;
  proformaAmountCents: number;
  proformaCurrency: SupportedCurrency;
  paymentMethod: ImportPaymentMethod;
  insuranceAmountCents?: number;
  insuranceProvider?: string;
  portOfEntry?: string;
  expectedArrivalDate?: string;
}

export interface ImportFilter {
  status?: ImportStatus;
  limit?: number;
  offset?: number;
}

// --- Trade Finance: Exports ---

export type ExportStatus =
  | "draft"
  | "submitted"
  | "bank_reviewing"
  | "approved"
  | "shipped"
  | "proceeds_pending"
  | "proceeds_received"
  | "surrender_pending"
  | "completed"
  | "rejected"
  | "cancelled";

export type ExportType = "goods" | "services";

export interface ExportRequest {
  id: string;
  businessId: string;
  exportNumber: string;
  exportType: ExportType;
  buyerName: string;
  buyerCountry: string;
  description: string;
  hsCode?: string;
  contractAmountCents: number;
  contractCurrency: SupportedCurrency;
  expectedProceedsDate?: string;
  status: ExportStatus;
  documents?: ImportDocument[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExportRequest {
  exportType: ExportType;
  buyerName: string;
  buyerCountry: string;
  description: string;
  hsCode?: string;
  contractAmountCents: number;
  contractCurrency: SupportedCurrency;
  expectedProceedsDate?: string;
}

export interface ExportFilter {
  status?: ExportStatus;
  limit?: number;
  offset?: number;
}

// --- Business Loans ---

export type BusinessLoanStatus =
  | "active"
  | "in_arrears"
  | "defaulted"
  | "repaid"
  | "written_off";

export interface BusinessLoanEligibility {
  eligible: boolean;
  maxAmountCents: number;
  currencyCode: SupportedCurrency;
  interestRate?: number;
  maxTermMonths?: number;
}

export interface BusinessLoan {
  id: string;
  businessId: string;
  principalCents: number;
  outstandingCents: number;
  currencyCode: SupportedCurrency;
  interestRate: number;
  termMonths: number;
  status: BusinessLoanStatus;
  disbursedAt?: string;
  maturityDate?: string;
  repaymentSchedule?: LoanRepayment[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  dueDate: string;
  principalCents: number;
  interestCents: number;
  totalCents: number;
  isPaid: boolean;
  paidAt?: string;
}

export interface ApplyLoanRequest {
  amountCents: number;
  currencyCode: SupportedCurrency;
  termMonths: number;
  purpose: string;
}

export interface BusinessLoanFilter {
  status?: BusinessLoanStatus;
  limit?: number;
  offset?: number;
}

// --- Transaction Categories & Tax Pots ---

export interface TransactionCategory {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  isTaxDeductible?: boolean;
  totalCents?: number;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
  isTaxDeductible?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  isTaxDeductible?: boolean;
}

export type TaxType =
  | "vat"
  | "income_tax"
  | "withholding_tax"
  | "pension"
  | "excise"
  | "custom_duty"
  | "other";

export interface TaxPot {
  id: string;
  businessId: string;
  potId: string;
  taxType: TaxType;
  autoSweepPercent: number;
  dueDate?: string;
  notes?: string;
  balanceCents?: number;
  targetCents?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxPotRequest {
  taxType: TaxType;
  autoSweepPercent: number;
  targetCents?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateTaxPotRequest {
  autoSweepPercent?: number;
  targetCents?: number;
  dueDate?: string;
  notes?: string;
  isActive?: boolean;
}

// --- Documents ---

export type DocumentStatus = "pending" | "verified" | "expired" | "rejected";

export interface BusinessDocument {
  id: string;
  businessId: string;
  name: string;
  documentType: string;
  fileKey: string;
  fileSizeBytes: number;
  mimeType: string;
  description?: string;
  tags?: string[];
  expiresAt?: string;
  status: DocumentStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  name: string;
  documentType: string;
  fileKey: string;
  fileSizeBytes: number;
  mimeType: string;
  description?: string;
  tags?: string[];
  expiresAt?: string;
}

export interface DocumentFilter {
  documentType?: string;
  limit?: number;
  offset?: number;
}

export interface ExpiringDocumentsResponse {
  documents: BusinessDocument[];
  count: number;
}

// --- Statements & Accounting ---

export type StatementFormat = "pdf" | "csv" | "xlsx";

export interface StatementRequest {
  currencyCode?: SupportedCurrency;
  fromDate: string;
  toDate: string;
  format: StatementFormat;
}

export interface BusinessStatement {
  id: string;
  businessId: string;
  currencyCode?: SupportedCurrency;
  fromDate: string;
  toDate: string;
  format: StatementFormat;
  downloadUrl?: string;
  status: "generating" | "ready" | "failed";
  createdAt: string;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  formats: StatementFormat[];
  icon: string;
}
