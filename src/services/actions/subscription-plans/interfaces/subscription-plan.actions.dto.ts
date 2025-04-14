import { subscriptionPlans } from "@/services/db/schema/subscription-plans.schema";

export namespace SubscriptionPlanActions {
	export type CreatePlanProps = typeof subscriptionPlans.$inferInsert;

	export type UpdatePlanProps = {
		id: string;
		data: Partial<typeof subscriptionPlans.$inferSelect>;
	};
}
