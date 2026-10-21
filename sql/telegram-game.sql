create table if not exists public.telegram_players (
 telegram_user_id bigint primary key,
 username text,
 first_name text not null default 'Learner',
 xp integer not null default 0 check (xp >= 0),
 current_question_id text,
 streak integer not null default 0 check (streak >= 0),
 last_played_on date,
 answered_count integer not null default 0 check (answered_count >= 0),
 correct_count integer not null default 0 check (correct_count >= 0 and correct_count <= answered_count),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.telegram_players enable row level security;
revoke all on table public.telegram_players from anon, authenticated;
grant select, insert, update on table public.telegram_players to service_role;
