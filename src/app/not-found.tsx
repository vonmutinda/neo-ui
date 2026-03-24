import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="font-mono text-6xl font-bold text-foreground/20">404</p>
        <h2 className="text-lg font-semibold">Page not found</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
