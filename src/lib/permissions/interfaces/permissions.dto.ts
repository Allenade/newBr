export const UserPermissions = {
  Roles: {
    admin: "admin",
    user: "user",
  } as const,

  Entities: {
    admin_dashboard: "admin-dashboard",
    user_dashboard: "user-dashboard",
    trades: "trades",
    settings: "settings",
    users: "users",
  } as const,

  Actions: {
    view: "view",
    create: "create",
    update: "update",
    delete: "delete",
    manage: "manage",
  } as const,
} as const;
