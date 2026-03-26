"use client";

import { useParams, redirect } from "next/navigation";

export default function TransferDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  redirect(`/business/payments/transfers/${id}`);
}
