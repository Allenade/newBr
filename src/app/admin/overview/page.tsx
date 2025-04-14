"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Wallet,
  Coins,
  TrendingUp,
  Gift,
  DollarSign,
  ChevronsUpDown,
  Check,
  UserCog,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/hooks/user/use-user";
import { useMutateUser } from "@/lib/hooks/user/use-mutate-user";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";
import { toast } from "sonner";
import { userRoles } from "@/services/db/schema/profiles.schema";

type ComponentProps = {};

const AdminOverviewPage: React.FC<ComponentProps> = ({}) => {
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

  // Calculate metrics from actual data
  const metrics = {
    totalUsers: profiles?.length || 0,
    totalAdmins:
      profiles?.filter((profile) => profile.role === "admin").length || 0,
    totalBalance:
      profiles?.reduce((sum, profile) => sum + profile.balance, 0) || 0,
    totalPoints:
      profiles?.reduce(
        (sum, profile) => sum + (profile.tradingPoints || 0),
        0
      ) || 0,
    totalEarnings:
      profiles?.reduce((sum, profile) => sum + (profile.earnings || 0), 0) || 0,
    totalBonus:
      profiles?.reduce((sum, profile) => sum + (profile.bonus || 0), 0) || 0,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">
                  {metrics.totalUsers.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <UserCog className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Admins</p>
                <h3 className="text-2xl font-bold">
                  {metrics.totalAdmins.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <h3 className="text-2xl font-bold">
                  ${metrics.totalBalance.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Points</p>
                <h3 className="text-2xl font-bold">
                  {metrics.totalPoints.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <h3 className="text-2xl font-bold">
                  ${metrics.totalEarnings.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-full">
                <Gift className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bonus</p>
                <h3 className="text-2xl font-bold">
                  ${metrics.totalBonus.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recent User Registrations
        </h2>
        <Card>
          <CardContent className="p-6">
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
                                  <span className="capitalize">
                                    {profile.role}
                                  </span>
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
                              variant={
                                profile.isActive ? "success" : "destructive"
                              }
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
