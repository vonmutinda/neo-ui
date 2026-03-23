import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-2xl",
} as const;

type AvatarSize = keyof typeof SIZE_CLASSES;

interface UserAvatarProps {
  name: string;
  size?: AvatarSize;
  isEnviar?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  size = "md",
  isEnviar = true,
  className,
}: UserAvatarProps) {
  const initial = (name?.[0] ?? "?").toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        isEnviar
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
