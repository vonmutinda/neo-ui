"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransferStepper } from "@/components/business/transfers/TransferStepper";
import { TransferTypeStep } from "@/components/business/transfers/TransferTypeStep";
import { TransferRecipientStep } from "@/components/business/transfers/TransferRecipientStep";
import { TransferAmountStep } from "@/components/business/transfers/TransferAmountStep";
import { TransferReviewStep } from "@/components/business/transfers/TransferReviewStep";
import { TransferSummaryCard } from "@/components/business/transfers/TransferSummaryCard";
import { TransfersSkeleton } from "@/components/business/transfers/TransfersSkeleton";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";
import { useBusinessPermissionCheck } from "@/hooks/business/use-business-members";

export default function NewTransferPage() {
  const { isChecking, allowed: canInitiateTransfer } =
    useBusinessPermissionCheck([
      "biz:transfers:initiate:internal",
      "biz:transfers:initiate:external",
    ]);

  const { step, reset } = useBusinessTransferStore();

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isChecking) {
    return <TransfersSkeleton />;
  }

  if (!canInitiateTransfer) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Transfer" backHref="/business/payments" />
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to initiate transfers for this
          business.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Transfer" backHref="/business/payments" />

      <div className="flex justify-center py-2">
        <TransferStepper currentStep={step} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 1 && <TransferTypeStep />}
          {step === 2 && <TransferRecipientStep />}
          {step === 3 && <TransferAmountStep />}
          {step === 4 && <TransferReviewStep />}
        </div>

        <div className="hidden lg:block">
          <TransferSummaryCard />
        </div>
      </div>
    </div>
  );
}
