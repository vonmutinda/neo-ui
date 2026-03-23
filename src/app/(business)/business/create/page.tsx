"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { api } from "@/lib/api-client";
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

  const phoneValid = phone.length === 9;
  const formValid =
    name.trim().length >= 2 &&
    taxId.trim().length >= 8 &&
    registrationNumber.trim().length >= 5 &&
    phoneValid;

  function handleSubmit() {
    if (!formValid || registerMutation.isPending) return;
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Legal name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Business legal name"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Trade name (optional)
          </label>
          <Input
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Trading as"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tax ID
            </label>
            <Input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Min 8 characters"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Registration number
            </label>
            <Input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Min 5 characters"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Industry
          </label>
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
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Industry sub-category (optional)
          </label>
          <Input
            value={industrySubCategory}
            onChange={(e) => setIndustrySubCategory(e.target.value)}
            placeholder="e.g. electronics retail"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Business phone
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              <span className="text-muted-foreground">+251</span>
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXXX"
              value={formatPhoneDisplay(phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-11 rounded-xl border border-border/60 bg-card pl-14 text-base"
            />
            <Phone className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Email (optional)
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@company.com"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              City (optional)
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Sub-region (optional)
            </label>
            <Input
              value={subRegion}
              onChange={(e) => setSubRegion(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <Button
          type="button"
          className="mt-1 h-12 w-full rounded-xl text-base font-semibold"
          disabled={!formValid || registerMutation.isPending}
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
