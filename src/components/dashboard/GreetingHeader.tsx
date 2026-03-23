"use client";

import Link from "next/link";

interface GreetingHeaderProps {
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  avatarUrl?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader({
  username,
  firstName,
  lastName,
  avatarUrl,
}: GreetingHeaderProps) {
  const displayName = firstName || username || "there";
  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    (username?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {displayName}
        </h1>
      </div>

      <Link
        href="/profile"
        aria-label="View profile"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-transform active:scale-95"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
            {initials}
          </div>
        )}
      </Link>
    </div>
  );
}
