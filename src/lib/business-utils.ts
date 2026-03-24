import type {
  BusinessTransferStatus,
  BusinessTransfer,
  BusinessTransactionDirection,
  BusinessTransferType,
  BusinessPermission,
  InvoiceStatus,
  BatchPaymentStatus,
  BatchItemStatus,
  BusinessCard,
  ImportStatus,
  ImportPaymentMethod,
  BusinessLoanStatus,
  DocumentStatus,
  TaxType,
} from "./business-types";

const STATUS_COLORS: Record<BusinessTransferStatus, string> = {
  pending: "bg-warning/10 text-warning-foreground",
  approved: "bg-success/10 text-success-foreground",
  rejected: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  executed: "bg-success/10 text-success-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export function getTransferStatusColor(status: BusinessTransferStatus): string {
  return STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const STATUS_LABELS: Record<BusinessTransferStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  executed: "Done",
  failed: "Failed",
};

export function getTransferStatusLabel(status: BusinessTransferStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatTransferRecipient(transfer: BusinessTransfer): string {
  const info = transfer.recipientInfo;
  if (!info) return "Unknown";

  if (typeof info === "object") {
    const name =
      (info.name as string) ??
      (info.accountName as string) ??
      (info.firstName as string);
    const bank = info.bankName as string;
    const lastFour = info.accountNumber
      ? String(info.accountNumber).slice(-4)
      : undefined;

    if (name && bank && lastFour) return `${bank} ****${lastFour}`;
    if (name) return name;
    if (bank && lastFour) return `${bank} ****${lastFour}`;
  }

  return "Transfer";
}

export function formatTransferSubtext(transfer: BusinessTransfer): string {
  const info = transfer.recipientInfo;
  if (!info || typeof info !== "object") return transfer.transferType;

  const narration = info.narration as string | undefined;
  if (narration) return narration;

  return transfer.transferType.replace(/_/g, " ");
}

const CURRENCY_FLAGS: Record<string, string> = {
  ETB: "\u{1F1EA}\u{1F1F9}",
  USD: "\u{1F1FA}\u{1F1F8}",
  EUR: "\u{1F1EA}\u{1F1FA}",
  GBP: "\u{1F1EC}\u{1F1E7}",
  AED: "\u{1F1E6}\u{1F1EA}",
  SAR: "\u{1F1F8}\u{1F1E6}",
  CNY: "\u{1F1E8}\u{1F1F3}",
  KES: "\u{1F1F0}\u{1F1EA}",
};

export function currencyFlag(code: string): string {
  return CURRENCY_FLAGS[code] ?? "\u{1F4B1}";
}

// --- Transaction direction helpers ---

const DIRECTION_LABELS: Record<BusinessTransactionDirection, string> = {
  in: "Money In",
  out: "Money Out",
  fx: "Conversion",
};

export function getTransactionDirectionLabel(
  direction: BusinessTransactionDirection,
): string {
  return DIRECTION_LABELS[direction] ?? direction;
}

const DIRECTION_COLORS: Record<BusinessTransactionDirection, string> = {
  in: "bg-success/10 text-success-foreground",
  out: "bg-muted text-muted-foreground",
  fx: "bg-primary/10 text-primary",
};

export function getTransactionDirectionColor(
  direction: BusinessTransactionDirection,
): string {
  return DIRECTION_COLORS[direction] ?? "bg-muted text-muted-foreground";
}

// --- Transfer type helpers ---

export function getTransferTypeLabel(type: BusinessTransferType): string {
  return type === "internal" ? "Internal" : "External";
}

// --- Purpose & category options ---

export const PURPOSE_OPTIONS = [
  { value: "trade", label: "Trade" },
  { value: "general", label: "General" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "salary", label: "Salary" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "supplier_payments", label: "Supplier Payments" },
  { value: "rent", label: "Rent & Utilities" },
  { value: "payroll", label: "Payroll" },
  { value: "tax", label: "Tax Payments" },
  { value: "equipment", label: "Equipment" },
  { value: "travel", label: "Travel & Expenses" },
  { value: "other", label: "Other" },
] as const;

// --- Permission helpers ---

export interface PermissionGroup {
  label: string;
  permissions: BusinessPermission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Dashboard & View",
    permissions: [
      "biz:dashboard:view",
      "biz:balances:view",
      "biz:transactions:view",
      "biz:documents:view",
      "biz:invoices:view",
      "biz:cards:view",
      "biz:loans:view",
    ],
  },
  {
    label: "Money Movement",
    permissions: [
      "biz:transfers:initiate:internal",
      "biz:transfers:initiate:external",
      "biz:transfers:approve",
      "biz:convert:initiate",
      "biz:wallets:manage",
    ],
  },
  {
    label: "Batch Payments",
    permissions: ["biz:batch:create", "biz:batch:approve", "biz:batch:execute"],
  },
  {
    label: "Invoices & Documents",
    permissions: [
      "biz:invoices:manage",
      "biz:documents:manage",
      "biz:transactions:export",
      "biz:transactions:label",
    ],
  },
  {
    label: "Cards & Loans",
    permissions: [
      "biz:cards:manage",
      "biz:loans:apply",
      "biz:pots:manage",
      "biz:tax_pots:manage",
      "biz:tax_pots:withdraw",
    ],
  },
  {
    label: "Trade Finance",
    permissions: ["biz:imports:manage", "biz:imports:view"],
  },
  {
    label: "Administration",
    permissions: [
      "biz:members:manage",
      "biz:roles:manage",
      "biz:settings:manage",
    ],
  },
];

