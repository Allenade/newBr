"use client";
import React from "react";
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
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { useUser } from "@/lib/hooks/user/use-user";
import { usePathname } from "next/navigation";
import {
	Cog,
	Coins,
	LayoutDashboard,
	LogOut,
	LucideIcon,
	MessageSquareText,
	NotepadTextDashed,
	User,
	Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ComponentProps = {};

const AdminSidebar: React.FC<ComponentProps> = ({}) => {
	const { isLoadingUser, signOut } = useAuth();
	const { profile, profileIsLoading } = useUser();
	const { state } = useSidebar();
	const pathname = usePathname();

	// ~ ======= Create full name from profile data ======= ~
	const fullName = profile
		? `${profile.firstName} ${profile.lastName}${profile.otherNames ? ` ${profile.otherNames}` : ""}`.trim()
		: "";

	return (
		<Sidebar variant="inset" collapsible="icon">
			{/* ~ =================================== ~ */}
			{/* -- Sidebar header */}
			{/* ~ =================================== ~ */}
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
				</SidebarMenu>
			</SidebarHeader>

			{/* ~ =================================== ~ */}
			{/* -- Sidebar content */}
			{/* ~ =================================== ~ */}
			<SidebarContent>
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

				<SidebarGroup>
					<SidebarSeparator />
					<SidebarGroupContent className="mt-4">
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

			{/* ~ =================================== ~ */}
			{/* -- Footer */}
			{/* ~ =================================== ~ */}
			<SidebarFooter></SidebarFooter>
		</Sidebar>
	);
};

export default AdminSidebar;

// ~ ======= Sidebar menu links  ======= ~
const sidebarLinks: { label: string; icon: LucideIcon; href: string }[] = [
	{ href: "/admin/overview", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/admin/transactions", label: "Transactions", icon: Coins },
	{
		href: "/admin/users",
		label: "Users",
		icon: Users,
	},
	{
		href: "/admin/plans",
		label: "Plans",
		icon: NotepadTextDashed,
	},
	{
		href: "/admin/mailbox",
		label: "Mailbox",
		icon: MessageSquareText,
	},
	{ href: "/admin/settings", label: "Account Settings", icon: Cog },
];
