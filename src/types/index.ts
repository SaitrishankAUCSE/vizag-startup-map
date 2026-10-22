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

export interface Listing {
  id: string;
  slug: string;
  name: string;
  type: ListingType;
  description: string;
  sector: Sector | string;
  stage: Stage | string;
  area: Area | string;
  address: string;
  lat: number;
  lng: number;
  website?: string | null;
  linkedin?: string | null;
  logo_url?: string | null;
  founded_year?: number | null;
  team_size?: string | null;
  funding_range?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  featured_until?: string | null;
  owner_id?: string | null;
  is_verified: boolean;
  last_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  // Computed or joined
  jobs_count?: number;
  open_jobs?: Job[];
  distance_to_beach_km?: number;
}

export interface Job {
  id: string;
  listing_id: string;
  title: string;
  location: string;
  apply_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_name?: string;
  company_slug?: string;
  company_logo?: string | null;
  company_area?: string;
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
  maxBeachDistance?: number; // km
  foundedYearMax?: number; // slider up to year
  teamSize?: string;
  fundingRange?: string;
}

export type ListingFilters = Partial<FilterState> & {
  hiring_only?: boolean;
};

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface Claim {
  id: string;
  listing_id: string;
  listing_name?: string;
  listing_slug?: string;
  founder_name: string;
  work_email: string;
  proof_url: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

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