const PERMISSION_LABELS: Record<string, string> = {
  "biz:dashboard:view": "View Dashboard",
  "biz:balances:view": "View Balances",
  "biz:transactions:view": "View Transactions",
  "biz:transactions:export": "Export Transactions",
  "biz:transactions:label": "Label Transactions",
  "biz:transfers:initiate:internal": "Initiate Internal Transfers",
  "biz:transfers:initiate:external": "Initiate External Transfers",
  "biz:transfers:approve": "Approve Transfers",
  "biz:convert:initiate": "Currency Conversion",
  "biz:batch:create": "Create Batch Payments",
  "biz:batch:approve": "Approve Batch Payments",
  "biz:batch:execute": "Execute Batch Payments",
  "biz:invoices:manage": "Manage Invoices",
  "biz:invoices:view": "View Invoices",
  "biz:documents:view": "View Documents",
  "biz:documents:manage": "Manage Documents",
  "biz:wallets:manage": "Manage Wallets",
  "biz:cards:manage": "Manage Cards",
  "biz:cards:view": "View Cards",
  "biz:loans:view": "View Loans",
  "biz:loans:apply": "Apply for Loans",
  "biz:pots:manage": "Manage Pots",
  "biz:tax_pots:manage": "Manage Tax Pots",
  "biz:tax_pots:withdraw": "Withdraw from Tax Pots",
  "biz:imports:manage": "Manage Imports",
  "biz:imports:view": "View Imports",
  "biz:members:manage": "Manage Members",
  "biz:roles:manage": "Manage Roles",
  "biz:settings:manage": "Manage Settings",
};

export function getPermissionLabel(perm: BusinessPermission): string {
  return PERMISSION_LABELS[perm] ?? perm;
}

// --- Invoice status helpers ---

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-primary/10 text-primary",
  partially_paid: "bg-warning/10 text-warning-foreground",
  paid: "bg-success/10 text-success-foreground",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  return INVOICE_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partially_paid: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}

// --- Batch payment status helpers ---

const BATCH_STATUS_COLORS: Record<BatchPaymentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  processing: "bg-warning/10 text-warning-foreground",
  completed: "bg-success/10 text-success-foreground",
  partial: "bg-warning/10 text-warning-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export function getBatchStatusColor(status: BatchPaymentStatus): string {
  return BATCH_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const BATCH_STATUS_LABELS: Record<BatchPaymentStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  processing: "Processing",
  completed: "Completed",
  partial: "Partial",
  failed: "Failed",
};

export function getBatchStatusLabel(status: BatchPaymentStatus): string {
  return BATCH_STATUS_LABELS[status] ?? status;
}

