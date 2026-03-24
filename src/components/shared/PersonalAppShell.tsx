import { AuthGuard } from "@/components/shared/AuthGuard";
import { BottomNav } from "@/components/shared/BottomNav";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { MobileNav } from "@/components/shared/MobileNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { PageTransition } from "@/components/shared/PageTransition";
import { Sidebar } from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { UserProfileLoader } from "@/providers/UserProfileLoader";

type PersonalAppShellProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  mobileNavigation?: "sheet" | "bottom";
  showOfflineBanner?: boolean;
};

export function PersonalAppShell({
  children,
  className,
  mainClassName,
  mobileNavigation = "bottom",
  showOfflineBanner = false,
}: PersonalAppShellProps) {
  return (
    <AuthGuard>
      <UserProfileLoader>
        {showOfflineBanner ? <OfflineBanner /> : null}
        <div className={cn("flex min-h-dvh bg-background", className)}>
          {/* Desktop: single centered block (sidebar + content); mobile: content only */}
          <div className="flex w-full flex-1 flex-col md:max-w-6xl md:mx-auto md:flex-row">
            {/* Spacer so content starts after sidebar; sidebar is fixed and positioned at left of this block */}
            <div className="hidden w-56 shrink-0 md:block" aria-hidden />
            <Sidebar className="hidden md:flex" />

            <div className="flex min-w-0 flex-1 flex-col">
              {mobileNavigation === "sheet" ? (
                <MobileNav className="md:hidden" />
              ) : null}

              <ErrorBoundary>
                <main
                  id="main-content"
                  className={cn(
                    "min-w-0 flex-1 px-4 pb-22 pt-10 md:px-8 md:pb-10 md:pt-12",
                    mainClassName,
                  )}
                >
                  <PageTransition>{children}</PageTransition>
                </main>
              </ErrorBoundary>
            </div>
          </div>

          {mobileNavigation === "bottom" ? (
            <BottomNav className="md:hidden" />
          ) : null}
        </div>
      </UserProfileLoader>
    </AuthGuard>
  );
}
