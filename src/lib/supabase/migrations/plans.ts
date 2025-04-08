import { createClient } from "../server";
import { cookies } from "next/headers";

export async function createPlansTable() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Create the plans table
    const { error: tableError } = await supabase.rpc("create_plans_table", {
      sql: `
        create table if not exists public.plans (
          id uuid default gen_random_uuid() primary key,
          name text not null,
          description text,
          price numeric not null,
          return_percentage numeric not null,
          bonus_amount numeric not null,
          duration text not null,
          features jsonb not null default '[]'::jsonb,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `,
    });

    if (tableError) {
      console.error("Error creating plans table:", tableError);
      return { error: tableError };
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc("enable_rls", {
      table_name: "plans",
    });

    if (rlsError) {
      console.error("Error enabling RLS:", rlsError);
      return { error: rlsError };
    }

    // Create policies
    const { error: policiesError } = await supabase.rpc("create_policies", {
      sql: `
        -- Allow anyone to read plans
        create policy "Plans are viewable by everyone" 
        on public.plans for select 
        using (true);

        -- Only allow authenticated users with admin role to modify plans
        create policy "Only admins can modify plans" 
        on public.plans for all 
        using (
          auth.uid() in (
            select auth.uid() 
            from auth.users 
            where raw_user_meta_data->>'role' = 'admin'
          )
        ) 
        with check (
          auth.uid() in (
            select auth.uid() 
            from auth.users 
            where raw_user_meta_data->>'role' = 'admin'
          )
        );
      `,
    });

    if (policiesError) {
      console.error("Error creating policies:", policiesError);
      return { error: policiesError };
    }

    // Create updated_at trigger
    const { error: triggerError } = await supabase.rpc("create_trigger", {
      sql: `
        create or replace function public.handle_updated_at()
        returns trigger as $$
        begin
          new.updated_at = timezone('utc'::text, now());
          return new;
        end;
        $$ language plpgsql security definer;

        create trigger handle_updated_at
        before update on public.plans
        for each row
        execute function public.handle_updated_at();
      `,
    });

    if (triggerError) {
      console.error("Error creating trigger:", triggerError);
      return { error: triggerError };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createPlansTable:", error);
    return { error };
  }
}