const BATCH_ITEM_STATUS_COLORS: Record<BatchItemStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-warning/10 text-warning-foreground",
  completed: "bg-success/10 text-success-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export function getBatchItemStatusColor(status: BatchItemStatus): string {
  return BATCH_ITEM_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const BATCH_ITEM_STATUS_LABELS: Record<BatchItemStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Done",
  failed: "Failed",
};

export function getBatchItemStatusLabel(status: BatchItemStatus): string {
  return BATCH_ITEM_STATUS_LABELS[status] ?? status;
}

// --- Business card helpers ---

export const CARD_GRADIENTS = [
  "bg-gradient-to-br from-gray-900 to-gray-700",
  "bg-gradient-to-br from-blue-900 to-blue-700",
  "bg-gradient-to-br from-slate-800 to-slate-600",
  "bg-gradient-to-br from-zinc-900 to-zinc-700",
] as const;

export function getCardSpendPercent(card: BusinessCard): number {
  if (card.spendLimitCents === 0) return 0;
  return Math.min(
    100,
    Math.round((card.spentCents / card.spendLimitCents) * 100),
  );
}

// --- Import status helpers ---

const IMPORT_STATUS_COLORS: Record<ImportStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  bank_reviewing: "bg-warning/10 text-warning-foreground",
  forex_allocated: "bg-primary/10 text-primary",
  payment_pending: "bg-warning/10 text-warning-foreground",
  shipped: "bg-primary/10 text-primary",
  customs_clearing: "bg-warning/10 text-warning-foreground",
  completed: "bg-success/10 text-success-foreground",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function getImportStatusColor(status: ImportStatus): string {
  return IMPORT_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  bank_reviewing: "Bank Review",
  forex_allocated: "FX Allocated",
  payment_pending: "Payment Pending",
  shipped: "Shipped",
  customs_clearing: "Customs",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function getImportStatusLabel(status: ImportStatus): string {
  return IMPORT_STATUS_LABELS[status] ?? status;
}

const PAYMENT_METHOD_LABELS: Record<ImportPaymentMethod, string> = {
  lc: "Letter of Credit",
  cad: "Cash Against Documents",
  advance_payment: "Advance Payment",
  open_account: "Open Account",
};

export function getPaymentMethodLabel(method: ImportPaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

// --- Business loan status helpers ---

const LOAN_STATUS_COLORS: Record<BusinessLoanStatus, string> = {
  active: "bg-success/10 text-success-foreground",
  in_arrears: "bg-warning/10 text-warning-foreground",
  defaulted: "bg-destructive/10 text-destructive",
  repaid: "bg-muted text-muted-foreground",
  written_off: "bg-muted text-muted-foreground",
};

export function getLoanStatusColor(status: BusinessLoanStatus): string {
  return LOAN_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const LOAN_STATUS_LABELS: Record<BusinessLoanStatus, string> = {
  active: "Active",
  in_arrears: "In Arrears",
  defaulted: "Defaulted",
  repaid: "Repaid",
  written_off: "Written Off",
};

export function getLoanStatusLabel(status: BusinessLoanStatus): string {
  return LOAN_STATUS_LABELS[status] ?? status;
}

// --- Document status helpers ---

const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  pending: "bg-warning/10 text-warning-foreground",
  verified: "bg-success/10 text-success-foreground",
  expired: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

export function getDocumentStatusColor(status: DocumentStatus): string {
  return DOCUMENT_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  expired: "Expired",
  rejected: "Rejected",
};

export function getDocumentStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABELS[status] ?? status;
}

// --- Tax type helpers ---

const TAX_TYPE_LABELS: Record<TaxType, string> = {
  vat: "VAT",
  income_tax: "Income Tax",
  withholding_tax: "Withholding Tax",
  pension: "Pension",
  excise: "Excise",
  custom_duty: "Custom Duty",
  other: "Other",
};

export function getTaxTypeLabel(taxType: TaxType): string {
  return TAX_TYPE_LABELS[taxType] ?? taxType;
}

export const TAX_TYPE_OPTIONS = Object.entries(TAX_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as TaxType, label }),
);

export const CATEGORY_COLORS = [
  "#0071E3",
  "#34C759",
  "#FF3B30",
  "#FF9500",
  "#AF52DE",
  "#5AC8FA",
  "#FF2D55",
  "#A2845E",
] as const;
