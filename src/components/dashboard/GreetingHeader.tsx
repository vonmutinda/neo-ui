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

function formatDate(): string {
  return new Intl.DateTimeFormat("en-ET", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();
}

export function GreetingHeader({
  username,
  firstName,
  lastName,
  avatarUrl,
}: GreetingHeaderProps) {
  const displayName = username || firstName || "there";
  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || (username?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {formatDate()}
        </p>
        <h1 className="text-xl font-bold md:text-2xl">
          {getGreeting()}, {displayName}
        </h1>
      </div>

      <Link
        href="/profile"
        aria-label="View profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {initials}
          </div>
        )}
      </Link>
    </div>
  );
}
