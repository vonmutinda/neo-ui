"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

type FieldErrors = Record<string, string>;

/**
 * Lightweight form validation hook that works with existing useState patterns.
 * Validates on demand (not on every keystroke).
 *
 * Usage:
 *   const { errors, validate, clearField } = useFormErrors(schema, formData);
 *   function handleSubmit() {
 *     if (!validate()) return;
 *     // proceed with submission
 *   }
 */
export function useFormErrors<T extends Record<string, unknown>>(
  schema: z.ZodType<unknown>,
  data: T,
) {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (path && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  }, [schema, data]);

  const clearField = useCallback((field: string) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearField, clearAll };
}
