CREATE TYPE "public"."payment_methods_types" AS ENUM('CRYPTO', 'BANK');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."trade_type" AS ENUM('buy', 'sell', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "payment_methods_types" DEFAULT 'CRYPTO',
	"enabled" boolean DEFAULT true,
	"details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"other_names" text,
	"image_url" text DEFAULT 'https://api.dicebear.com/7.x/shapes/svg?seed=lwi3xe972bq',
	"email" text NOT NULL,
	"subscriptionPlanId" uuid,
	"balance" real DEFAULT 0 NOT NULL,
	"bonus" real DEFAULT 0 NOT NULL,
	"earnings" real DEFAULT 0 NOT NULL,
	"trading_points" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"role" "user_roles" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric,
	"duration" numeric,
	"features" text[],
	"bonus_amount" numeric,
	"return_percent" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "total_deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"total_amount" numeric DEFAULT '0' NOT NULL,
	"balance" numeric DEFAULT '0' NOT NULL,
	"bonus" numeric DEFAULT '0' NOT NULL,
	"earnings" numeric DEFAULT '0' NOT NULL,
	"trading_points" numeric DEFAULT '0' NOT NULL,
	"last_deposit_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "total_deposits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trades_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"plan_id" uuid,
	"user_name" text,
	"plan_name" text,
	"trade_type" "trade_type" NOT NULL,
	"amount" numeric NOT NULL,
	"price" numeric NOT NULL,
	"total_value" numeric NOT NULL,
	"status" "trade_status" DEFAULT 'pending',
	"description" text,
	"admin_notes" text,
	"last_modified_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "trades_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transaction_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid,
	"user_id" uuid,
	"plan_id" uuid,
	"user_name" text,
	"plan_name" text,
	"amount" numeric,
	"status" "transaction_status",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profileId" uuid,
	"subscriptionPlanId" uuid,
	"amount" numeric,
	"status" "transaction_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_transaction_totals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" numeric NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_transaction_totals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "total_deposits" ADD CONSTRAINT "total_deposits_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades_history" ADD CONSTRAINT "trades_history_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades_history" ADD CONSTRAINT "trades_history_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades_history" ADD CONSTRAINT "trades_history_last_modified_by_profiles_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscriptionPlanId_subscription_plans_id_fk" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transaction_totals" ADD CONSTRAINT "user_transaction_totals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_transaction_totals_user_id_type_unique" ON "user_transaction_totals" USING btree ("user_id","type");--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable update for users based on email" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.jwt() ->> "email")::text = email) WITH CHECK ((auth.jwt() ->> 'email')::text = email);--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "total_deposits" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for users based on role" ON "total_deposits" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() ->> 'role' = 'user' AND user_id = auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable update for admins only" ON "total_deposits" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "trades_history" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for users based on role" ON "trades_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() ->> 'role' = 'user' AND user_id = auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable update for admins only" ON "trades_history" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');