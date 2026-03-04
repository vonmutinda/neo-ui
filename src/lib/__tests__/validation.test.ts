import { describe, it, expect } from "vitest";
import {
  validatePhone,
  validateAmount,
  safeParseFloat,
  validateNarration,
  validateBeneficiaryName,
  validateDurationDays,
} from "../validation";

describe("validatePhone", () => {
  it("accepts valid E.164 numbers", () => {
    expect(validatePhone("+251911223344")).toBeNull();
    expect(validatePhone("+12025551234")).toBeNull();
  });

  it("rejects empty input", () => {
    expect(validatePhone("")).toBe("Phone number is required");
  });

  it("rejects invalid formats", () => {
    expect(validatePhone("0911223344")).not.toBeNull();
    expect(validatePhone("+0123")).not.toBeNull();
  });
});

describe("validateAmount", () => {
  it("accepts valid amounts", () => {
    expect(validateAmount("100")).toBeNull();
    expect(validateAmount("0.01")).toBeNull();
  });

  it("rejects zero and negative", () => {
    expect(validateAmount("0")).not.toBeNull();
    expect(validateAmount("-5")).not.toBeNull();
  });

  it("rejects non-numeric", () => {
    expect(validateAmount("abc")).not.toBeNull();
    expect(validateAmount("")).not.toBeNull();
  });
});

describe("safeParseFloat", () => {
  it("parses valid numbers", () => {
    expect(safeParseFloat("42.5")).toBe(42.5);
  });

  it("returns 0 for NaN", () => {
    expect(safeParseFloat("abc")).toBe(0);
    expect(safeParseFloat("")).toBe(0);
  });
});

describe("validateNarration", () => {
  it("accepts valid narrations", () => {
    expect(validateNarration("Lunch money")).toBeNull();
    expect(validateNarration("a")).toBeNull();
  });

  it("rejects empty or whitespace-only", () => {
    expect(validateNarration("")).not.toBeNull();
    expect(validateNarration("   ")).not.toBeNull();
  });

  it("rejects narrations over 140 characters", () => {
    expect(validateNarration("x".repeat(141))).not.toBeNull();
  });

  it("accepts exactly 140 characters", () => {
    expect(validateNarration("x".repeat(140))).toBeNull();
  });
});

describe("validateBeneficiaryName", () => {
  it("accepts valid names", () => {
    expect(validateBeneficiaryName("Almaz Kebede")).toBeNull();
    expect(validateBeneficiaryName("AB")).toBeNull();
  });

  it("rejects empty or whitespace-only", () => {
    expect(validateBeneficiaryName("")).not.toBeNull();
    expect(validateBeneficiaryName("  ")).not.toBeNull();
  });

  it("rejects names shorter than 2 characters", () => {
    expect(validateBeneficiaryName("A")).not.toBeNull();
  });

  it("rejects names longer than 200 characters", () => {
    expect(validateBeneficiaryName("A".repeat(201))).not.toBeNull();
  });

  it("accepts exactly 200 characters", () => {
    expect(validateBeneficiaryName("A".repeat(200))).toBeNull();
  });
});

describe("validateDurationDays", () => {
  it("accepts valid durations", () => {
    expect(validateDurationDays("7")).toBeNull();
    expect(validateDurationDays("30")).toBeNull();
    expect(validateDurationDays("365")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(validateDurationDays("abc")).not.toBeNull();
    expect(validateDurationDays("")).not.toBeNull();
  });

  it("rejects durations below 7 days", () => {
    expect(validateDurationDays("6")).not.toBeNull();
    expect(validateDurationDays("0")).not.toBeNull();
  });

  it("rejects durations above 365 days", () => {
    expect(validateDurationDays("366")).not.toBeNull();
    expect(validateDurationDays("1000")).not.toBeNull();
  });
});
