import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedCurrency } from "@/lib/types";

interface DisplayCurrencyState {
  displayCurrency: SupportedCurrency;
  setDisplayCurrency: (currency: SupportedCurrency) => void;
}

export const useDisplayCurrency = create<DisplayCurrencyState>()(
  persist(
    (set) => ({
      displayCurrency: "ETB",
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    }),
    {
      name: "enviar-display-currency",
    },
  ),
);
