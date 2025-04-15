"use client";
import React, { useState } from "react";
import Block, { BlockBody } from "@/components/templates/block";
import { useUser } from "@/lib/hooks/user/use-user";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus, Check, Pencil, Trash2 } from "lucide-react";
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
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";
import { profiles as profileSchema } from "@/services/db/schema/profiles.schema";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ComponentProps = Record<string, never>;

const AdminUsersPage: React.FC<ComponentProps> = () => {
  const { profiles, profilesIsLoading, userAbility } = useUser();
  const { updateUser, deleteUser } = useMutateUser();
  const [showExtendedView, setShowExtendedView] = useState(false);
  const [editingProfile, setEditingProfile] = useState<
    typeof profileSchema.$inferSelect | null
  >(null);
  const [editValues, setEditValues] = useState({
    balance: 0,
    earnings: 0,
    bonus: 0,
    tradingPoints: 0,
  });

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

  // ~ ======= Delete the user -->
  const handleDeleteUser = async (id: string) => {
    if (
      userAbility?.cannot(
        UserPermissions.Actions.manage,
        UserPermissions.Entities.admin_dashboard
      )
    ) {
      return toast.error("Not Authorised", {
        description: "You are not authorised to delete users",
      });
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteUser(id);
    }
  };

  const handleEditClick = (profile: typeof profileSchema.$inferSelect) => {
    setEditingProfile(profile);
    setEditValues({
      balance: profile.balance,
      earnings: profile.earnings || 0,
      bonus: profile.bonus || 0,
      tradingPoints: profile.tradingPoints || 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProfile) return;

    await handleUpdateUser(editingProfile.id, {
      balance: editValues.balance,
      earnings: editValues.earnings,
      bonus: editValues.bonus,
      tradingPoints: editValues.tradingPoints,
    });

    setEditingProfile(null);
    toast.success("User financial data updated successfully");
  };

  return (
    <Block>
      <BlockBody>
        {/* ####################################### */}
        {/* -- Top section --> */}
        {/* ####################################### */}
        <div className="mb-6 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="extended-view"
                checked={showExtendedView}
                onCheckedChange={setShowExtendedView}
              />
              <Label htmlFor="extended-view">Extended View</Label>
            </div>
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
                <TableHead>AccountBalance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {showExtendedView && (
                  <>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Trading Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </>
                )}
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
                    {showExtendedView && (
                      <>
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
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                      </>
                    )}
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
                      {showExtendedView && (
                        <>
                          <TableCell>
                            ${profile.earnings?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>
                            ${profile.bonus?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>{profile.tradingPoints || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditClick(profile)}
                                  >
                                    <Pencil size={14} strokeWidth={1.5} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Edit User Financial Data
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="balance"
                                        className="text-right"
                                      >
                                        Balance
                                      </Label>
                                      <Input
                                        id="balance"
                                        type="number"
                                        value={editValues.balance}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            balance:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="earnings"
                                        className="text-right"
                                      >
                                        Earnings
                                      </Label>
                                      <Input
                                        id="earnings"
                                        type="number"
                                        value={editValues.earnings}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            earnings:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="bonus"
                                        className="text-right"
                                      >
                                        Bonus
                                      </Label>
                                      <Input
                                        id="bonus"
                                        type="number"
                                        value={editValues.bonus}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            bonus:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="tradingPoints"
                                        className="text-right"
                                      >
                                        Trading Points
                                      </Label>
                                      <Input
                                        id="tradingPoints"
                                        type="number"
                                        value={editValues.tradingPoints}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            tradingPoints:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button onClick={handleSaveEdit}>
                                      Save Changes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(profile.id)}
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={showExtendedView ? 10 : 6}
                    className="h-24 text-center"
                  >
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
