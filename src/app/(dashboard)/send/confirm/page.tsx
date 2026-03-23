"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, User, Building2 } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { SuccessAnimation } from "@/components/shared/SuccessAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SlideToConfirm } from "@/components/send/SlideToConfirm";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSendStore } from "@/lib/send-store";
import {
  useInboundTransfer,
  useOutboundTransfer,
  useBatchTransfer,
} from "@/hooks/use-transfers";

import { formatPhoneDisplay } from "@/lib/phone-utils";
import { formatMoney } from "@/lib/format";

type Stage = "review" | "sending" | "success" | "error";

export default function SendConfirmPage() {
  const router = useRouter();

  const store = useSendStore();
  const inbound = useInboundTransfer();
  const outbound = useOutboundTransfer();
  const batch = useBatchTransfer();

  const [stage, setStage] = useState<Stage>("review");
  const [errorMsg, setErrorMsg] = useState("");
  const [txRef, setTxRef] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const { recipients } = store;
  const isMulti = recipients.length > 1;
  const primaryRecipient = recipients[0];

  const multiTotal = recipients.reduce((sum, r) => sum + r.amountCents, 0);

  useEffect(() => {
    if (recipients.length < 1 || store.amountCents <= 0) {
      router.replace("/send");
    }
  }, [recipients.length, store.amountCents, router]);

  useEffect(() => {
    if (stage !== "success") return;
    setShowCelebration(true); // eslint-disable-line react-hooks/set-state-in-effect -- intentional animation trigger
    const timeout = window.setTimeout(() => setShowCelebration(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  const isP2P = store.type === "inbound";

  async function handleConfirm() {
    setStage("sending");

    try {
      if (isMulti) {
        const result = await batch.mutateAsync({
          currency: store.currency,
          items: recipients.map((r) => ({
            recipient: r.phone,
            amountCents: r.amountCents,
            narration: r.narration || store.narration || "Batch Transfer",
          })),
        });
        if (result?.receiptId) setTxRef(result.receiptId);
        setStage("success");
        return;
      }

      let result;
      if (isP2P) {
        result = await inbound.mutateAsync({
          recipient: primaryRecipient.phone,
          amountCents: store.amountCents,
          currency: store.currency,
          narration: store.narration || "P2P Transfer",
        });
      } else {
        result = await outbound.mutateAsync({
          amountCents: store.amountCents,
          currency: store.currency,
          destPhone: primaryRecipient.phone,
          destInstitution: store.destInstitution,
          narration: store.narration || "Transfer",
        });
      }

      if (result && typeof result === "object" && "transactionId" in result) {
        setTxRef(
          (result as unknown as { transactionId: string }).transactionId,
        );
      }
      setStage("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transfer failed";
      setStage("error");
      setErrorMsg(msg);
      toast.error("Transfer failed", { description: msg });
    }
  }

  function handleDone() {
    store.reset();
    router.push("/");
  }

  function handleRetry() {
    setStage("review");
    setErrorMsg("");
  }

  const displayAmount = formatMoney(store.amountCents, store.currency);

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <SuccessAnimation
        show={showCelebration}
        title={isMulti ? "Transfers sent" : "Money sent"}
        subtitle={
          isMulti
            ? `${recipients.length} recipients were paid successfully.`
            : "Your transfer is complete."
        }
      />

      {/* Header */}
      {(stage === "review" || stage === "sending") && (
        <PageHeader title="Confirm Transfer" />
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
        <AnimatePresence mode="wait">
          {/* Review / Sending state */}
          {(stage === "review" || stage === "sending") && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex w-full flex-col items-center gap-6"
            >
              {isMulti ? (
                <>
                  <div className="text-center">
                    <CurrencyFlag currency={store.currency} size="lg" />
                    <p className="mt-3 font-tabular text-4xl font-bold tracking-tight">
                      {formatMoney(multiTotal, store.currency)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Send to {recipients.length} recipients · {store.currency}
                    </p>
                  </div>

                  <div className="w-full rounded-2xl border border-border/60 bg-card p-4">
                    {recipients.map((r, i) => (
                      <div
                        key={r.phone}
                        className={`flex items-center gap-3 py-3 ${
                          i < recipients.length - 1
                            ? "border-b border-border/60"
                            : ""
                        }`}
                      >
                        <UserAvatar name={r.name} className="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {r.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatPhoneDisplay(r.phone)}
                          </p>
                        </div>
                        <span className="shrink-0 font-tabular text-sm font-semibold">
                          {formatMoney(r.amountCents, store.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Fee</span>
                      <span className="text-sm font-medium text-emerald-600">
                        Free
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <CurrencyFlag currency={store.currency} size="lg" />
                    <p className="mt-3 font-tabular text-4xl font-bold tracking-tight">
                      {displayAmount}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {store.currency}
                    </p>
                  </div>

                  <div className="w-full rounded-2xl border border-border/60 bg-card p-5">
                    <DetailRow
                      label="To"
                      value={
                        primaryRecipient?.name ||
                        formatPhoneDisplay(primaryRecipient?.phone ?? "")
                      }
                      icon={
                        isP2P ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )
                      }
                    />
                    {isP2P && primaryRecipient?.name && (
                      <DetailRow
                        label="Phone"
                        value={formatPhoneDisplay(primaryRecipient.phone)}
                      />
                    )}
                    {!isP2P && (
                      <DetailRow label="Bank" value={store.destInstitution} />
                    )}
                    <DetailRow
                      label="Type"
                      value={isP2P ? "Instant P2P" : "EthSwitch Transfer"}
                    />
                    {store.narration && (
                      <DetailRow label="Note" value={store.narration} />
                    )}
                    <DetailRow
                      label="Fee"
                      value={isP2P ? "Free" : "Standard"}
                      highlight={isP2P}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Success */}
          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="h-20 w-20 text-emerald-500" />
              </motion.div>
              {isMulti ? (
                <>
                  <h2 className="text-2xl font-bold">
                    Sent to {recipients.length} recipients
                  </h2>
                  <p className="font-tabular text-3xl font-semibold">
                    {formatMoney(multiTotal, store.currency)}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">Money Sent!</h2>
                  <p className="font-tabular text-3xl font-semibold">
                    {displayAmount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    to {primaryRecipient?.name || primaryRecipient?.phone}
                  </p>
                </>
              )}
              {txRef && (
                <p className="mt-2 rounded-lg bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  Ref: {txRef}
                </p>
              )}
            </motion.div>
          )}

          {/* Error */}
          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <XCircle className="h-20 w-20 text-destructive" />
              <h2 className="text-2xl font-bold">Transfer Failed</h2>
              <p className="max-w-xs text-sm text-muted-foreground">
                {errorMsg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="space-y-4 pb-6">
        {(stage === "review" || stage === "sending") && (
          <SlideToConfirm
            onConfirm={handleConfirm}
            isPending={stage === "sending"}
            isSuccess={false}
          />
        )}

        {stage === "success" && (
          <Button size="cta" onClick={handleDone}>
            Done
          </Button>
        )}

        {stage === "error" && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="cta"
              onClick={handleDone}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button size="cta" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-sm font-medium ${
          highlight ? "text-emerald-600" : ""
        }`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}
