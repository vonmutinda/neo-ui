import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { UserProfileLoader } from "@/providers/UserProfileLoader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <UserProfileLoader>
        <OfflineBanner />
        <div className="flex min-h-dvh">
          <Sidebar className="hidden md:flex" />

          <div className="flex flex-1 flex-col md:pl-60">
            <MobileNav className="md:hidden" />
            <ErrorBoundary>
              <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-4 md:px-10 md:pb-12 md:pt-10">
                {children}
              </main>
            </ErrorBoundary>
          </div>
        </div>
      </UserProfileLoader>
    </AuthGuard>
  );
}
