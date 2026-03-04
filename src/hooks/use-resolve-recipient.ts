"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { RecipientInfo } from "@/lib/types";

export function useResolveRecipient() {
  return useMutation<RecipientInfo, Error, string>({
    mutationFn: (identifier) =>
      api.get<RecipientInfo>(
        `/v1/users/resolve?identifier=${encodeURIComponent(identifier)}`
      ),
  });
}
