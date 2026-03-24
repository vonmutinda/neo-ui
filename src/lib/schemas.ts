import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    phone: z
      .string()
      .min(9, "Phone number must be at least 9 digits")
      .max(15, "Phone number is too long")
      .regex(/^\d+$/, "Phone must contain only digits"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your phone number or username"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(/^\d+$/, "Phone must contain only digits"),
});

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .length(6, "Code must be 6 digits")
      .regex(/^\d+$/, "Code must contain only digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Personal ────────────────────────────────────────────────────────────────

export const sendAmountSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .max(100_000_000, "Amount exceeds maximum"),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  narration: z
    .string()
    .max(140, "Narration must be 140 characters or less")
    .optional(),
});

export const createPotSchema = z.object({
  name: z.string().min(1, "Pot name is required").max(100, "Name is too long"),
  currencyCode: z.string().length(3, "Currency is required"),
  targetCents: z.number().positive("Target amount must be positive").optional(),
  emoji: z.string().optional(),
});

export const createRecipientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name is too long"),
  type: z.enum(["enviar_user", "bank_account"]),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  currency: z.string().length(3).optional(),
});

// ─── Business ────────────────────────────────────────────────────────────────

export const businessRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name is too long"),
  tradeName: z.string().max(200).optional(),
  taxId: z.string().min(1, "TIN is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  industryCategory: z.string().min(1, "Industry category is required"),
  phoneNumber: z.string().min(9, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  subRegion: z.string().min(1, "Sub-region is required"),
});

export const createImportSchema = z.object({
  supplierName: z
    .string()
    .min(2, "Supplier name must be at least 2 characters")
    .max(200, "Supplier name is too long"),
  supplierCountry: z.string().length(2, "Country must be a 2-letter ISO code"),
  goodsDescription: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(500, "Description is too long"),
  hsCode: z
    .string()
    .min(4, "HS code must be at least 4 characters")
    .max(10, "HS code is too long")
    .optional()
    .or(z.literal("")),
  proformaAmountCents: z
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be greater than zero"),
  proformaCurrency: z.string().length(3, "Currency must be a 3-letter code"),
  paymentMethod: z.string().optional(),
  insuranceAmountCents: z.number().int().nonnegative().optional(),
  insuranceProvider: z.string().optional(),
  portOfEntry: z.string().optional(),
  expectedArrivalDate: z.string().optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export const createInvoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  currencyCode: z.string().length(3, "Currency is required"),
  subtotalCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative(),
  totalCents: z.number().int().positive("Total must be greater than zero"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().positive("Quantity must be positive"),
        unitPriceCents: z
          .number()
          .int()
          .positive("Unit price must be positive"),
      }),
    )
    .min(1, "At least one line item is required"),
});

export const createBatchPaymentSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  currencyCode: z.string().length(3, "Currency is required"),
  items: z
    .array(
      z.object({
        recipientName: z.string().min(1, "Recipient name is required"),
        recipientPhone: z.string().optional(),
        recipientBank: z.string().optional(),
        recipientAccount: z.string().optional(),
        amountCents: z.number().int().positive("Amount must be positive"),
        narration: z.string().optional(),
      }),
    )
    .min(1, "At least one payment item is required"),
});
