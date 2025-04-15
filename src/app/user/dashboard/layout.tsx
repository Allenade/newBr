"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import UserSidebar from "@/components/navigation/user-sidebar";
import UserNavBar from "@/components/navigation/user-navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  // ~ ======= Loading state ======= ~
  if (isLoadingUser) {
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

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset className="overflow-hidden backdrop-blur-[2px]">
        <main className="bg-background w-full h-full overflow-hidden">
          <UserNavBar />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
