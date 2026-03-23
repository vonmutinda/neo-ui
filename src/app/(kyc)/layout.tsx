import { PersonalAppShell } from "@/components/shared/PersonalAppShell";

export default function KYCLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersonalAppShell mainClassName="px-4 pb-24 pt-10 md:px-8 md:pb-12 md:pt-12">
      {children}
    </PersonalAppShell>
  );
}
