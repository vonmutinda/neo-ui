import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-dvh">
        <AdminSidebar />
        <div className="flex flex-1 flex-col pl-64">
          <AdminHeader />
          <main className="flex-1 bg-background p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
