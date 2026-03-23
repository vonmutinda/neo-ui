"use client";

import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";

const BANK_OPTIONS = [
  { value: "CBE", label: "Commercial Bank of Ethiopia" },
  { value: "BOA", label: "Bank of Abyssinia" },
  { value: "DASHEN", label: "Dashen Bank" },
  { value: "AWASH", label: "Awash Bank" },
  { value: "COOP", label: "Cooperative Bank of Oromia" },
  { value: "ABAY", label: "Abay Bank" },
  { value: "WEGAGEN", label: "Wegagen Bank" },
  { value: "UNITED", label: "United Bank" },
  { value: "NIB", label: "Nib International Bank" },
  { value: "ZEMEN", label: "Zemen Bank" },
];

export function TransferRecipientStep() {
  const {
    transferType,
    recipientPhone,
    setRecipientPhone,
    recipientName,
    setRecipientName,
    recipientAccount,
    setRecipientAccount,
    recipientBank,
    setRecipientBank,
    setStep,
  } = useBusinessTransferStore();

  const isInternal = transferType === "internal";

  const canContinue = isInternal
    ? recipientPhone.length >= 9
    : recipientBank && recipientAccount && recipientName;

  function handleResolve() {
    if (recipientPhone.length >= 9) {
      setRecipientName("Enviar User");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {isInternal ? "Enviar recipient" : "Bank recipient"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isInternal
            ? "Enter the recipient's phone number"
            : "Enter the bank account details"}
        </p>
      </div>

      {isInternal ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Phone number
              </label>
              <Input
                placeholder="09xxxxxxxx"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
            <button
              onClick={handleResolve}
              disabled={recipientPhone.length < 9}
              className={cn(
                "mt-7 flex h-12 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              <Search className="h-4 w-4" />
              Resolve
            </button>
          </div>

          {recipientName && (
            <div
              className={cn(
                "rounded-2xl px-5 py-4",
                "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
              )}
            >
              <p className="text-xs text-muted-foreground">Recipient</p>
              <p className="mt-0.5 text-sm font-semibold">{recipientName}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Bank
            </label>
            <select
              value={recipientBank}
              onChange={(e) => setRecipientBank(e.target.value)}
              className={cn(
                "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
                "transition-[color,box-shadow]",
              )}
            >
              <option value="">Select a bank</option>
              {BANK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Account number
            </label>
            <Input
              placeholder="Enter account number"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Recipient name
            </label>
            <Input
              placeholder="Account holder name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setStep(1)}
          className={cn(
            "flex h-12 items-center gap-2 rounded-xl border border-input px-5 text-sm font-medium",
            "transition-colors hover:bg-secondary/60 active:bg-secondary",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!canContinue}
          className={cn(
            "flex h-12 flex-1 items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
