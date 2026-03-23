import { PersonalAppShell } from "@/components/shared/PersonalAppShell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonalAppShell mainClassName="px-4 pb-6 pt-10 md:px-8 md:pb-10 md:pt-12">
      {children}
    </PersonalAppShell>
  );
}
