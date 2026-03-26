"use client";

import { redirect } from "next/navigation";

export default function NewTransferRedirect() {
  redirect("/business/payments/transfers/new");
}
