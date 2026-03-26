"use client";

import { redirect } from "next/navigation";

// Tax page is now merged into Accounting.
// Categories → Accounting "Categories" tab
// Tax Pots → Pots page (filter by "tax" category)
export default function TaxRedirect() {
  redirect("/business/accounting");
}
