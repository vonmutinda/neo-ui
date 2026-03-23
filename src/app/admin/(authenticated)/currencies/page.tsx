"use client";

import { useState } from "react";
import {
  useAdminCurrencies,
  useAdminUpsertCurrency,
  useAdminToggleCurrencyStatus,
} from "@/hooks/admin/use-admin-currencies";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function CurrenciesPage() {
  const { data, isLoading } = useAdminCurrencies();
  const upsertCurrency = useAdminUpsertCurrency();
  const toggleStatus = useAdminToggleCurrencyStatus();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    displayOrder: 0,
  });

  const items = Array.isArray(data) ? data : [];

  function handleToggle(code: string, currentlyActive: boolean) {
    toggleStatus.mutate(
      { code, isActive: !currentlyActive },
      {
        onSuccess: () =>
          toast.success(
            `Currency ${currentlyActive ? "deactivated" : "activated"}`,
          ),
        onError: () => toast.error("Failed to toggle currency status"),
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEdit(currency: any) {
    setEditId(currency.code ?? currency.id);
    setFormData({
      code: currency.code ?? "",
      name: currency.name ?? "",
      symbol: currency.symbol ?? "",
      displayOrder: currency.displayOrder ?? 0,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Code and name are required");
      return;
    }
    upsertCurrency.mutate(
      {
        ...formData,
        code: formData.code.toUpperCase(),
        countryCode: "",
        decimalPlaces: 2,
        supportsAccountDetails: false,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success(editId ? "Currency updated" : "Currency created");
          setShowForm(false);
          setEditId(null);
          setFormData({ code: "", name: "", symbol: "", displayOrder: 0 });
        },
        onError: () => toast.error("Failed to save currency"),
      },
    );
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setFormData({ code: "", name: "", symbol: "", displayOrder: 0 });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Currencies</h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Currency
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {editId ? "Edit Currency" : "Add Currency"}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Code</span>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="ETB"
                className="w-24"
                disabled={!!editId}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Name</span>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ethiopian Birr"
                className="w-48"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Symbol</span>
              <Input
                value={formData.symbol}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, symbol: e.target.value }))
                }
                placeholder="Br"
                className="w-20"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Display Order
              </span>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    displayOrder: Number(e.target.value) || 0,
                  }))
                }
                className="w-24"
              />
            </label>
            <Button type="submit" size="sm" disabled={upsertCurrency.isPending}>
              {editId ? "Update" : "Create"}
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Symbol</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Display Order</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No currencies found
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((c: any) => (
                <tr
                  key={c.code ?? c.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.symbol ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.displayOrder ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(c.code, !!c.isActive)}
                        disabled={toggleStatus.isPending}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
