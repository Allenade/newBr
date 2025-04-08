-- Drop existing table and policies
drop table if exists public.plans cascade;
drop policy if exists "Plans are viewable by everyone" on public.plans;
drop policy if exists "Authenticated users can modify plans" on public.plans;
drop trigger if exists handle_updated_at on public.plans;

-- Create the plans table
create table public.plans (
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

-- Enable RLS
alter table public.plans enable row level security;

-- Allow anyone to read plans
create policy "Plans are viewable by everyone" 
on public.plans for select 
using (true);

-- Allow any authenticated user to modify plans
create policy "Anyone can modify plans" 
on public.plans for all 
using (true)
with check (true);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the updated_at function
create trigger handle_updated_at
    before update on public.plans
    for each row
    execute function public.handle_updated_at(); 