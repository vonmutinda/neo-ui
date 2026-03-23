"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { BankLogo } from "@/components/shared/BankLogos";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendStore } from "@/lib/send-store";
import type { TransferType } from "@/lib/send-store";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useRecipients } from "@/hooks/use-recipients";
import { toE164, formatPhoneDisplay } from "@/lib/phone-utils";
import type { RecipientInfo } from "@/lib/types";

const INSTITUTIONS = [
  { id: "ENVIAR", label: "Enviar User" },
  { id: "CBE", label: "CBE" },
  { id: "DASHEN", label: "Dashen" },
  { id: "AWASH", label: "Awash" },
  { id: "ABYSSINIA", label: "Abyssinia" },
];

function recipientDisplayName(r: RecipientInfo): string {
  const parts = [r.firstName, r.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (r.username) return `@${r.username}`;
  return toE164(r.phoneNumber);
}

export default function SendRecipientPage() {
  const router = useRouter();
  const {
    setRecipient,
    setType,
    setDestInstitution,
    recipients,
    addRecipient,
    removeRecipient,
  } = useSendStore();
  const [identifier, setIdentifier] = useState("");
  const [selectedInst, setSelectedInst] = useState("ENVIAR");
  const [resolved, setResolved] = useState<RecipientInfo | null>(null);
  const [resolveError, setResolveError] = useState("");

  const searchParams = useSearchParams();
  const didPrepopulate = useRef(false);

  const resolve = useResolveRecipient();
  const recentsQuery = useRecipients({ limit: 8 });
  const recentEnviarUsers = (recentsQuery.data?.recipients ?? []).filter(
    (r) => r.type === "enviar_user",
  );

  /* eslint-disable react-hooks/set-state-in-effect -- one-time URL prepopulation */
  useEffect(() => {
    if (didPrepopulate.current) return;
    const phone = searchParams.get("phone");
    const account = searchParams.get("account");
    const institution = searchParams.get("institution");

    if (phone) {
      didPrepopulate.current = true;
      setSelectedInst("ENVIAR");
      setIdentifier(phone);
      resolve
        .mutateAsync(phone.trim())
        .then(setResolved)
        .catch(() => {
          setResolveError(
            "User not found. Check the phone number or username.",
          );
        });
    } else if (account && institution) {
      didPrepopulate.current = true;
      setSelectedInst(institution);
      setIdentifier(account);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  const isEnviar = selectedInst === "ENVIAR";
  const hasRecipients = recipients.length > 0;
  const isValid = hasRecipients
    ? recipients.length >= 1
    : isEnviar
      ? !!resolved
      : identifier.length >= 10;

  function handleIdentifierChange(value: string) {
    setIdentifier(value);
    setResolved(null);
    setResolveError("");
  }

  function handleInstitutionChange(id: string) {
    setSelectedInst(id);
    setResolved(null);
    setResolveError("");
  }

  async function handleLookup() {
    if (!identifier.trim()) return;
    setResolveError("");
    setResolved(null);

    try {
      const info = await resolve.mutateAsync(identifier.trim());
      setResolved(info);
    } catch {
      setResolveError("User not found. Check the phone number or username.");
    }
  }

  function handleAddAnother() {
    if (!resolved) return;
    const phone = toE164(resolved.phoneNumber);
    const name = recipientDisplayName(resolved);
    if (recipients.some((r) => r.phone === phone)) return;
    addRecipient({ phone, name, id: resolved.id });
    setIdentifier("");
    setResolved(null);
    setResolveError("");
  }

  function handleRecentTap(r: (typeof recentEnviarUsers)[number]) {
    const phone = toE164(r.number ?? "");

    if (hasRecipients) {
      // Progressive: add to list
      if (recipients.some((rec) => rec.phone === phone)) return;
      addRecipient({ phone, name: r.displayName, id: r.enviarUserId ?? "" });
    } else {
      // First recipient: resolve
      setIdentifier(r.number ?? r.username ?? "");
      setResolved(null);
      setResolveError("");
      (async () => {
        try {
          const info = await resolve.mutateAsync(
            (r.number ?? r.username ?? "").trim(),
          );
          setResolved(info);
        } catch {
          setResolveError(
            "User not found. Check the phone number or username.",
          );
        }
      })();
    }
  }

  function handleContinue() {
    // If recipients already populated (progressive add mode)
    if (hasRecipients) {
      setType("inbound");
      setDestInstitution("ENVIAR");
      router.push("/send/amount");
      return;
    }

    const type: TransferType = isEnviar ? "inbound" : "outbound";
    setType(type);
    setDestInstitution(selectedInst);

    if (isEnviar && resolved) {
      const phone = toE164(resolved.phoneNumber);
      const name = recipientDisplayName(resolved);
      setRecipient(phone, name, resolved.id);
    } else {
      setRecipient(identifier);
    }

    router.push("/send/amount");
  }

  // Hide institution selector once recipients are being added (always ENVIAR for multi)
  const showInstitutions = !hasRecipients;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Send Money" backHref="/" />

      {/* Institution selector — only before first recipient */}
      {showInstitutions && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Send to
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {INSTITUTIONS.map((inst) => (
              <button
                key={inst.id}
                onClick={() => handleInstitutionChange(inst.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                  selectedInst === inst.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <BankLogo institutionId={inst.id} className="h-5 w-5" />
                {inst.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recents row */}
      {recentEnviarUsers.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recent
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentEnviarUsers.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRecentTap(r)}
                className="flex shrink-0 flex-col items-center gap-1"
              >
                <UserAvatar name={r.displayName} size="lg" />
                <span className="w-14 truncate text-center text-[10px]">
                  {r.displayName}
                </span>
                {r.username && (
                  <span className="w-14 truncate text-center text-[10px] text-muted-foreground">
                    @{r.username}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipient chips */}
      {hasRecipients && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {recipients.length}{" "}
            {recipients.length === 1 ? "recipient" : "recipients"}
          </p>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <div
                key={r.phone}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1.5"
              >
                <UserAvatar
                  name={r.name}
                  size="sm"
                  className="h-6 w-6 text-[10px]"
                />
                <span className="text-sm font-medium">{r.name}</span>
                <button
                  onClick={() => removeRecipient(r.phone)}
                  aria-label={`Remove ${r.name}`}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Identifier input */}
      <div>
        <label
          htmlFor="identifier"
          className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {isEnviar || hasRecipients
            ? "Phone number or username"
            : "Account / phone"}
        </label>
        <div className="relative">
          <Input
            id="identifier"
            type={isEnviar || hasRecipients ? "text" : "tel"}
            inputMode={isEnviar || hasRecipients ? "text" : "tel"}
            placeholder={
              isEnviar || hasRecipients
                ? "+251 9XX... or @username"
                : "+251 9XX XXX XXXX"
            }
            value={identifier}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="h-14 pr-10 text-lg"
            autoFocus
          />
          {resolve.isPending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Resolve result */}
      {(isEnviar || hasRecipients) && resolved && (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-primary/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {recipientDisplayName(resolved)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatPhoneDisplay(resolved.phoneNumber)}
              {resolved.username && ` · @${resolved.username}`}
            </p>
          </div>
          {/* Progressive add: "+" to add this person and search for another */}
          {isEnviar && (
            <button
              onClick={handleAddAnother}
              disabled={recipients.length >= 10}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted active:bg-muted disabled:opacity-50"
              aria-label="Add another recipient"
            >
              <Plus className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      )}

      {/* Resolve error */}
      {(isEnviar || hasRecipients) && resolveError && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{resolveError}</p>
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        {hasRecipients
          ? "Send to multiple Enviar users at once."
          : isEnviar
            ? "Send instantly to another Enviar user at zero fee."
            : `Transfer to ${selectedInst} via EthSwitch.`}
      </p>

      {/* Continue */}
      <Button
        size="cta"
        disabled={!isValid}
        onClick={handleContinue}
        className="mt-4"
      >
        Continue
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
