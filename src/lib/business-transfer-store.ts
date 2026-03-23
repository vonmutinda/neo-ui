import { create } from "zustand";
import type { SupportedCurrency } from "./types";
import type { BusinessTransferType } from "./business-types";

interface BusinessTransferState {
  step: 1 | 2 | 3 | 4;
  transferType: BusinessTransferType;
  recipientPhone: string;
  recipientName: string;
  recipientAccountNumber: string;
  recipientBankCode: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
  purpose: string;
  category: string;

  setStep: (step: 1 | 2 | 3 | 4) => void;
  setTransferType: (type: BusinessTransferType) => void;
  setRecipientPhone: (phone: string) => void;
  setRecipientName: (name: string) => void;
  setRecipientAccountNumber: (num: string) => void;
  setRecipientBankCode: (code: string) => void;
  setAmountCents: (cents: number) => void;
  setCurrencyCode: (code: SupportedCurrency) => void;
  setNarration: (n: string) => void;
  setPurpose: (p: string) => void;
  setCategory: (c: string) => void;
  reset: () => void;
}

const initial = {
  step: 1 as const,
  transferType: "internal" as BusinessTransferType,
  recipientPhone: "",
  recipientName: "",
  recipientAccountNumber: "",
  recipientBankCode: "",
  amountCents: 0,
  currencyCode: "ETB" as SupportedCurrency,
  narration: "",
  purpose: "",
  category: "",
};

export const useBusinessTransferStore = create<BusinessTransferState>(
  (set) => ({
    ...initial,
    setStep: (step) => set({ step }),
    setTransferType: (transferType) => set({ transferType }),
    setRecipientPhone: (recipientPhone) => set({ recipientPhone }),
    setRecipientName: (recipientName) => set({ recipientName }),
    setRecipientAccountNumber: (recipientAccountNumber) =>
      set({ recipientAccountNumber }),
    setRecipientBankCode: (recipientBankCode) => set({ recipientBankCode }),
    setAmountCents: (amountCents) => set({ amountCents }),
    setCurrencyCode: (currencyCode) => set({ currencyCode }),
    setNarration: (narration) => set({ narration }),
    setPurpose: (purpose) => set({ purpose }),
    setCategory: (category) => set({ category }),
    reset: () => set(initial),
  }),
);
