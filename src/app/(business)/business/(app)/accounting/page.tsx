"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  ArrowRightLeft,
  TrendingUp,
  Scale,
  Receipt,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { useBusinessStore } from "@/providers/business-store";
import {
  useStatements,
  useRequestStatement,
  useDownloadStatement,
} from "@/hooks/business/use-statements";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/business/use-categories";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatementRequestForm } from "@/components/business/accounting/StatementRequestForm";
import { StatementsTable } from "@/components/business/accounting/StatementsTable";
import { CategoriesList } from "@/components/business/tax/CategoriesList";
import { CategorySummaryChart } from "@/components/business/tax/CategorySummaryChart";
import { CreateCategoryDialog } from "@/components/business/tax/CreateCategoryDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  StatementRequest,
  CreateCategoryRequest,
  TransactionCategory,
} from "@/lib/business-types";

type Tab = "statements" | "reports" | "categories";

const TABS: { value: Tab; label: string }[] = [
  { value: "statements", label: "Statements" },
  { value: "reports", label: "Reports" },
  { value: "categories", label: "Categories" },
];

const REPORT_TYPES = [
  {
    id: "transactions",
    name: "Transactions",
    description: "Full transaction history with filters and search",
    icon: ArrowRightLeft,
    formats: "PDF, CSV",
    range: "Custom range",
  },
  {
    id: "pnl",
    name: "Profit & Loss",
    description: "Income vs expenses breakdown by category",
    icon: TrendingUp,
    formats: "PDF, Excel",
    range: "Monthly / Quarterly",
  },
  {
    id: "balance-sheet",
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity snapshot",
    icon: Scale,
    formats: "PDF",
    range: "Point in time",
  },
  {
    id: "tax-summary",
    name: "Tax Summary",
    description: "Tax pot allocations, deductible categories, and obligations",
    icon: Receipt,
    formats: "PDF, CSV",
    range: "Tax period",
  },
  {
    id: "cash-flow",
    name: "Cash Flow",
    description: "Inflows and outflows across all currencies",
    icon: Banknote,
    formats: "PDF, Excel",
    range: "Custom range",
  },
  {
    id: "audit-trail",
    name: "Audit Trail",
    description: "Member actions, approvals, and system events",
    icon: ShieldCheck,
    formats: "PDF, CSV",
    range: "Custom range",
  },
];

export default function AccountingPage() {
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);
  const [activeTab, setActiveTab] = useState<Tab>("statements");
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  // Statements
  const { data: result, isLoading: statementsLoading } =
    useStatements(activeBusinessId);
  const requestStatement = useRequestStatement(activeBusinessId);
  const downloadStatement = useDownloadStatement();

  // Categories
  const { data: categories, isLoading: categoriesLoading } =
    useCategories(activeBusinessId);
  const createCategory = useCreateCategory(activeBusinessId);
  const deleteCategory = useDeleteCategory(activeBusinessId);

  const canManageCategories =
    permissions?.includes("biz:transactions:label") ?? false;

  const currencyCode = activeBusiness?.market === "US" ? "USD" : "ETB";

  function handleGenerate(req: StatementRequest) {
    requestStatement.mutate(req, {
      onSuccess: () => toast.success("Statement is being generated"),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleDownload(downloadUrl: string) {
    downloadStatement.mutate(downloadUrl, {
      onError: (err) => toast.error(err.message),
    });
  }

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

  const statements = result?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting"
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

      {/* Statements tab */}
      {activeTab === "statements" && (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <StatementRequestForm
            onSubmit={handleGenerate}
            isSubmitting={requestStatement.isPending}
          />
          <div>
            {statementsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <StatementsTable
                statements={statements}
                onDownload={handleDownload}
              />
            )}
          </div>
        </div>
      )}

      {/* Reports tab */}
      {activeTab === "reports" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => toast.info("Coming soon")}
                className={cn(
                  "flex flex-col items-start rounded-2xl bg-card p-5 text-left",
                  "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
                  "transition-all hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {report.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {report.formats}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {report.range}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Categories tab */}
      {activeTab === "categories" &&
        (categoriesLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
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
        ))}

      {/* Create category dialog */}
      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={createCategory.isPending}
      />
    </div>
  );
}
