"use client";

import Link from "next/link";

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl text-destructive">
        !
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t load this page. Please try again.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground/60">
            {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/business"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Business home
        </Link>
      </div>
    </div>
  );
}
