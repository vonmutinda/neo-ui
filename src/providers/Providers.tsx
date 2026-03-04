"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const TelegramProvider = dynamic(
  () => import("./TelegramProvider").then((m) => m.TelegramProvider),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <AuthProvider>
          <TelegramProvider>
            {children}
            <Toaster position="top-center" richColors />
          </TelegramProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
