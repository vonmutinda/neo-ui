import { describe, it, expect } from "vitest";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "../nav-items";

describe("NAV_ITEMS", () => {
  it("includes Payments linking to /payments", () => {
    const payments = NAV_ITEMS.find((item) => item.label === "Payments");
    expect(payments).toBeDefined();
    expect(payments?.href).toBe("/payments");
  });

  it("includes Home and Transactions but not Profile", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/transactions");
    expect(hrefs).not.toContain("/profile");
  });

  it("includes People, Cards, Loans", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain("/recipients");
    expect(hrefs).toContain("/cards");
    expect(hrefs).toContain("/loans");
  });

  it("includes Business linking to /business", () => {
    const biz = NAV_ITEMS.find((item) => item.label === "Business");
    expect(biz).toBeDefined();
    expect(biz?.href).toBe("/business");
  });
});

describe("BOTTOM_NAV_ITEMS", () => {
  it("includes Payments in mobile nav", () => {
    const payments = BOTTOM_NAV_ITEMS.find((item) => item.label === "Payments");
    expect(payments).toBeDefined();
    expect(payments?.href).toBe("/payments");
  });
});
