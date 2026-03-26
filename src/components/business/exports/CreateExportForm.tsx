"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Loader2 } from "lucide-react";
import type { CreateExportRequest, ExportType } from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

interface CreateExportFormProps {
  onSubmit: (data: CreateExportRequest) => void;
  isSubmitting: boolean;
  initialData?: Partial<CreateExportRequest>;
  submitLabel?: string;
  onCancel?: () => void;
}

const CURRENCIES: SupportedCurrency[] = [
  "USD",
  "EUR",
  "GBP",
  "ETB",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

export function CreateExportForm({
  onSubmit,
  isSubmitting,
  initialData,
  submitLabel = "Create Export",
  onCancel,
}: CreateExportFormProps) {
  const [exportType, setExportType] = useState<ExportType>(
    initialData?.exportType ?? "goods",
  );
  const [buyerName, setBuyerName] = useState(initialData?.buyerName ?? "");
  const [buyerCountry, setBuyerCountry] = useState(
    initialData?.buyerCountry ?? "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [hsCode, setHsCode] = useState(initialData?.hsCode ?? "");
  const [contractAmount, setContractAmount] = useState(
    initialData?.contractAmountCents
      ? String(initialData.contractAmountCents / 100)
      : "",
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(
    initialData?.contractCurrency ?? "USD",
  );
  const [surrenderPercentage, setSurrenderPercentage] = useState(
    initialData?.surrenderPercentage != null
      ? String(initialData.surrenderPercentage)
      : "70",
  );
  const [shipmentDate, setShipmentDate] = useState(
    initialData?.shipmentDate ?? "",
  );
  const [repatriationDeadline, setRepatriationDeadline] = useState(
    initialData?.repatriationDeadline ?? "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  function handleSubmit() {
    if (!buyerName.trim() || !buyerCountry.trim() || !description.trim())
      return;
    const amountCents = Math.round(parseFloat(contractAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    onSubmit({
      exportType,
      buyerName: buyerName.trim(),
      buyerCountry: buyerCountry.trim(),
      description: description.trim(),
      hsCode: hsCode.trim() || undefined,
      contractAmountCents: amountCents,
      contractCurrency: currency,
      surrenderPercentage: parseFloat(surrenderPercentage) || 70,
      shipmentDate: shipmentDate || undefined,
      repatriationDeadline: repatriationDeadline || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <FormField label="Export Type">
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value as ExportType)}
          className="flex h-11 w-full rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="goods">Goods</option>
          <option value="services">Services</option>
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Buyer Name">
          <Input
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Company name"
            className="h-11 rounded-xl"
          />
        </FormField>
        <FormField label="Buyer Country">
          <Input
            value={buyerCountry}
            onChange={(e) => setBuyerCountry(e.target.value)}
            placeholder="e.g. United States"
            className="h-11 rounded-xl"
          />
        </FormField>
      </div>

      <FormField label="Description">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Goods or services description"
          className="h-11 rounded-xl"
        />
      </FormField>

      <FormField label="HS Code (optional)">
        <Input
          value={hsCode}
          onChange={(e) => setHsCode(e.target.value)}
          placeholder="e.g. 0901.11"
          className="h-11 rounded-xl"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Contract Amount">
          <Input
            type="number"
            value={contractAmount}
            onChange={(e) => setContractAmount(e.target.value)}
            placeholder="0.00"
            className="h-11 rounded-xl"
          />
        </FormField>
        <FormField label="Currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
            className="flex h-11 w-full rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Surrender %">
          <Input
            type="number"
            value={surrenderPercentage}
            onChange={(e) => setSurrenderPercentage(e.target.value)}
            placeholder="70"
            min="0"
            max="100"
            className="h-11 rounded-xl"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Shipment Date (optional)">
          <Input
            type="date"
            value={shipmentDate}
            onChange={(e) => setShipmentDate(e.target.value)}
            className="h-11 rounded-xl"
          />
        </FormField>
        <FormField label="Repatriation Deadline (optional)">
          <Input
            type="date"
            value={repatriationDeadline}
            onChange={(e) => setRepatriationDeadline(e.target.value)}
            className="h-11 rounded-xl"
          />
        </FormField>
      </div>

      <FormField label="Notes (optional)">
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes"
          className="h-11 rounded-xl"
        />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button
          className="h-11 rounded-xl px-6 text-sm font-semibold"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel && (
          <Button
            variant="ghost"
            className="h-11 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
