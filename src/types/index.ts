// Core TypeScript types for Vizag Startup Map

export type ListingType = 'startup' | 'investor' | 'incubator' | 'campus' | 'coworking';

export type Stage =
  | 'Pre-seed'
  | 'Seed'
  | 'Bootstrapped'
  | 'Series A'
  | 'Series B'
  | 'Series C+'
  | 'Acquired'
  | 'Public';

export type Sector =
  | 'AI'
  | 'SaaS'
  | 'Fintech'
  | 'Edtech'
  | 'Healthtech'
  | 'Pharma'
  | 'Logistics and Port'
  | 'Tourism'
  | 'Agritech'
  | 'Consumer'
  | 'D2C'
  | 'Deeptech'
  | 'Gaming'
  | 'Other';

export type Area =
  | 'Rushikonda'
  | 'Madhurawada'
  | 'MVP Colony'
  | 'Siripuram'
  | 'Dwaraka Nagar'
  | 'Seethammadhara'
  | 'Beach Road'
  | 'Gajuwaka'
  | 'Pendurthi'
  | 'Other';

export type ListingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_review'
  | 'hidden'
  | 'lead'
  | 'lead_unverified';

export type CareersStatus = 'verified_openings' | 'no_openings' | 'unknown';

export interface ListingSource {
  id: string;
  listing_id: string;
  source_type: 'founder_submission' | 'incubator_page' | 'startup_india' | 'company_website' | 'news' | 'manual_research';
  source_url?: string | null;
  note?: string | null;
  added_by?: string | null;
  added_at: string;
}

export interface ATSBoard {
  id: string;
  listing_id: string;
  provider: 'greenhouse' | 'lever' | 'ashby';
  board_slug: string;
  last_synced_at?: string | null;
  last_status?: string | null;
  consecutive_failures: number;
  created_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  type: ListingType;
  one_liner?: string | null;
  description: string;
  sector?: Sector | string | null;
  stage?: Stage | string | null;
  area: Area | string;
  address?: string | null;
  lat: number;
  lng: number;
  website?: string | null;
  careers_url?: string | null;
  careers_status?: CareersStatus;
  ats_provider?: 'greenhouse' | 'lever' | 'ashby' | null;
  ats_board_slug?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_note?: string | null;
  founder_name?: string | null;
  founder_linkedin?: string | null;
  founder_email?: string | null;
  business_model?: 'product' | 'service' | string | null;
  linkedin_url?: string | null;
  linkedin?: string | null; // legacy alias
  x_url?: string | null;
  logo_url?: string | null;
  founded_year?: number | null;
  founded_year_source?: string | null;
  team_size?: string | null;
  team_size_source?: string | null;
  funding_text?: string | null;
  funding_range?: string | null; // legacy alias
  funding_source_url?: string | null;
  status: ListingStatus;
  is_verified: boolean;
  verified_at?: string | null;
  verified_on?: string | null;
  last_verified_at?: string | null; // legacy alias
  last_checked_at?: string | null;
  website_status?: number | null;
  is_boosted?: boolean;
  is_featured?: boolean; // legacy alias
  boosted_until?: string | null;
  featured_until?: string | null; // legacy alias
  owner_id?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / computed relations
  sources?: ListingSource[];
  ats_boards?: ATSBoard[];
  jobs_count?: number;
  open_jobs?: Job[];
  distance_to_beach_km?: number;
}

export interface Job {
  id: string;
  listing_id: string;
  title: string;
  location_text?: string;
  location?: string; // legacy alias
  department?: string | null;
  employment_type?: string | null;
  apply_url: string;
  source?: 'ats' | 'founder' | 'careers_page' | 'jsonld';
  external_id?: string | null;
  missing_checks?: number;
  posted_at?: string | null;
  first_seen_at?: string;
  last_seen_at?: string;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;

  // Joined company metadata for directory view
  company_name?: string;
  company_slug?: string;
  company_logo?: string | null;
  company_area?: string;
  company_sector?: string | null;
}

export interface PublicStats {
  total_startups: number;
  total_investors: number;
  total_incubators: number;
  total_campuses: number;
  total_coworking: number;
  companies_hiring: number;
  open_roles: number;
  jobs_posted_last_7_days: number;
  new_listings_last_30_days: number;
  last_updated_at: string;
}

export interface NewsItem {
  id?: string;
  title: string;
  url?: string;
  link?: string; // alias
  source_name?: string;
  source?: string; // alias
  published_at?: string;
  pubDate?: string; // alias
  matched_listing_id?: string | null;
  matched_keyword?: string | null;
}

export interface Claim {
  id: string;
  listing_id: string;
  user_id: string;
  work_email: string;
  method: 'domain_match' | 'admin_verification';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  listing_name?: string;
  listing_slug?: string;
  founder_name?: string;
  notes?: string;
  proof_url?: string;
}

export interface Report {
  id: string;
  listing_id: string;
  kind: 'incorrect_data' | 'remove_listing' | 'duplicate';
  message: string;
  reporter_email: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface SyncLog {
  id: string;
  job_name: string;
  started_at: string;
  finished_at?: string | null;
  ok: boolean;
  details?: Record<string, any>;
}

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'founder' | 'admin';
  plan: 'free' | 'pro';
  razorpay_customer_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  product: 'pro' | 'featured';
  listing_id?: string | null;
  razorpay_subscription_id: string;
  status: 'active' | 'authenticated' | 'cancelled' | 'completed' | 'expired' | 'halted' | 'pending';
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  listing_data: Partial<Listing>;
  founder_name: string;
  contact_email: string;
  founder_role?: string;
  founder_linkedin?: string | null;
  is_email_verified?: boolean;
  domain_matched?: boolean;
  website_verified?: boolean;
  verification_score?: number;
  verification_proof_type?: 'dpiit' | 'cin' | 'gstin' | 'incubator' | 'media' | null;
  verification_proof_value?: string | null;
  verification_details?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  type: string;
  area: string;
  stage: string;
  sector: string;
  hiringOnly: boolean;
  search: string;
  maxBeachDistance?: number;
  foundedYearMax?: number;
  teamSize?: string;
  fundingRange?: string;
}

export type ListingFilters = Partial<FilterState> & {
  hiring_only?: boolean;
};

export interface Favourite {
  id: string;
  user_id: string;
  listing_id: string;
  list_name: string;
  created_at: string;
  listing?: Listing;
}

export interface AnalyticsSummary {
  views: number;
  clicks: number;
  recentViews: number;
}
