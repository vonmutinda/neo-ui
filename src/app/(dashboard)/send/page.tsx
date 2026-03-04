"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Users, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendStore } from "@/lib/send-store";
import type { TransferType } from "@/lib/send-store";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useRecipients } from "@/hooks/use-recipients";
import { toE164, formatPhoneDisplay } from "@/lib/phone-utils";
import type { RecipientInfo } from "@/lib/types";

const INSTITUTIONS = [
  { id: "NEOBANK", label: "Neo User", icon: Users },
  { id: "CBE", label: "CBE", icon: Building2 },
  { id: "DASHEN", label: "Dashen", icon: Building2 },
  { id: "AWASH", label: "Awash", icon: Building2 },
  { id: "ABYSSINIA", label: "Abyssinia", icon: Building2 },
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
    setRecipient, setType, setDestInstitution,
    isMultiSend, setMultiSend, recipients, addRecipient, removeRecipient,
  } = useSendStore();
  const [identifier, setIdentifier] = useState("");
  const [selectedInst, setSelectedInst] = useState("NEOBANK");
  const [resolved, setResolved] = useState<RecipientInfo | null>(null);
  const [resolveError, setResolveError] = useState("");

  const searchParams = useSearchParams();
  const didPrepopulate = useRef(false);

  const resolve = useResolveRecipient();
  const recentsQuery = useRecipients({ limit: 8 });
  const recentNeoUsers = (recentsQuery.data?.recipients ?? []).filter(
    (r) => r.type === "neo_user",
  );

  useEffect(() => {
    if (didPrepopulate.current) return;
    const phone = searchParams.get("phone");
    const account = searchParams.get("account");
    const institution = searchParams.get("institution");

    if (phone) {
      didPrepopulate.current = true;
      setSelectedInst("NEOBANK");
      setIdentifier(phone);
      resolve.mutateAsync(phone.trim()).then(setResolved).catch(() => {
        setResolveError("User not found. Check the phone number or username.");
      });
    } else if (account && institution) {
      didPrepopulate.current = true;
      setSelectedInst(institution);
      setIdentifier(account);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNeo = selectedInst === "NEOBANK";
  const isValid = isMultiSend
    ? recipients.length >= 2
    : isNeo
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

  function handleAddRecipient() {
    if (!resolved) return;
    const phone = toE164(resolved.phoneNumber);
    const name = recipientDisplayName(resolved);
    if (recipients.some((r) => r.phone === phone)) return;
    addRecipient({ phone, name, id: resolved.id });
    setIdentifier("");
    setResolved(null);
    setResolveError("");
  }

  function handleRecentTap(r: (typeof recentNeoUsers)[number]) {
    const phone = toE164(r.number ?? "");
    if (isMultiSend) {
      if (recipients.some((rec) => rec.phone === phone)) return;
      addRecipient({ phone, name: r.displayName, id: r.neoUserId ?? "" });
    } else {
      setIdentifier(r.number ?? r.username ?? "");
      setResolved(null);
      setResolveError("");
      (async () => {
        try {
          const info = await resolve.mutateAsync((r.number ?? r.username ?? "").trim());
          setResolved(info);
        } catch {
          setResolveError("User not found. Check the phone number or username.");
        }
      })();
    }
  }

  function handleContinue() {
    if (isMultiSend) {
      setType("inbound");
      setDestInstitution("NEOBANK");
      router.push("/send/amount");
      return;
    }

    const type: TransferType = isNeo ? "inbound" : "outbound";
    setType(type);
    setDestInstitution(selectedInst);

    if (isNeo && resolved) {
      const phone = toE164(resolved.phoneNumber);
      const name = recipientDisplayName(resolved);
      setRecipient(phone, name, resolved.id);
    } else {
      setRecipient(identifier);
    }

    router.push("/send/amount");
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Send Money</h1>
      </div>

      {/* Multi-send toggle */}
      <button
        onClick={() => setMultiSend(!isMultiSend)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          isMultiSend ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
        }`}
      >
        <Users className="h-4 w-4" />
        Send to Multiple
      </button>

      {/* Institution selector (single mode only) */}
      {!isMultiSend && (
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Send to
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {INSTITUTIONS.map((inst) => (
              <button
                key={inst.id}
                onClick={() => handleInstitutionChange(inst.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedInst === inst.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground active:bg-muted"
                }`}
              >
                <inst.icon className="h-4 w-4" />
                {inst.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recents row */}
      {recentNeoUsers.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Recent</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentNeoUsers.map((r) => (
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

      {/* Identifier input */}
      <div>
        <label
          htmlFor="identifier"
          className="mb-3 block text-sm font-medium text-muted-foreground"
        >
          {isMultiSend ? "Phone number or username" : isNeo ? "Phone number or username" : "Account / phone"}
        </label>
        <div className="relative">
          <Input
            id="identifier"
            type={isMultiSend || isNeo ? "text" : "tel"}
            inputMode={isMultiSend || isNeo ? "text" : "tel"}
            placeholder={isMultiSend || isNeo ? "+251 9XX... or @username" : "+251 9XX XXX XXXX"}
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
      {(isMultiSend || isNeo) && resolved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {recipientDisplayName(resolved)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatPhoneDisplay(resolved.phoneNumber)}
              {resolved.username && ` · @${resolved.username}`}
            </p>
          </div>
          {isMultiSend && (
            <Button
              size="sm"
              onClick={handleAddRecipient}
              disabled={recipients.length >= 10}
              className="shrink-0"
            >
              Add
            </Button>
          )}
        </motion.div>
      )}

      {/* Resolve error */}
      {(isMultiSend || isNeo) && resolveError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{resolveError}</p>
        </motion.div>
      )}

      {/* Multi-send recipient chips */}
      {isMultiSend && recipients.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {recipients.length} of 10 recipients
          </p>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <div key={r.phone} className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5">
                <UserAvatar name={r.name} size="sm" className="h-6 w-6 text-[10px]" />
                <span className="text-sm font-medium">{r.name}</span>
                <button onClick={() => removeRecipient(r.phone)}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        {isMultiSend
          ? "Send to multiple Neo users at once."
          : isNeo
            ? "Send instantly to another Neo user at zero fee."
            : `Transfer to ${selectedInst} via EthSwitch.`}
      </p>

      {/* Continue */}
      <Button
        size="lg"
        disabled={!isValid}
        onClick={handleContinue}
        className="mt-8 h-14 text-base font-semibold"
      >
        Continue
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
