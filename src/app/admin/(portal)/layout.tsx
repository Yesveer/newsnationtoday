import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <SidebarProvider data-admin-theme>
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-bg">
          <AdminHeader />
          <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 sm:p-5 lg:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
