import { describe, it, expect } from "vitest";
import { formatMoney, currencySymbol } from "../format";

describe("currencySymbol", () => {
  it("returns Br for ETB", () => {
    expect(currencySymbol("ETB")).toBe("Br");
  });

  it("returns $ for USD", () => {
    expect(currencySymbol("USD")).toBe("$");
  });

  it("returns € for EUR", () => {
    expect(currencySymbol("EUR")).toBe("€");
  });

  it("returns empty string for unknown currency", () => {
    expect(currencySymbol("GBP")).toBe("");
    expect(currencySymbol("")).toBe("");
  });
});

describe("formatMoney", () => {
  it("formats basic ETB amount with 2 decimal places", () => {
    expect(formatMoney(150000, "ETB")).toBe("Br1,500.00");
  });

  it("formats basic USD amount", () => {
    expect(formatMoney(99, "USD")).toBe("$0.99");
  });

  it("formats basic EUR amount", () => {
    expect(formatMoney(250050, "EUR")).toBe("€2,500.50");
  });

  it("formats zero correctly", () => {
    expect(formatMoney(0, "ETB")).toBe("Br0.00");
  });

  it("adds + sign when sign is true", () => {
    expect(formatMoney(150000, "ETB", true)).toBe("+Br1,500.00");
  });

  it("adds - sign when sign is false", () => {
    expect(formatMoney(150000, "ETB", false)).toBe("-Br1,500.00");
  });

  it("adds no sign when sign is undefined", () => {
    expect(formatMoney(150000, "ETB", undefined)).toBe("Br1,500.00");
  });

  it("uses absolute value for negative cents", () => {
    expect(formatMoney(-5000, "USD")).toBe("$50.00");
    expect(formatMoney(-5000, "USD", false)).toBe("-$50.00");
  });

  it("respects custom fractionDigits = 0", () => {
    expect(formatMoney(150000, "ETB", undefined, 0)).toBe("Br1,500");
  });

  it("respects custom fractionDigits = 3", () => {
    expect(formatMoney(150000, "USD", undefined, 3)).toBe("$1,500.000");
  });

  it("adds thousand separators for large amounts", () => {
    expect(formatMoney(100000000, "ETB")).toBe("Br1,000,000.00");
  });

  it("handles small amounts (single cent)", () => {
    expect(formatMoney(1, "USD")).toBe("$0.01");
  });

  it("handles unknown currency without symbol", () => {
    expect(formatMoney(10000, "GBP")).toBe("100.00");
  });

  it("combines sign with unknown currency", () => {
    expect(formatMoney(10000, "GBP", true)).toBe("+100.00");
    expect(formatMoney(10000, "GBP", false)).toBe("-100.00");
  });
});
