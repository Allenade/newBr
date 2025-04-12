import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { Permissions } from "@/lib/permissions/interfaces/permissions.dto";

export const defineAbility = (role: Permissions.Roles) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // ~ ======= Admin access ======= ~
  if (role === Permissions.Roles.admin) {
    can(Permissions.Actions.view, Permissions.Entities.admin_dashboard);
    can(Permissions.Actions.manage, Permissions.Entities.users);
    can(Permissions.Actions.manage, Permissions.Entities.trades);
  }

  // ~ ======= User access ======= ~
  if (role === Permissions.Roles.user) {
    can(Permissions.Actions.manage, Permissions.Entities.user_dashboard);
    cannot(Permissions.Actions.manage, Permissions.Entities.admin_dashboard);
  }

  return build();
};
