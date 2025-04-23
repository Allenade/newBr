ALTER TABLE "profiles" ALTER COLUMN "image_url" SET DEFAULT 'https://api.dicebear.com/7.x/shapes/svg?seed=12y86jjucy5';--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "user_transaction_totals" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for users based on role" ON "user_transaction_totals" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() ->> 'role' = 'user' AND user_id = auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable update for admins only" ON "user_transaction_totals" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');