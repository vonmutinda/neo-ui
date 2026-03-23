"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { NotificationPreferences } from "@/lib/types";

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: ["notification-preferences"],
    queryFn: () =>
      api.get<NotificationPreferences>("/v1/notifications/preferences"),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation<NotificationPreferences, Error, NotificationPreferences>({
    mutationFn: (req) =>
      api.put<NotificationPreferences>("/v1/notifications/preferences", req),
    onSuccess: () => {
      toast.success("Notification preferences updated");
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: (err) => {
      toast.error("Failed to update notification preferences", {
        description: err.message,
      });
    },
  });
}
