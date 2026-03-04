export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 dark:border dark:border-border md:p-8">
        {children}
      </div>
    </div>
  );
}
