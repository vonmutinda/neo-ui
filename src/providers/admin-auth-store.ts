import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminStaff, StaffRole } from "@/lib/admin-types";
import { ROLE_PERMISSIONS } from "@/lib/admin-types";

interface AdminAuthState {
  token: string | null;
  staff: AdminStaff | null;
  login: (token: string, staff: AdminStaff) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      staff: null,

      login: (token: string, staff: AdminStaff) => {
        set({ token, staff });
      },

      logout: () => {
        set({ token: null, staff: null });
      },

      isAuthenticated: () => {
        return get().token !== null && get().staff !== null;
      },

      hasPermission: (permission: string) => {
        const { staff } = get();
        if (!staff) return false;
        const perms = ROLE_PERMISSIONS[staff.role as StaffRole];
        return perms?.includes(permission) ?? false;
      },
    }),
    {
      name: "enviar-admin-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, staff: state.staff }),
    },
  ),
);
