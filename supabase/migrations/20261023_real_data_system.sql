-- =========================================================================
-- VIZAG STARTUP MAP: REAL DATA SYSTEM MIGRATION
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. LISTINGS TABLE
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  type text not null check (type in ('startup', 'investor', 'incubator', 'campus', 'coworking')),
  one_liner text,
  description text not null,
  sector text,
  stage text,
  area text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  website text,
  linkedin_url text,
  x_url text,
  logo_url text,
  founded_year integer,
  founded_year_source text,
  team_size text,
  team_size_source text,
  funding_text text,
  funding_source_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'needs_review', 'hidden')),
  is_verified boolean not null default false,
  verified_at timestamptz,
  last_checked_at timestamptz default now(),
  website_status integer default 200,
  is_boosted boolean not null default false,
  boosted_until timestamptz,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for spatial & filter performance
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_slug on public.listings(slug);
create index if not exists idx_listings_type on public.listings(type);
create index if not exists idx_listings_area on public.listings(area);
create index if not exists idx_listings_sector on public.listings(sector);
create index if not exists idx_listings_is_boosted on public.listings(is_boosted);

-- 2. LISTING SOURCES (Every fact must be traceable)
create table if not exists public.listing_sources (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  source_type text not null check (source_type in ('founder_submission', 'incubator_page', 'startup_india', 'company_website', 'news', 'manual_research')),
  source_url text,
  note text,
  added_by text,
  added_at timestamptz not null default now()
);

create index if not exists idx_listing_sources_listing_id on public.listing_sources(listing_id);

-- 3. ATS BOARDS (Applicant Tracking System feeds)
create table if not exists public.ats_boards (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  provider text not null check (provider in ('greenhouse', 'lever', 'ashby')),
  board_slug text not null,
  last_synced_at timestamptz,
  last_status text default 'pending',
  consecutive_failures integer not null default 0,
  created_at timestamptz not null default now(),
  unique(listing_id, provider, board_slug)
);

create index if not exists idx_ats_boards_listing_id on public.ats_boards(listing_id);

-- 4. JOBS TABLE (Live sync + Founder-posted jobs)
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  title text not null,
  location_text text not null,
  department text,
  employment_type text default 'Full-time',
  apply_url text not null,
  source text not null check (source in ('ats', 'founder', 'careers_page')),
  external_id text,
  posted_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(listing_id, source, external_id)
);

create index if not exists idx_jobs_listing_id on public.jobs(listing_id);
create index if not exists idx_jobs_is_active on public.jobs(is_active);

-- 5. NEWS ITEMS TABLE (Visakhapatnam & regional startup news)
create table if not exists public.news_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text unique not null,
  source_name text not null,
  published_at timestamptz not null default now(),
  matched_listing_id uuid references public.listings(id) on delete set null,
  matched_keyword text,
  created_at timestamptz not null default now()
);

create index if not exists idx_news_items_published_at on public.news_items(published_at desc);

-- 6. CLAIMS TABLE (Founder claim requests)
create table if not exists public.claims (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  work_email text not null,
  method text not null check (method in ('domain_match', 'admin_verification')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- 7. REPORTS TABLE (Report incorrect data or removal requests)
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind text not null check (kind in ('incorrect_data', 'remove_listing', 'duplicate')),
  message text not null,
  reporter_email text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- 8. SYNC LOGS TABLE
create table if not exists public.sync_logs (
  id uuid primary key default uuid_generate_v4(),
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean not null default false,
  details jsonb default '{}'::jsonb
);

-- 9. PUBLIC STATS VIEW / FUNCTION
create or replace view public.public_stats as
select
  count(*) filter (where l.type = 'startup' and l.status = 'approved') as total_startups,
  count(*) filter (where l.type = 'investor' and l.status = 'approved') as total_investors,
  count(*) filter (where l.type = 'incubator' and l.status = 'approved') as total_incubators,
  count(*) filter (where l.type = 'campus' and l.status = 'approved') as total_campuses,
  count(*) filter (where l.type = 'coworking' and l.status = 'approved') as total_coworking,
  count(distinct j.listing_id) filter (where j.is_active = true and l.status = 'approved') as companies_hiring,
  count(j.id) filter (where j.is_active = true and l.status = 'approved') as open_roles,
  count(j.id) filter (where j.is_active = true and l.status = 'approved' and j.first_seen_at >= now() - interval '7 days') as jobs_posted_last_7_days,
  count(l.id) filter (where l.status = 'approved' and l.created_at >= now() - interval '30 days') as new_listings_last_30_days,
  coalesce(max(l.updated_at), now()) as last_updated_at
from public.listings l
left join public.jobs j on j.listing_id = l.id;

-- Function wrapper for RPC
create or replace function public.get_public_stats()
returns setof public.public_stats
language sql
security definer
stable
as $$
  select * from public.public_stats;
$$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.listings enable row level security;
alter table public.listing_sources enable row level security;
alter table public.ats_boards enable row level security;
alter table public.jobs enable row level security;
alter table public.news_items enable row level security;
alter table public.claims enable row level security;
alter table public.reports enable row level security;
alter table public.sync_logs enable row level security;

-- Listings: Public read approved only; Owners read & update their own; Admins full access
create policy "Public can view approved listings"
  on public.listings for select
  using (status = 'approved');

create policy "Owners can view their own listings"
  on public.listings for select
  using (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "Admins can do everything on listings"
  on public.listings for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Listing sources: Public read for approved listings; Insert by service or verified founders
create policy "Public can view sources for approved listings"
  on public.listing_sources for select
  using (exists (select 1 from public.listings l where l.id = listing_id and l.status = 'approved'));

create policy "Admins can manage listing sources"
  on public.listing_sources for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Jobs: Public can view active jobs for approved listings only
create policy "Public can view active jobs for approved listings"
  on public.jobs for select
  using (is_active = true and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'approved'));

create policy "Owners can manage jobs for their own listings"
  on public.jobs for all
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));

create policy "Admins can manage all jobs"
  on public.jobs for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- News items: Public read
create policy "Public can view news items"
  on public.news_items for select
  using (true);

create policy "Admins can manage news items"
  on public.news_items for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- ATS boards, claims, reports, sync_logs: strictly Admin / Service role or Owner
create policy "Admins can view ats boards"
  on public.ats_boards for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

create policy "Admins can view claims"
  on public.claims for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

create policy "Users can view their own claims"
  on public.claims for select
  using (auth.uid() = user_id);

create policy "Users can insert reports"
  on public.reports for insert
  with check (true);

create policy "Admins can view reports"
  on public.reports for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

create policy "Admins can view sync logs"
  on public.sync_logs for all
  using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
