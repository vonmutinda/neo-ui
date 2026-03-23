import { create } from "zustand";
import type { Business } from "@/lib/business-types";

const BIZ_ID_KEY = "enviar_active_business_id";

interface BusinessState {
  activeBusinessId: string | null;
  activeBusiness: Business | null;
  setActiveBusiness: (biz: Business) => void;
  setActiveBusinessId: (id: string) => void;
  clearBusiness: () => void;
  hydrate: () => void;
}

function getStorage(): Storage | null {
  return typeof window !== "undefined" ? sessionStorage : null;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  activeBusinessId: null,
  activeBusiness: null,

  setActiveBusiness: (biz: Business) => {
    const s = getStorage();
    s?.setItem(BIZ_ID_KEY, biz.id);
    set({ activeBusinessId: biz.id, activeBusiness: biz });
  },

  setActiveBusinessId: (id: string) => {
    const s = getStorage();
    s?.setItem(BIZ_ID_KEY, id);
    set({ activeBusinessId: id });
  },

  clearBusiness: () => {
    getStorage()?.removeItem(BIZ_ID_KEY);
    set({ activeBusinessId: null, activeBusiness: null });
  },

  hydrate: () => {
    const s = getStorage();
    if (!s) return;
    const id = s.getItem(BIZ_ID_KEY);
    if (id) {
      set({ activeBusinessId: id });
    }
  },
}));
