"use client";

import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
