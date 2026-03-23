import { PersonalAppShell } from "@/components/shared/PersonalAppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonalAppShell
      mobileNavigation="sheet"
      showOfflineBanner
      mainClassName="px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8"
    >
      {children}
    </PersonalAppShell>
  );
}
