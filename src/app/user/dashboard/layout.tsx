"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { UserAccount } from "./components/UserAccount";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarContent = () => {
  const router = useRouter();
  const menuItems = [
    { href: "/user/dashboard", label: "Dashboard" },
    { href: "/user/dashboard/purchase", label: "Purchase plan" },
    { href: "/user/dashboard/trades", label: "Current Trades" },
    { href: "/user/dashboard/earnings", label: "Earnings" },
    { href: "/user/dashboard/deposits", label: "Deposit History" },
    { href: "/user/dashboard/withdraw", label: "Withdraw" },
    { href: "/user/dashboard/mailbox", label: "Mailbox" },
    { href: "/user/dashboard/settings", label: "Account Settings" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className="h-full py-6 flex flex-col">
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            pi-minnet
          </h1>
          <ThemeSwitch />
        </div>
        <div className="mt-4 space-y-2">
          <UserAccount />
        </div>
      </div>
      <Separator className="bg-gray-200 dark:bg-gray-800" />
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center text-sm px-3 py-2 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto px-4">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.replace("/login");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header for mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            >
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            pi-minnet
          </h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 z-30 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="p-8 md:p-8 pt-20 md:pt-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
