"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useTaxPots,
  useCreateTaxPot,
} from "@/hooks/business/use-categories";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoriesList } from "@/components/business/tax/CategoriesList";
import { CategorySummaryChart } from "@/components/business/tax/CategorySummaryChart";
import { TaxPotCard } from "@/components/business/tax/TaxPotCard";
import { CreateCategoryDialog } from "@/components/business/tax/CreateCategoryDialog";
import { CreateTaxPotDialog } from "@/components/business/tax/CreateTaxPotDialog";
import { TaxSkeleton } from "@/components/business/tax/TaxSkeleton";
import type {
  TransactionCategory,
  CreateCategoryRequest,
  CreateTaxPotRequest,
} from "@/lib/business-types";

type Tab = "categories" | "tax-pots";

const TABS: { value: Tab; label: string }[] = [
  { value: "categories", label: "Categories" },
  { value: "tax-pots", label: "Tax Pots" },
];

export default function TaxPage() {
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateTaxPot, setShowCreateTaxPot] = useState(false);

  const { data: categories, isLoading: catLoading } =
    useCategories(activeBusinessId);
  const { data: taxPots, isLoading: potsLoading } =
    useTaxPots(activeBusinessId);

  const createCategory = useCreateCategory(activeBusinessId);
  const deleteCategory = useDeleteCategory(activeBusinessId);
  const createTaxPot = useCreateTaxPot(activeBusinessId);

  const canManageCategories =
    permissions?.includes("biz:transactions:label") ?? false;
  const canManagePots = permissions?.includes("biz:tax_pots:manage") ?? false;

  const isLoading = catLoading || potsLoading;
  if (isLoading) return <TaxSkeleton />;

  const currencyCode = activeBusiness?.market === "US" ? "USD" : "ETB";

  function handleCreateCategory(req: CreateCategoryRequest) {
    createCategory.mutate(req, {
      onSuccess: () => {
        toast.success("Category created");
        setShowCreateCategory(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleDeleteCategory(cat: TransactionCategory) {
    if (cat.isSystem) return;
    deleteCategory.mutate(cat.id, {
      onSuccess: () => toast.success("Category deleted"),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleCreateTaxPot(req: CreateTaxPotRequest) {
    createTaxPot.mutate(req, {
      onSuccess: () => {
        toast.success("Tax pot created");
        setShowCreateTaxPot(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax & Categories"
        rightSlot={
          activeTab === "categories" && canManageCategories ? (
            <button
              onClick={() => setShowCreateCategory(true)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Category
            </button>
          ) : activeTab === "tax-pots" && canManagePots ? (
            <button
              onClick={() => setShowCreateTaxPot(true)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Tax Pot
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories tab */}
      {activeTab === "categories" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <CategoriesList
            categories={categories ?? []}
            canManage={canManageCategories}
            currencyCode={currencyCode}
            onEdit={() => toast.info("Edit coming soon")}
            onDelete={handleDeleteCategory}
          />
          <CategorySummaryChart
            categories={categories ?? []}
            currencyCode={currencyCode}
          />
        </div>
      )}

      {/* Tax Pots tab */}
      {activeTab === "tax-pots" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(taxPots ?? []).length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No tax pots yet
            </div>
          ) : (
            (taxPots ?? []).map((pot) => (
              <TaxPotCard
                key={pot.id}
                pot={pot}
                currencyCode={currencyCode}
                canManage={canManagePots}
                onEdit={() => toast.info("Edit coming soon")}
                onWithdraw={() => toast.info("Withdraw coming soon")}
              />
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={createCategory.isPending}
      />

      <CreateTaxPotDialog
        open={showCreateTaxPot}
        onClose={() => setShowCreateTaxPot(false)}
        onSubmit={handleCreateTaxPot}
        isSubmitting={createTaxPot.isPending}
      />
    </div>
  );
}
