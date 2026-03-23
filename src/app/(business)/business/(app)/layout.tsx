import { BusinessAppShell } from "@/components/business/BusinessAppShell";

export default function BusinessAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessAppShell>{children}</BusinessAppShell>;
}
