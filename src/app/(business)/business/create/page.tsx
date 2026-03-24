"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { api } from "@/lib/api-client";
import { businessRegisterSchema } from "@/lib/schemas";
import { useFormErrors } from "@/hooks/use-form-errors";
import type { Business, IndustryCategory } from "@/lib/business-types";
import { BUSINESS_INDUSTRY_OPTIONS } from "@/lib/business-types";

function formatPhoneDisplay(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export default function BusinessCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [industryCategory, setIndustryCategory] =
    useState<IndustryCategory>("retail");
  const [industrySubCategory, setIndustrySubCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [subRegion, setSubRegion] = useState("");

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 9));
  }

  const registerMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        tradeName: tradeName.trim() || undefined,
        taxId: taxId.trim(),
        registrationNumber: registrationNumber.trim(),
        industryCategory,
        industrySubCategory: industrySubCategory.trim() || undefined,
        phoneNumber: { countryCode: "251", number: phone },
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        subRegion: subRegion.trim() || undefined,
      };
      return api.post<Business>("/v1/business/register", body);
    },
    onSuccess: async (biz) => {
      await queryClient.invalidateQueries({ queryKey: ["business", "mine"] });
      await queryClient.invalidateQueries({ queryKey: ["business", biz.id] });
      toast.success("Business created");
      router.replace("/business");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not create business");
    },
  });

  const formData = {
    name: name.trim(),
    tradeName: tradeName.trim() || undefined,
    taxId: taxId.trim(),
    registrationNumber: registrationNumber.trim(),
    industryCategory,
    phoneNumber: phone,
    email: email.trim(),
    city: city.trim(),
    subRegion: subRegion.trim(),
  };

  const { errors, validate, clearField } = useFormErrors(
    businessRegisterSchema,
    formData,
  );

  function handleSubmit() {
    if (registerMutation.isPending) return;
    if (!validate()) return;
    registerMutation.mutate();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-8">
      <div className="mb-6 flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Personal home
        </Link>
        <div className="flex justify-center">
          <EnviarLogo size="md" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold">Create a business</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register a business account on Enviar
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <FormField label="Legal name" error={errors.name}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearField("name");
            }}
            placeholder="Business legal name"
            className="h-11 rounded-xl"
          />
        </FormField>

        <FormField label="Trade name (optional)">
          <Input
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Trading as"
            className="h-11 rounded-xl"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tax ID" error={errors.taxId}>
            <Input
              value={taxId}
              onChange={(e) => {
                setTaxId(e.target.value);
                clearField("taxId");
              }}
              placeholder="TIN"
              className="h-11 rounded-xl"
            />
          </FormField>
          <FormField
            label="Registration number"
            error={errors.registrationNumber}
          >
            <Input
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value);
                clearField("registrationNumber");
              }}
              placeholder="Business registration no."
              className="h-11 rounded-xl"
            />
          </FormField>
        </div>

        <FormField label="Industry" error={errors.industryCategory}>
          <select
            value={industryCategory}
            onChange={(e) =>
              setIndustryCategory(e.target.value as IndustryCategory)
            }
            className="flex h-11 w-full rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {BUSINESS_INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Industry sub-category (optional)">
          <Input
            value={industrySubCategory}
            onChange={(e) => setIndustrySubCategory(e.target.value)}
            placeholder="e.g. electronics retail"
            className="h-11 rounded-xl"
          />
        </FormField>

        <FormField label="Business phone" error={errors.phoneNumber}>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              <span className="text-muted-foreground">+251</span>
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXXX"
              value={formatPhoneDisplay(phone)}
              onChange={(e) => {
                handlePhoneChange(e.target.value);
                clearField("phoneNumber");
              }}
              className="h-11 rounded-xl border border-border/60 bg-card pl-14 text-base"
            />
            <Phone className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
          </div>
        </FormField>

        <FormField label="Email (optional)" error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearField("email");
            }}
            placeholder="contact@company.com"
            className="h-11 rounded-xl"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City (optional)" error={errors.city}>
            <Input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearField("city");
              }}
              className="h-11 rounded-xl"
            />
          </FormField>
          <FormField label="Sub-region (optional)" error={errors.subRegion}>
            <Input
              value={subRegion}
              onChange={(e) => {
                setSubRegion(e.target.value);
                clearField("subRegion");
              }}
              className="h-11 rounded-xl"
            />
          </FormField>
        </div>

        <Button
          type="button"
          className="mt-1 h-12 w-full rounded-xl text-base font-semibold"
          disabled={registerMutation.isPending}
          onClick={handleSubmit}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create business"
          )}
        </Button>
      </div>
    </div>
  );
}
