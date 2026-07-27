create type public.quest_difficulty as enum ('easy', 'medium', 'bold');
create type public.proof_status as enum ('normal', 'evidence_limited', 'revoked');
create schema if not exists private;

create table public.pilot_invites (
  email text primary key check (email = lower(trim(email))),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(trim(email))),
  display_name text not null check (char_length(display_name) between 1 and 60),
  cohort text not null default '18-24' check (cohort = '18-24'),
  city text not null default 'Kuala Lumpur',
  interests text[] not null default '{}',
  lifetime_xp integer not null default 0 check (lifetime_xp >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_streak_date date,
  created_at timestamptz not null default now()
);

create table public.quest_templates (
  id bigint generated always as identity primary key,
  title text not null,
  prompt text not null,
  difficulty public.quest_difficulty not null,
  xp integer not null check (xp in (50, 80, 120)),
  skills text[] not null check (cardinality(skills) between 1 and 3),
  venue_types text[] not null default '{}',
  duration_minutes integer not null check (duration_minutes between 5 and 180),
  safety_note text not null,
  active boolean not null default true
);

create table public.venues (
  id bigint generated always as identity primary key,
  name text not null,
  city text not null,
  category text not null,
  accessibility_note text,
  hours_source text,
  last_verified_at timestamptz not null,
  active boolean not null default true
);

create table public.daily_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  template_id bigint not null references public.quest_templates(id),
  venue_id bigint references public.venues(id),
  local_date date not null,
  slot smallint not null check (slot between 1 and 3),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, local_date, slot)
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  assignment_id uuid not null unique references public.daily_assignments(id) on delete cascade,
  idempotency_key uuid not null,
  did_text text not null check (char_length(did_text) between 12 and 2000),
  learned_text text not null check (char_length(learned_text) between 12 and 2000),
  evidence_path text,
  evidence_sha256 text,
  status public.proof_status not null default 'normal',
  created_at timestamptz not null default now(),
  unique (user_id, assignment_id, idempotency_key)
);

create table public.proof_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  completion_id uuid not null unique references public.completions(id) on delete cascade,
  public_code text not null unique default ('QM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  assessed_skills text[] not null,
  status public.proof_status not null default 'normal',
  created_at timestamptz not null default now()
);

create table public.xp_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  source_key text not null,
  amount integer not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, source_key)
);

create table public.user_achievements (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  introduction text not null default '',
  created_at timestamptz not null default now()
);

create table public.portfolio_cards (
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  proof_card_id uuid not null references public.proof_cards(id) on delete cascade,
  position smallint not null default 0,
  primary key (portfolio_id, proof_card_id)
);

create table public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  proof_card_id uuid references public.proof_cards(id) on delete cascade,
  token_hash text not null unique,
  scope text not null check (scope in ('portfolio', 'card_status', 'peer_verification', 'review_withdrawal')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check ((portfolio_id is not null)::int + (proof_card_id is not null)::int <= 1)
);

create table public.peer_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  proof_card_id uuid not null references public.proof_cards(id) on delete cascade,
  token_id uuid not null unique references public.share_tokens(id) on delete cascade,
  confirmed boolean not null,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 2000),
  portfolio_consent boolean not null default false,
  approved boolean not null default false,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.deletion_tombstones (
  user_hash text primary key,
  expires_at timestamptz not null
);

create index daily_assignments_user_date_idx on public.daily_assignments (user_id, local_date);
create index daily_assignments_template_idx on public.daily_assignments (template_id);
create index daily_assignments_venue_idx on public.daily_assignments (venue_id) where venue_id is not null;
create index completions_assignment_idx on public.completions (assignment_id);
create index proof_cards_user_created_idx on public.proof_cards (user_id, created_at desc);
create index proof_cards_completion_idx on public.proof_cards (completion_id);
create index portfolios_user_idx on public.portfolios (user_id);
create index portfolio_cards_proof_idx on public.portfolio_cards (proof_card_id);
create index share_tokens_user_idx on public.share_tokens (user_id);
create index share_tokens_portfolio_idx on public.share_tokens (portfolio_id) where portfolio_id is not null;
create index share_tokens_proof_idx on public.share_tokens (proof_card_id) where proof_card_id is not null;
create index share_tokens_hash_active_idx on public.share_tokens (token_hash) where revoked_at is null;
create index peer_verifications_user_idx on public.peer_verifications (user_id);
create index peer_verifications_proof_idx on public.peer_verifications (proof_card_id);
create index reviews_user_idx on public.reviews (user_id);

