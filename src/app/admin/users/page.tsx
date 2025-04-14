"use client";
import React from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { useUser } from "@/lib/hooks/user/use-user";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus, User, Check } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMutateUser } from "@/lib/hooks/user/use-mutate-user";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { userRoles } from "@/services/db/schema/profiles.schema";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";
import { profiles as profileSchema } from "@/services/db/schema/profiles.schema";
import { toast } from "sonner";
type ComponentProps = {};

const AdminUsersPage: React.FC<ComponentProps> = ({}) => {
	const { profiles, profilesIsLoading, userAbility } = useUser();
	const { updateUser, isUpdating } = useMutateUser();

	// ~ ======= Update the user -->
	const handleUpdateUser = async (
		id: string,
		updateData: Partial<typeof profileSchema.$inferSelect>
	) => {
		if (
			userAbility?.cannot(
				UserPermissions.Actions.manage,
				UserPermissions.Entities.admin_dashboard
			)
		) {
			return toast.error("Not Authorised", {
				description: "You are not authorised to update user roles",
			});
		}

		updateUser({ id, data: updateData });
	};

	return (
		<Block>
			<BlockBody>
				{/* ####################################### */}
				{/* -- Top section --> */}
				{/* ####################################### */}
				<div className="mb-6 flex items-center justify-between space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
					<div className="flex items-center space-x-2">
						<Button>
							<Plus size={18} strokeWidth={1.5} className="mr-1" /> Add User
						</Button>
					</div>
				</div>

				{/* ####################################### */}
				{/* -- Table section --> */}
				{/* ####################################### */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Balance</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{profilesIsLoading ? (
								// Loading skeletons
								Array.from({ length: 5 }).map((_, index) => (
									<TableRow key={`loading-${index}`}>
										<TableCell>
											<Skeleton className="h-6 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-24" />
										</TableCell>
									</TableRow>
								))
							) : profiles?.length ? (
								profiles
									.sort(
										(a, b) =>
											new Date(a.createdAt).getTime() -
											new Date(b.createdAt).getTime()
									)
									.map((profile) => (
										<TableRow key={profile.id}>
											<TableCell className="font-medium">
												{profile.firstName} {profile.lastName}
												{profile.otherNames && ` ${profile.otherNames}`}
											</TableCell>
											<TableCell>{profile.email}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="flex items-"
														>
															<span className="capitalize">{profile.role}</span>
															<ChevronsUpDown
																size={14}
																strokeWidth={1.5}
																className="ml-2"
															/>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="start">
														{userRoles.enumValues.map((role) => (
															<DropdownMenuItem
																key={role}
																onClick={() =>
																	handleUpdateUser(profile.id, { role })
																}
																disabled={profile.role === role}
															>
																<span className="capitalize">{role}</span>
																{profile.role === role && (
																	<DropdownMenuShortcut>
																		<Check
																			size={14}
																			strokeWidth={1.5}
																			className="ml-2"
																		/>
																	</DropdownMenuShortcut>
																)}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
											<TableCell>${profile.balance.toFixed(2)}</TableCell>
											<TableCell>
												<Badge
													variant={profile.isActive ? "success" : "destructive"}
													className="capitalize"
												>
													{profile.isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(profile.createdAt).toLocaleDateString()}
											</TableCell>
										</TableRow>
									))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										No users found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</BlockBody>
		</Block>
	);
};

export default AdminUsersPage;
