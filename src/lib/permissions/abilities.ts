import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { UserPermissions } from "@/lib/permissions/interfaces/permissions.dto";

export const defineAbility = (
  role: (typeof UserPermissions.Roles)[keyof typeof UserPermissions.Roles]
) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // ~ ======= Admin access ======= ~
  if (role === UserPermissions.Roles.admin) {
    can(
      UserPermissions.Actions.manage,
      UserPermissions.Entities.admin_dashboard
    );
    can(UserPermissions.Actions.view, UserPermissions.Entities.admin_dashboard);
    can(UserPermissions.Actions.manage, UserPermissions.Entities.users);
    can(UserPermissions.Actions.manage, UserPermissions.Entities.trades);
  }

  // ~ ======= User access ======= ~
  if (role === UserPermissions.Roles.user) {
    can(
      UserPermissions.Actions.manage,
      UserPermissions.Entities.user_dashboard
    );
    cannot(
      UserPermissions.Actions.manage,
      UserPermissions.Entities.admin_dashboard
    );
    cannot(
      UserPermissions.Actions.view,
      UserPermissions.Entities.admin_dashboard
    );
  }

  return build();
};
