export namespace Permissions {
  export enum Roles {
    admin = "admin",
    user = "user",
  }

  export enum Entities {
    admin_dashboard = "admin-dashboard",
    user_dashboard = "user-dashboard",
    trades = "trades",
    settings = "settings",
    users = "users",
  }

  export enum Actions {
    view = "view",
    create = "create",
    update = "update",
    delete = "delete",
    manage = "manage",
  }
}
