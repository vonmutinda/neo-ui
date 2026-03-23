"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Phone, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useCreateRecipient } from "@/hooks/use-recipients";
import { useBanks } from "@/hooks/use-recipients";

export default function NewRecipientPage() {
  const router = useRouter();
  const resolve = useResolveRecipient();
  const create = useCreateRecipient();
  const banks = useBanks();

  const [mode, setMode] = useState<"enviar_user" | "bank_account">(
    "enviar_user",
  );
  const [identifier, setIdentifier] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankSearch, setBankSearch] = useState("");

  const resolved = resolve.data;
  const resolvedPhone = resolved
    ? typeof resolved.phoneNumber === "string"
      ? resolved.phoneNumber
      : `${resolved.phoneNumber.countryCode}${resolved.phoneNumber.number}`
    : "";

  const filteredBanks = (banks.data ?? []).filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  async function handleSubmit() {
    try {
      if (mode === "enviar_user") {
        if (!resolvedPhone) return;
        await create.mutateAsync({
          type: "enviar_user",
          identifier: resolvedPhone,
        });
      } else {
        if (!institutionCode || accountNumber.length < 4) return;
        await create.mutateAsync({
          type: "bank_account",
          institutionCode,
          accountNumber,
        });
      }
      router.push("/recipients");
    } catch {
      /* toast */
    }
  }

  const canSubmit =
    mode === "enviar_user"
      ? !!resolved
      : institutionCode.length > 0 && accountNumber.length >= 4;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add person" backHref="/recipients" />

      <div className="grid grid-cols-2 gap-2">
        {(["enviar_user", "bank_account"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              resolve.reset();
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all active:scale-[0.97] ${
              mode === m
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {m === "enviar_user" ? (
              <Phone className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            {m === "enviar_user" ? "Enviar User" : "Bank Account"}
          </button>
        ))}
      </div>

      {mode === "enviar_user" ? (
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Phone or username
          </label>
          <div className="relative">
            <Input
              placeholder="e.g. 0912345678 or @username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (resolve.data) resolve.reset();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && identifier.trim().length >= 2) {
                  resolve.mutate(identifier.trim());
                }
              }}
              className="pr-10"
            />
            {resolve.isPending && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          {identifier.trim().length >= 2 && !resolve.isPending && !resolved && (
            <button
              type="button"
              onClick={() => resolve.mutate(identifier.trim())}
              className="text-xs font-medium text-primary hover:underline"
            >
              Look up
            </button>
          )}
          {resolved && (
            <p className="text-sm text-foreground">
              {[resolved.firstName, resolved.lastName]
                .filter(Boolean)
                .join(" ") ||
                (resolved.username ? `@${resolved.username}` : resolvedPhone)}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Bank
            </label>
            <Input
              placeholder="Search bank..."
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-40 overflow-y-auto rounded-xl border border-border/60">
              {filteredBanks.slice(0, 20).map((b) => (
                <button
                  key={b.institutionCode}
                  type="button"
                  onClick={() => setInstitutionCode(b.institutionCode)}
                  className={`flex w-full px-3 py-2 text-left text-sm ${
                    institutionCode === b.institutionCode
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account number
            </label>
            <Input
              placeholder="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
        </div>
      )}

      <Button
        size="cta"
        disabled={!canSubmit || create.isPending}
        onClick={handleSubmit}
        className="mt-2"
      >
        {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save person
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Need labels, beneficiaries, or more options?{" "}
        <Link href="/recipients" className="font-medium text-primary underline">
          Open the full People screen
        </Link>
      </p>
    </div>
  );
}
