import { BottomNav } from "@/components/shared/BottomNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { UserProfileLoader } from "@/providers/UserProfileLoader";

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <UserProfileLoader>
        <div className="flex min-h-dvh">
          <Sidebar className="hidden md:flex" />

          <div className="flex flex-1 flex-col md:pl-60">
            <ErrorBoundary>
              <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
                {children}
              </main>
            </ErrorBoundary>
          </div>

          <BottomNav className="md:hidden" />
        </div>
      </UserProfileLoader>
    </AuthGuard>
  );
}
