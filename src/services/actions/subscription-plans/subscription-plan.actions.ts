"use server";

import db from "@/services/db";
import { getSingle } from "@/lib/utils";
import { subscriptionPlans } from "@/services/db/schema/subscription-plans.schema";
import { eq } from "drizzle-orm";
// ~ =============================================>
// ~ ======= Create a subscription plan  -->
// ~ =============================================>
export const createSubscriptionPlanAction = async (
	args: typeof subscriptionPlans.$inferInsert
) => {
	return await getSingle(db.insert(subscriptionPlans).values(args));
};

// ~ =============================================>
// ~ ======= Get all subscription plans  -->
// ~ =============================================>
export const getAllSubscriptionPlansAction = async (): Promise<
	(typeof subscriptionPlans.$inferSelect)[]
> => {
	return db.select().from(subscriptionPlans) as Promise<
		(typeof subscriptionPlans.$inferSelect)[]
	>;
};

// ~ =============================================>
// ~ ======= Get a subscription plan  -->
// ~ =============================================>
export const getSubscriptionPlanAction = async (id: string) => {
	return await getSingle(
		db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id))
	);
};

// ~ =============================================>
// ~ ======= Update a subscription plan  -->
// ~ =============================================>
export const updateSubscriptionPlanAction = async (
	id: string,
	args: Partial<typeof subscriptionPlans.$inferSelect>
) => {
	return await getSingle(
		db
			.update(subscriptionPlans)
			.set(args)
			.where(eq(subscriptionPlans.id, id))
			.returning()
	);
};

// ~ =============================================>
// ~ ======= Delete a subscription plan  -->
// ~ =============================================>
export const deleteSubscriptionPlanAction = async (id: string) => {
	return await getSingle(
		db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id)).returning()
	);
};
