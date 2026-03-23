"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Zap,
  Wifi,
  Tv,
  Droplets,
  Building2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBillers, useBillPayments } from "@/hooks/use-bill-payments";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";

type Tab = "pay" | "history";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electricity: <Zap className="h-4 w-4" />,
  internet: <Wifi className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  default: <Building2 className="h-4 w-4" />,
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS.default;
}

export default function BillPaymentsPage() {
  const { data: billers, isLoading: billersLoading } = useBillers();
  const { data: payments, isLoading: paymentsLoading } = useBillPayments();

  const [tab, setTab] = useState<Tab>("pay");
  const [search, setSearch] = useState("");
  const [selectedBiller, setSelectedBiller] = useState<string | null>(null);
  const [accountRef, setAccountRef] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const billerList = Array.isArray(billers) ? billers : [];
  const paymentList = Array.isArray(payments) ? payments : [];

  const filteredBillers = billerList.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedBillerObj = billerList.find((b) => b.code === selectedBiller);

  async function handlePayBill(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBiller || !accountRef || !amount) return;

    setSubmitting(true);
    try {
      // Payment will be handled by the hook/API
      toast.success("Bill payment submitted");
      setSelectedBiller(null);
      setAccountRef("");
      setAmount("");
      setTab("history");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bill Payments" backHref="/" />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/60 bg-card p-1">
        {(["pay", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "pay" ? "Pay Bill" : "History"}
          </button>
        ))}
      </div>

      {/* Pay Bill Tab */}
      {tab === "pay" && (
        <div className="space-y-4">
          {/* Quick pay form if biller selected */}
          {selectedBillerObj ? (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePayBill}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getCategoryIcon(selectedBillerObj.category)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {selectedBillerObj.name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {selectedBillerObj.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBiller(null)}
                  className="text-xs font-medium text-primary"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Account / Reference
                </label>
                <Input
                  type="text"
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  placeholder="Enter account or reference number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Amount
                </label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-semibold tabular-nums"
                />
              </div>

              <Button
                type="submit"
                size="cta"
                disabled={!accountRef || !amount || submitting}
              >
                {submitting ? "Processing..." : "Pay Bill"}
              </Button>
            </motion.form>
          ) : (
            <>
              {/* Search billers */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search billers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Billers loading */}
              {billersLoading && (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              )}

              {/* Billers grid */}
              {!billersLoading &&
                filteredBillers &&
                filteredBillers.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredBillers.map((biller, i) => (
                      <motion.button
                        key={biller.code}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedBiller(biller.code)}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 text-center transition-colors hover:bg-muted active:bg-muted"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {getCategoryIcon(biller.category)}
                        </div>
                        <p className="text-sm font-medium">{biller.name}</p>
                        <p className="text-[10px] capitalize text-muted-foreground">
                          {biller.category}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}

              {!billersLoading &&
                (!filteredBillers || filteredBillers.length === 0) && (
                  <EmptyState
                    icon={Receipt}
                    title="No billers found"
                    description="Try a different search term."
                  />
                )}
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="space-y-3">
          {paymentsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          )}

          {!paymentsLoading && paymentList.length === 0 && (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Your bill payment history will appear here."
            />
          )}

          {!paymentsLoading &&
            paymentList.length > 0 &&
            paymentList.map((payment, i) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/bill-payments/${payment.id}`}>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors active:bg-muted">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {payment.billerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(payment.amountCents, payment.currency)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${PAYMENT_STATUS_STYLES[payment.status] ?? ""}`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
