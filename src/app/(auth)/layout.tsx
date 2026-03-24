import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create your Enviar account. Send money across borders with ease.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 md:py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)] md:p-8">
        {children}
      </div>
    </div>
  );
}
