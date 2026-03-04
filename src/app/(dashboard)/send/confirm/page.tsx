"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, User, Building2, Users } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SlideToConfirm } from "@/components/send/SlideToConfirm";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { useSendStore } from "@/lib/send-store";
import { useInboundTransfer, useOutboundTransfer, useBatchTransfer } from "@/hooks/use-transfers";
import { useTelegram } from "@/providers/TelegramProvider";
import { formatPhoneDisplay } from "@/lib/phone-utils";
import { formatMoney } from "@/lib/format";

type Stage = "review" | "sending" | "success" | "error";

export default function SendConfirmPage() {
  const router = useRouter();
  const { haptic } = useTelegram();
  const store = useSendStore();
  const inbound = useInboundTransfer();
  const outbound = useOutboundTransfer();
  const batch = useBatchTransfer();

  const [stage, setStage] = useState<Stage>("review");
  const [errorMsg, setErrorMsg] = useState("");
  const [txRef, setTxRef] = useState("");

  const { isMultiSend, recipients } = store;

  const multiTotal = recipients.reduce((sum, r) => sum + r.amountCents, 0);

  useEffect(() => {
    if (isMultiSend) {
      if (recipients.length < 2) router.replace("/send");
    } else if (!store.recipientPhone || store.amountCents <= 0) {
      router.replace("/send");
    }
  }, [store.recipientPhone, store.amountCents, isMultiSend, recipients.length, router]);

  const isP2P = store.type === "inbound";

  async function handleConfirm() {
    setStage("sending");
    haptic("medium");

    try {
      if (isMultiSend) {
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
        haptic("heavy");
        return;
      }

      let result;
      if (isP2P) {
        result = await inbound.mutateAsync({
          recipient: store.recipientPhone,
          amountCents: store.amountCents,
          currency: store.currency,
          narration: store.narration || "P2P Transfer",
        });
      } else {
        result = await outbound.mutateAsync({
          amountCents: store.amountCents,
          currency: store.currency,
          destPhone: store.recipientPhone,
          destInstitution: store.destInstitution,
          narration: store.narration || "Transfer",
        });
      }

      if (result && typeof result === "object" && "transactionId" in result) {
        setTxRef((result as unknown as { transactionId: string }).transactionId);
      }
      setStage("success");
      haptic("heavy");
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
    <motion.div
      className="flex min-h-[calc(100dvh-6rem)] flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      {(stage === "review" || stage === "sending") && (
        <div className="flex items-center gap-3">
          <Link
            href="/send/amount"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Confirm Transfer</h1>
        </div>
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
              {isMultiSend ? (
                <>
                  {/* Multi-send summary */}
                  <div className="text-center">
                    <CurrencyFlag currency={store.currency} size="lg" />
                    <p className="mt-3 font-tabular text-4xl font-bold tracking-tight">
                      {formatMoney(multiTotal, store.currency)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Send to {recipients.length} recipients · {store.currency}
                    </p>
                  </div>

                  {/* Recipient list */}
                  <div className="w-full rounded-2xl border bg-card p-4">
                    {recipients.map((r, i) => (
                      <div
                        key={r.phone}
                        className={`flex items-center gap-3 py-3 ${
                          i < recipients.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <UserAvatar name={r.name} className="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.name}</p>
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
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Amount */}
                  <div className="text-center">
                    <CurrencyFlag currency={store.currency} size="lg" />
                    <p className="mt-3 font-tabular text-4xl font-bold tracking-tight">
                      {displayAmount}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {store.currency}
                    </p>
                  </div>

                  {/* Details card */}
                  <div className="w-full rounded-2xl border bg-card p-5">
                    <DetailRow
                      label="To"
                      value={store.recipientName || formatPhoneDisplay(store.recipientPhone)}
                      icon={isP2P ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    />
                    {isP2P && store.recipientName && (
                      <DetailRow label="Phone" value={formatPhoneDisplay(store.recipientPhone)} />
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

          {/* Success state */}
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
              {isMultiSend ? (
                <>
                  <h2 className="text-2xl font-bold">Sent to {recipients.length} recipients</h2>
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
                    to {store.recipientName || store.recipientPhone}
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

          {/* Error state */}
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

      {/* Bottom actions -- single SlideToConfirm with reactive state */}
      <div className="space-y-4 pb-6">
        {(stage === "review" || stage === "sending") && (
          <SlideToConfirm
            onConfirm={handleConfirm}
            isPending={stage === "sending"}
            isSuccess={false}
          />
        )}

        {stage === "success" && (
          <Button
            size="lg"
            onClick={handleDone}
            className="h-14 w-full text-base font-semibold"
          >
            Done
          </Button>
        )}

        {stage === "error" && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDone}
              className="h-14 flex-1"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleRetry}
              className="h-14 flex-1"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </motion.div>
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
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-sm font-medium ${
          highlight ? "text-emerald-600 dark:text-emerald-400" : ""
        }`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}
