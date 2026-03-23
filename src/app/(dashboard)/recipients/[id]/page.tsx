"use client";

import { use } from "react";
import { RecipientDetailScreen } from "@/components/recipients/RecipientDetailScreen";

export default function RecipientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RecipientDetailScreen id={id} />;
}
