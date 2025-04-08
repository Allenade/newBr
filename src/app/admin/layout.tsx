"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  Wallet,
  ShieldCheck,
  LineChart,
  Ticket,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";

// Admin credentials
const ADMIN_EMAIL = "allenumunade@gmail.com";

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarContent = () => {
  const router = useRouter();
  const menuItems = [
    { href: "/admin/dashboard", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/trades", label: "Trade Analytics", icon: LineChart },
    { href: "/admin/transactions", label: "Transactions", icon: Wallet },
    { href: "/admin/plans", label: "Plans", icon: Ticket },
    // { href: "/admin/wallet", label: "Wallet", icon: DollarSign },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className="h-full py-6 flex flex-col bg-gray-900">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 px-2">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto px-6 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2 py-3 text-gray-300">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">Admin User</p>
            <p className="text-xs text-gray-400">{ADMIN_EMAIL}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function RootLayout({ children }: LayoutProps) {
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
          return;
        }

        // Check if the logged-in user is the admin
        if (session.user.email !== ADMIN_EMAIL) {
          router.replace("/user/dashboard");
          return;
        }

        setIsLoading(false);
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

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-gray-900">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-gray-900">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto py-8 px-4 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
