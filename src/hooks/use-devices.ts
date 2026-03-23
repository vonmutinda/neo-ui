"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Device } from "@/lib/types";

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: () => api.get<Device[]>("/v1/devices"),
  });
}

export function useRegisterDevice() {
  const qc = useQueryClient();
  return useMutation<Device, Error, Partial<Device>>({
    mutationFn: (req) => api.post<Device>("/v1/devices", req),
    onSuccess: () => {
      toast.success("Device registered");
      qc.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (err) => {
      toast.error("Failed to register device", { description: err.message });
    },
  });
}

export function useUnregisterDevice() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/v1/devices/${id}`),
    onSuccess: () => {
      toast.success("Device unregistered");
      qc.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (err) => {
      toast.error("Failed to unregister device", {
        description: err.message,
      });
    },
  });
}
