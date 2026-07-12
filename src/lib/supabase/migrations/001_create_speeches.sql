create table if not exists public.speeches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  prompt text not null,
  transcript text not null,
  analysis jsonb not null,
  overall_score integer not null check (overall_score between 1 and 10),
  clarity_score integer not null check (clarity_score between 1 and 10),
  confidence_score integer not null check (confidence_score between 1 and 10),
  structure_score integer not null check (structure_score between 1 and 10),
  pace_score integer not null check (pace_score between 1 and 10),
  filler_word_count integer not null default 0 check (filler_word_count >= 0),
  duration_seconds integer not null default 60 check (duration_seconds > 0)
);

create index if not exists speeches_user_created_at_idx
  on public.speeches (user_id, created_at desc);

alter table public.speeches enable row level security;

drop policy if exists "Users can read their own speeches" on public.speeches;
create policy "Users can read their own speeches"
  on public.speeches
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own speeches" on public.speeches;
create policy "Users can insert their own speeches"
  on public.speeches
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own speeches" on public.speeches;
create policy "Users can update their own speeches"
  on public.speeches
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own speeches" on public.speeches;
create policy "Users can delete their own speeches"
  on public.speeches
  for delete
  to authenticated
  using (auth.uid() = user_id);
