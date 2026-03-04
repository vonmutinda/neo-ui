import type { PhoneNumber } from "./types";

type PhoneInput = string | PhoneNumber | null | undefined;

export function toE164(p: PhoneInput): string {
  if (!p) return "";
  if (typeof p === "string") return p;
  if (!p.countryCode || !p.number) return "";
  return `+${p.countryCode}${p.number}`;
}

export function formatPhoneDisplay(p: PhoneInput): string {
  const e164 = toE164(p);
  if (!e164) return "";
  return e164.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4");
}