alter table public.pilot_invites enable row level security;
alter table public.profiles enable row level security;
alter table public.quest_templates enable row level security;
alter table public.venues enable row level security;
alter table public.daily_assignments enable row level security;
alter table public.completions enable row level security;
alter table public.proof_cards enable row level security;
alter table public.xp_ledger enable row level security;
alter table public.user_achievements enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_cards enable row level security;
alter table public.share_tokens enable row level security;
alter table public.peer_verifications enable row level security;
alter table public.reviews enable row level security;
alter table public.deletion_tombstones enable row level security;

create function private.is_invited_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and exists (select 1 from public.pilot_invites i where i.email = p.email)
  );
$$;

revoke all on function private.is_invited_user() from public, anon, authenticated, service_role;

create policy "read own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()))
with check ((select auth.uid()) = user_id and cohort = '18-24' and (select private.is_invited_user()));

create policy "invited read templates" on public.quest_templates for select to authenticated
using (active and (select private.is_invited_user()));
create policy "invited read venues" on public.venues for select to authenticated
using (active and last_verified_at > now() - interval '7 days' and (select private.is_invited_user()));

create policy "read own assignments" on public.daily_assignments for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own completions" on public.completions for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own proof cards" on public.proof_cards for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own xp" on public.xp_ledger for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own achievements" on public.user_achievements for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own tokens" on public.share_tokens for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "read own verifications" on public.peer_verifications for select to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()));

create policy "manage own portfolios" on public.portfolios for all to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()))
with check ((select auth.uid()) = user_id and (select private.is_invited_user()));
create policy "manage own portfolio cards" on public.portfolio_cards for all to authenticated
using (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = (select auth.uid())) and (select private.is_invited_user()))
with check (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = (select auth.uid())) and (select private.is_invited_user()));
create policy "manage own reviews" on public.reviews for all to authenticated
using ((select auth.uid()) = user_id and (select private.is_invited_user()))
with check ((select auth.uid()) = user_id and approved = false and withdrawn_at is null and (select private.is_invited_user()));

revoke all on public.pilot_invites, public.deletion_tombstones from anon, authenticated;
grant select on public.profiles, public.quest_templates, public.venues, public.daily_assignments,
  public.completions, public.proof_cards, public.xp_ledger, public.user_achievements,
  public.portfolios, public.portfolio_cards, public.share_tokens, public.peer_verifications,
  public.reviews to authenticated;
grant update (display_name, city, interests) on public.profiles to authenticated;
grant insert, update, delete on public.portfolios, public.portfolio_cards, public.reviews to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 5000000, array['image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5000000,
  allowed_mime_types = array['image/jpeg', 'image/webp'];

create policy "owners read evidence" on storage.objects for select to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_invited_user())
);

-- Permanent evidence writes are intentionally service-role only after server validation.
revoke insert, update, delete on storage.objects from authenticated;

insert into public.quest_templates
  (title, prompt, difficulty, xp, skills, venue_types, duration_minutes, safety_note)
values
  ('The Second Look', 'Photograph three examples of public design that could be clearer. Note one precise improvement.', 'easy', 50, array['Observation', 'Creativity'], array['park', 'library', 'cafe'], 20, 'Stay in public areas and avoid including identifiable people.'),
  ('Origin Story', 'Ask a cafe owner or team member how they got started. Listen for one decision that changed their path.', 'medium', 80, array['Communication', 'Courage'], array['cafe'], 35, 'Ask permission before beginning and accept no immediately.'),
  ('Signal Clear', 'Find one confusing sign or form in a public place and redesign it for a first-time visitor.', 'bold', 120, array['Problem-solving', 'Leadership'], array['library', 'university'], 50, 'Observe only; do not alter or remove the original sign.');

insert into public.venues
  (name, city, category, accessibility_note, hours_source, last_verified_at)
values
  ('KLCC Park', 'Kuala Lumpur', 'park', 'Step-free main paths', 'Official venue website', now()),
  ('Feeka Coffee Roasters', 'Kuala Lumpur', 'cafe', 'Confirm access before travel', 'Official venue listing', now()),
  ('Raja Tun Uda Library', 'Shah Alam', 'library', 'Step-free entrance and lifts', 'Official library website', now());
