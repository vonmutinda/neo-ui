import { create } from "zustand";
import type { SupportedCurrency } from "./types";
import type { BusinessTransferType } from "./business-types";

interface BusinessTransferState {
  step: 1 | 2 | 3 | 4;
  transferType: BusinessTransferType;
  recipientPhone: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  amountCents: number;
  currencyCode: SupportedCurrency;
  narration: string;
  categoryId: string;

  setStep: (step: 1 | 2 | 3 | 4) => void;
  setTransferType: (type: BusinessTransferType) => void;
  setRecipientPhone: (phone: string) => void;
  setRecipientName: (name: string) => void;
  setRecipientAccount: (num: string) => void;
  setRecipientBank: (code: string) => void;
  setAmountCents: (cents: number) => void;
  setCurrencyCode: (code: SupportedCurrency) => void;
  setNarration: (n: string) => void;
  setCategoryId: (c: string) => void;
  reset: () => void;
}

const initial = {
  step: 1 as const,
  transferType: "internal" as BusinessTransferType,
  recipientPhone: "",
  recipientName: "",
  recipientAccount: "",
  recipientBank: "",
  amountCents: 0,
  currencyCode: "ETB" as SupportedCurrency,
  narration: "",
  categoryId: "",
};

export const useBusinessTransferStore = create<BusinessTransferState>(
  (set) => ({
    ...initial,
    setStep: (step) => set({ step }),
    setTransferType: (transferType) => set({ transferType }),
    setRecipientPhone: (recipientPhone) => set({ recipientPhone }),
    setRecipientName: (recipientName) => set({ recipientName }),
    setRecipientAccount: (recipientAccount) => set({ recipientAccount }),
    setRecipientBank: (recipientBank) => set({ recipientBank }),
    setAmountCents: (amountCents) => set({ amountCents }),
    setCurrencyCode: (currencyCode) => set({ currencyCode }),
    setNarration: (narration) => set({ narration }),
    setCategoryId: (categoryId) => set({ categoryId }),
    reset: () => set(initial),
  }),
);
