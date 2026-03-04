import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminChangePasswordRequest,
  AdminStaff,
} from "@/lib/admin-types";

export function useAdminLogin() {
  const login = useAdminAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (req: AdminLoginRequest) => {
      const res = await adminApi.post<AdminLoginResponse>("/auth/login", req);
      login(res.token, res.staff);
      return res;
    },
  });
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: (req: AdminChangePasswordRequest) =>
      adminApi.post<void>("/auth/change-password", req),
  });
}

export function useAdminMe() {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => adminApi.get<AdminStaff>("/staff/me"),
    enabled: !!token,
  });
}

export function useAdminLogout() {
  const logout = useAdminAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return () => {
    logout();
    queryClient.removeQueries({ queryKey: ["admin"] });
  };
}
