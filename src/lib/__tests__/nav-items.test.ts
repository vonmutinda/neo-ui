import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "../nav-items";

describe("NAV_ITEMS", () => {
  it("includes Payments Hub linking to requests", () => {
    const paymentsHub = NAV_ITEMS.find((item) => item.label === "Payments Hub");
    expect(paymentsHub).toBeDefined();
    expect(paymentsHub?.href).toBe("/requests");
  });

  it("includes Home, Transactions, Profile", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/transactions");
    expect(hrefs).toContain("/profile");
  });

  it("includes People, Cards, Loans", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain("/recipients");
    expect(hrefs).toContain("/cards");
    expect(hrefs).toContain("/loans");
  });
});
