"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BUSINESS_INDUSTRY_OPTIONS,
  type Business,
  type UpdateBusinessRequest,
  type IndustryCategory,
} from "@/lib/business-types";

interface ProfileSectionProps {
  business: Business;
  onSave: (data: UpdateBusinessRequest) => void;
  isSaving: boolean;
}

export function ProfileSection({
  business,
  onSave,
  isSaving,
}: ProfileSectionProps) {
  const [form, setForm] = useState<UpdateBusinessRequest>({
    name: business.name,
    tradeName: business.tradeName ?? "",
    email: business.email ?? "",
    phoneNumber: business.phoneNumber
      ? `${business.phoneNumber.countryCode}${business.phoneNumber.number}`
      : "",
    address: business.address ?? "",
    city: business.city ?? "",
    subRegion: business.subRegion ?? "",
    industryCategory: business.industryCategory,
    website: business.website ?? "",
  });

  function handleChange(field: keyof UpdateBusinessRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  function handleCancel() {
    setForm({
      name: business.name,
      tradeName: business.tradeName ?? "",
      email: business.email ?? "",
      phoneNumber: business.phoneNumber
        ? `${business.phoneNumber.countryCode}${business.phoneNumber.number}`
        : "",
      address: business.address ?? "",
      city: business.city ?? "",
      subRegion: business.subRegion ?? "",
      industryCategory: business.industryCategory,
      website: business.website ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      {/* Business Name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Business Name
        </label>
        <Input
          value={form.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* Trade Name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Trade Name
        </label>
        <Input
          value={form.tradeName ?? ""}
          onChange={(e) => handleChange("tradeName", e.target.value)}
          placeholder="Optional"
        />
      </div>

      {/* TIN (readonly) */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          TIN
        </label>
        <Input value={business.taxId} disabled className="opacity-60" />
      </div>

      {/* Registration Number (readonly) */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Registration Number
        </label>
        <Input
          value={business.registrationNumber}
          disabled
          className="opacity-60"
        />
      </div>

      {/* Industry */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Industry
        </label>
        <select
          value={form.industryCategory ?? ""}
          onChange={(e) =>
            handleChange("industryCategory", e.target.value as IndustryCategory)
          }
          className="h-10 w-full rounded-lg bg-muted/50 px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted"
        >
          {BUSINESS_INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Phone
        </label>
        <Input
          value={form.phoneNumber ?? ""}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Email
        </label>
        <Input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="business@example.com"
        />
      </div>

      {/* Address */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Address
        </label>
        <Input
          value={form.address ?? ""}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      {/* City */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          City
        </label>
        <Input
          value={form.city ?? ""}
          onChange={(e) => handleChange("city", e.target.value)}
        />
      </div>

      {/* Sub-region */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Sub-region
        </label>
        <Input
          value={form.subRegion ?? ""}
          onChange={(e) => handleChange("subRegion", e.target.value)}
        />
      </div>

      {/* Website */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/70">
          Website
        </label>
        <Input
          type="url"
          value={form.website ?? ""}
          onChange={(e) => handleChange("website", e.target.value)}
          placeholder="https://"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
