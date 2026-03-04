const PHONE_E164 = /^\+[1-9]\d{6,14}$/;

export function validatePhone(phone: string): string | null {
  if (!phone) return "Phone number is required";
  if (!PHONE_E164.test(phone)) return "Invalid phone format (use E.164, e.g. +251911223344)";
  return null;
}

export function validateAmount(value: string): string | null {
  if (!value) return "Amount is required";
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return "Invalid amount";
  if (num <= 0) return "Amount must be greater than zero";
  if (num > 100_000_000) return "Amount exceeds maximum";
  return null;
}

export function safeParseFloat(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return num;
}

export function validateNarration(value: string): string | null {
  if (!value.trim()) return "Description is required";
  if (value.length > 140) return "Description must be 140 characters or less";
  return null;
}

export function validateBeneficiaryName(value: string): string | null {
  if (!value.trim()) return "Full name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  if (value.trim().length > 200) return "Name must be 200 characters or less";
  return null;
}

export function validateDurationDays(value: string): string | null {
  const num = parseInt(value, 10);
  if (isNaN(num)) return "Duration is required";
  if (num < 7) return "Minimum duration is 7 days";
  if (num > 365) return "Maximum duration is 365 days";
  return null;
}
