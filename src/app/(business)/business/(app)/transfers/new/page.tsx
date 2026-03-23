"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransferStepper } from "@/components/business/transfers/TransferStepper";
import { TransferTypeStep } from "@/components/business/transfers/TransferTypeStep";
import { TransferRecipientStep } from "@/components/business/transfers/TransferRecipientStep";
import { TransferAmountStep } from "@/components/business/transfers/TransferAmountStep";
import { TransferReviewStep } from "@/components/business/transfers/TransferReviewStep";
import { TransferSummaryCard } from "@/components/business/transfers/TransferSummaryCard";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";

export default function NewTransferPage() {
  const { step, reset } = useBusinessTransferStore();

  // Reset store on mount
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="New Transfer" backHref="/business/transfers" />

      <div className="flex justify-center py-2">
        <TransferStepper currentStep={step} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Active step */}
        <div>
          {step === 1 && <TransferTypeStep />}
          {step === 2 && <TransferRecipientStep />}
          {step === 3 && <TransferAmountStep />}
          {step === 4 && <TransferReviewStep />}
        </div>

        {/* Summary card (desktop only) */}
        <div className="hidden lg:block">
          <TransferSummaryCard />
        </div>
      </div>
    </div>
  );
}
