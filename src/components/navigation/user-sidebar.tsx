"use client";

import React, { FC } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Cog,
  HistoryIcon,
  LayoutDashboard,
  LogOut,
  Coins,
  User,
  LucideIcon,
  Calendar,
  NotepadTextDashed,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/user/use-user";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

type ComponentProps = Record<string, never>;

const UserSidebar: FC<ComponentProps> = ({}) => {
  const { isLoadingUser, signOut } = useAuth();
  const { profile, profileIsLoading } = useUser();
  const { state } = useSidebar();
  const pathname = usePathname();

  // ~ ======= Create full name from profile data ======= ~
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}${profile.otherNames ? ` ${profile.otherNames}` : ""}`.trim()
    : "";

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* ####################################### */}
      {/* -- Header  --> */}
      {/* ####################################### */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "collapsed" ? (
              <SidebarMenuButton>
                <User size={18} strokeWidth={1.3} />
              </SidebarMenuButton>
            ) : profileIsLoading || isLoadingUser ? (
              <div className="w-full py-4 px-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full py-4 px-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={profile?.imageUrl || ""}
                      alt={fullName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3
                      className={cn(
                        "font-medium leading-none text-sm",
                        !fullName && "text-muted-foreground"
                      )}
                    >
                      {fullName || "Anonymous User"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {profile?.email || "No email provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />

      {/* ####################################### */}
      {/* -- Content --> */}
      {/* ####################################### */}
      <SidebarContent className="mt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* ~ ======= Nav link loop ======= ~ */}
              {sidebarLinks.map((link) => (
                <SidebarMenuItem key={link.href} className="cursor-pointer">
                  <Link href={link.href} passHref>
                    <SidebarMenuButton isActive={pathname.includes(link.href)}>
                      <link.icon size={18} strokeWidth={1.3} />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-destructive"
                  onClick={signOut}
                >
                  <LogOut size={18} strokeWidth={1.3} />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ####################################### */}
      {/* -- Footer --> */}
      {/* ####################################### */}
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;

// ~ ======= Sidebar menu links  ======= ~
const sidebarLinks: { label: string; icon: LucideIcon; href: string }[] = [
  {
    href: "/user/dashboard/overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/user/dashboard/purchase",
    label: "Purchase plan",
    icon: NotepadTextDashed,
  },
  {
    href: "/user/dashboard/total-deposits",
    label: "Total Deposits",
    icon: Coins,
  },
  // {
  //   href: "/user/dashboard/transactions",
  //   label: "Transactions History",
  //   icon: HistoryIcon,
  // },
  {
    href: "/user/dashboard/trades",
    label: "Trades",
    icon: Calendar,
  },
  {
    href: "/user/dashboard/deposits",
    label: "Transactions",
    icon: HistoryIcon,
  },
  { href: "/user/dashboard/settings", label: "Account Settings", icon: Cog },
];
