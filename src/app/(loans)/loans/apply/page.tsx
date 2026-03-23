"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoanApplyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/loans");
  }, [router]);
  return null;
}
