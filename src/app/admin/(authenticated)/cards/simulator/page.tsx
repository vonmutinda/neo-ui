"use client";

import { useState } from "react";
import {
  useAdminSimulateAuthorize,
  useAdminSimulateSettle,
  useAdminSimulateReverse,
} from "@/hooks/admin/use-admin-card-simulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function CardSimulatorPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Card Simulator</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AuthorizeSection />
        <SettleSection />
        <ReverseSection />
      </div>
    </div>
  );
}

function AuthorizeSection() {
  const simulate = useAdminSimulateAuthorize();
  const [cardId, setCardId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [mcc, setMcc] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!cardId.trim() || !merchant.trim() || !parsed || parsed <= 0) {
      toast.error("Card ID, merchant, and amount are required");
      return;
    }
    simulate.mutate(
      {
        cardId: cardId.trim(),
        merchantName: merchant.trim(),
        merchantCategoryCode: mcc.trim() || "5411",
        amountCents: Math.round(parsed * 100),
        currency: "ETB",
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Authorization created${data?.authorizationId ? `: ${data.authorizationId}` : ""}`,
          );
        },
        onError: () => toast.error("Authorization failed"),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">Authorize</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Card ID</span>
          <Input
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            placeholder="Card ID"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Merchant</span>
          <Input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Merchant name"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">MCC</span>
          <Input
            value={mcc}
            onChange={(e) => setMcc(e.target.value)}
            placeholder="Merchant category code (optional)"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Amount</span>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={simulate.isPending}
        >
          {simulate.isPending ? "Authorizing..." : "Authorize"}
        </Button>
      </form>
    </div>
  );
}

function SettleSection() {
  const simulate = useAdminSimulateSettle();
  const [authId, setAuthId] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!authId.trim() || !parsed || parsed <= 0) {
      toast.error("Authorization ID and amount are required");
      return;
    }
    simulate.mutate(
      { authorizationId: authId.trim(), amountCents: Math.round(parsed * 100) },
      {
        onSuccess: () => toast.success("Settlement simulated"),
        onError: () => toast.error("Settlement failed"),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="text-sm font-semibold">Settle</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Authorization ID
          </span>
          <Input
            value={authId}
            onChange={(e) => setAuthId(e.target.value)}
            placeholder="Authorization ID"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Amount</span>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Settlement amount"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={simulate.isPending}
        >
          {simulate.isPending ? "Settling..." : "Settle"}
        </Button>
      </form>
    </div>
  );
}

function ReverseSection() {
  const simulate = useAdminSimulateReverse();
  const [authId, setAuthId] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!authId.trim() || !parsed || parsed <= 0) {
      toast.error("Authorization ID and amount are required");
      return;
    }
    simulate.mutate(
      { authorizationId: authId.trim(), amountCents: Math.round(parsed * 100) },
      {
        onSuccess: () => toast.success("Reversal simulated"),
        onError: () => toast.error("Reversal failed"),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <RotateCcw className="h-5 w-5 text-orange-500" />
        <h3 className="text-sm font-semibold">Reverse</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Authorization ID
          </span>
          <Input
            value={authId}
            onChange={(e) => setAuthId(e.target.value)}
            placeholder="Authorization ID"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Amount</span>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Reversal amount"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={simulate.isPending}
        >
          {simulate.isPending ? "Reversing..." : "Reverse"}
        </Button>
      </form>
    </div>
  );
}
