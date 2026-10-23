-- Run this migration in the Supabase SQL Editor before enabling Mini App progress sync.
create table if not exists public.telegram_miniapp_progress (
  telegram_user_id bigint primary key,
  username text,
  first_name text not null default 'Learner',
  seen_question_ids text[] not null default '{}',
  answered_count integer not null default 0 check (answered_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0 and correct_count <= answered_count),
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.telegram_miniapp_progress enable row level security;
revoke all on table public.telegram_miniapp_progress from anon, authenticated;
grant select, insert, update on table public.telegram_miniapp_progress to service_role;
