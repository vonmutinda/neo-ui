import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageTransition } from "@/components/shared/PageTransition";
import { BusinessContextLoader } from "@/components/business/BusinessContextLoader";
import { BusinessSidebar } from "@/components/business/BusinessSidebar";
import { cn } from "@/lib/utils";

type BusinessAppShellProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

/** Auth + profile are provided by `(business)/layout.tsx`. */
export function BusinessAppShell({
  children,
  className,
  mainClassName,
}: BusinessAppShellProps) {
  return (
    <BusinessContextLoader>
      <div className={cn("flex min-h-dvh bg-background", className)}>
        <div className="flex w-full flex-1 flex-col md:max-w-6xl md:mx-auto md:flex-row">
          {/* Spacer for fixed sidebar */}
          <div className="hidden w-60 shrink-0 md:block" aria-hidden />
          <BusinessSidebar className="hidden md:flex" />

          <div className="flex min-w-0 flex-1 flex-col">
            <ErrorBoundary>
              <main
                className={cn(
                  "min-w-0 flex-1 px-4 pb-22 pt-10 md:px-10 md:pb-10 md:pt-12",
                  mainClassName,
                )}
              >
                <PageTransition>{children}</PageTransition>
              </main>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </BusinessContextLoader>
  );
}
