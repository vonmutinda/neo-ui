"use client";

import { useState } from "react";
import {
  useAdminRules,
  useAdminCreateRule,
  useAdminUpdateRule,
} from "@/hooks/admin/use-admin-rules";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function RulesPage() {
  const { data, isLoading } = useAdminRules();
  const createRule = useAdminCreateRule();
  const updateRule = useAdminUpdateRule();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    scope: "",
    value: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  const items = Array.isArray(data) ? data : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEdit(rule: any) {
    setEditId(rule.id);
    setFormData({
      key: rule.key ?? "",
      scope: rule.scope ?? "",
      value:
        typeof rule.value === "object"
          ? JSON.stringify(rule.value)
          : String(rule.value ?? ""),
      effectiveFrom: rule.effectiveFrom ? rule.effectiveFrom.split("T")[0] : "",
      effectiveTo: rule.effectiveTo ? rule.effectiveTo.split("T")[0] : "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.key.trim() || !formData.value.trim()) {
      toast.error("Key and value are required");
      return;
    }

    if (editId) {
      const updatePayload = {
        value: formData.value.trim() || undefined,
        description: undefined,
        effectiveTo: formData.effectiveTo || undefined,
      };
      updateRule.mutate(
        { id: editId, ...updatePayload },
        {
          onSuccess: () => {
            toast.success("Rule updated");
            handleCancel();
          },
          onError: () => toast.error("Failed to update rule"),
        },
      );
    } else {
      const createPayload = {
        key: formData.key.trim(),
        scope: formData.scope.trim() || "global",
        valueType: "string",
        value: formData.value.trim(),
        effectiveFrom: formData.effectiveFrom || new Date().toISOString(),
        effectiveTo: formData.effectiveTo || undefined,
      };
      createRule.mutate(createPayload, {
        onSuccess: () => {
          toast.success("Rule created");
          handleCancel();
        },
        onError: () => toast.error("Failed to create rule"),
      });
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setFormData({
      key: "",
      scope: "",
      value: "",
      effectiveFrom: "",
      effectiveTo: "",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Regulatory Rules</h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Create Rule
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {editId ? "Edit Rule" : "Create Rule"}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Key</span>
                <Input
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, key: e.target.value }))
                  }
                  placeholder="e.g. max_transfer_amount"
                  className="w-56"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Scope</span>
                <Input
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, scope: e.target.value }))
                  }
                  placeholder="e.g. ETB, global"
                  className="w-32"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Value</span>
                <Input
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, value: e.target.value }))
                  }
                  placeholder="Value"
                  className="w-48"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Effective From
                </span>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      effectiveFrom: e.target.value,
                    }))
                  }
                  className="w-40"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Effective To
                </span>
                <Input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, effectiveTo: e.target.value }))
                  }
                  className="w-40"
                />
              </label>
              <Button
                type="submit"
                size="sm"
                disabled={createRule.isPending || updateRule.isPending}
              >
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Key</th>
              <th className="px-4 py-3 font-semibold">Scope</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Effective From</th>
              <th className="px-4 py-3 font-semibold">Effective To</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No rules found
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{r.key}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.scope ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {typeof r.value === "object"
                      ? JSON.stringify(r.value)
                      : String(r.value ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.effectiveFrom
                      ? new Date(r.effectiveFrom).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.effectiveTo
                      ? new Date(r.effectiveTo).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(r)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
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
