import { create } from "zustand";
import type { SupportedCurrency } from "./types";

export type TransferType = "inbound" | "outbound";

export interface ResolvedRecipient {
  phone: string;
  name: string;
  id: string;
  amountCents: number;
  narration: string;
}

interface SendState {
  type: TransferType;
  recipientPhone: string;
  recipientName: string;
  recipientId: string;
  destInstitution: string;
  amountCents: number;
  currency: SupportedCurrency;
  narration: string;

  setType: (type: TransferType) => void;
  setRecipient: (phone: string, name?: string, id?: string) => void;
  setDestInstitution: (inst: string) => void;
  setAmount: (cents: number) => void;
  setCurrency: (c: SupportedCurrency) => void;
  setNarration: (n: string) => void;
  reset: () => void;

  isMultiSend: boolean;
  recipients: ResolvedRecipient[];
  setMultiSend: (on: boolean) => void;
  addRecipient: (r: Omit<ResolvedRecipient, "amountCents" | "narration">) => void;
  removeRecipient: (phone: string) => void;
  setRecipientAmount: (phone: string, cents: number) => void;
  setRecipientNarration: (phone: string, narration: string) => void;
  setBulkAmount: (cents: number) => void;
  setBulkNarration: (narration: string) => void;
}

const initial = {
  type: "inbound" as TransferType,
  recipientPhone: "",
  recipientName: "",
  recipientId: "",
  destInstitution: "NEOBANK",
  amountCents: 0,
  currency: "ETB" as SupportedCurrency,
  narration: "",
  isMultiSend: false,
  recipients: [] as ResolvedRecipient[],
};

export const useSendStore = create<SendState>((set) => ({
  ...initial,
  setType: (type) => set({ type }),
  setRecipient: (phone, name, id) =>
    set({ recipientPhone: phone, recipientName: name ?? "", recipientId: id ?? "" }),
  setDestInstitution: (inst) => set({ destInstitution: inst }),
  setAmount: (cents) => set({ amountCents: cents }),
  setCurrency: (c) => set({ currency: c }),
  setNarration: (n) => set({ narration: n }),
  reset: () => set(initial),

  setMultiSend: (on) =>
    set(on ? { isMultiSend: true } : { isMultiSend: false, recipients: [] }),
  addRecipient: (r) =>
    set((s) => ({
      recipients: [...s.recipients, { ...r, amountCents: 0, narration: "" }],
    })),
  removeRecipient: (phone) =>
    set((s) => ({
      recipients: s.recipients.filter((r) => r.phone !== phone),
    })),
  setRecipientAmount: (phone, cents) =>
    set((s) => ({
      recipients: s.recipients.map((r) =>
        r.phone === phone ? { ...r, amountCents: cents } : r,
      ),
    })),
  setRecipientNarration: (phone, narration) =>
    set((s) => ({
      recipients: s.recipients.map((r) =>
        r.phone === phone ? { ...r, narration } : r,
      ),
    })),
  setBulkAmount: (cents) =>
    set((s) => ({
      recipients: s.recipients.map((r) => ({ ...r, amountCents: cents })),
    })),
  setBulkNarration: (narration) =>
    set((s) => ({
      recipients: s.recipients.map((r) => ({ ...r, narration })),
    })),
}));
