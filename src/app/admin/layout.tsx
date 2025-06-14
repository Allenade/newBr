"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";
import { toast } from "sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import UserNavBar from "@/components/navigation/user-navbar";
import AdminSidebar from "@/components/navigation/admin-sidebar";
import { useUser } from "@/lib/hooks/user/use-user";

type ComponentProps = {
  children: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const AdminDashboardLayout: React.FC<ComponentProps> = ({ children }) => {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const { userAbility, profileIsLoading } = useUser();

  // ~ ======= Loading state ======= ~
  if (isLoadingUser || profileIsLoading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  // ~ ======= There is no user  ======= ~
  if (!user && !isLoadingUser) {
    router.push("/auth/signin");
    return null;
  }

  // ~ ======= Check that the user has admin access -->
  if (
    userAbility?.cannot(
      UserPermissions.Actions.view,
      UserPermissions.Entities.admin_dashboard
    )
  ) {
    console.log("Admin Layout - User is not admin, or ability is not loaded.");
    console.log("Admin Layout - User email:", user?.email);
    console.log("Admin Layout - User ability rules:", userAbility?.rules);
    console.log(
      "Admin Layout - NEXT_PUBLIC_ADMIN_EMAIL:",
      process.env.NEXT_PUBLIC_ADMIN_EMAIL
    );
    if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      // ~ ======= Redirect to user dashboard -->
      toast.error("You do not have access to this page");
      return router.replace("/user/dashboard/overview");
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="overflow-hidden backdrop-blur-[2px]">
        <main className="bg-background w-full h-full overflow-hidden">
          <UserNavBar />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
