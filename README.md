# Vizag Startup Map

> An interactive, high-performance directory and map of startups, venture investors, incubators, universities, and coworking hubs in **Visakhapatnam (Vizag), Andhra Pradesh, India**.
> Built to match the clean, frictionless, map-centric user experience of [startupmap.one](https://startupmap.one/).

---

## Architecture & Tech Stack (Zero Running Cost)

- **Framework**: [Next.js](https://nextjs.org/) (App Router) with TypeScript & React 19.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a curated Vizag coastal palette (deep sea-blue `#0E4D64`, obsidian `#093345`, soft sand canvas `#FBF9F5`, rust-red accent `#E04F36`).
  - Strict UI standards: No purple gradients, no pill-shaped buttons, standard rectangular rounded buttons (`rounded-lg`, `rounded-md`), crisp Lucide SVG icons (no emojis), and zero AI filler.
- **Interactive Map**: [MapLibre GL JS](https://maplibre.org/) with client-side clustering, circle layers, click-to-zoom clusters, and responsive popups.
  - Tile URL centralized in one file: `src/config/map.ts` (configured with OpenStreetMap raster tiles, ready to swap to MapTiler or Protomaps).
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth) with strict Row Level Security (RLS) on every table.
- **Payments**: [Razorpay Subscriptions](https://razorpay.com/) (India, INR). Modularized payment code in `src/lib/payments/razorpay.ts` with HMAC-SHA256 signature verification.
- **Hosting**: [Vercel](https://vercel.com/) (Free tier ready).
- **Email**: [Resend](https://resend.com/) (Free tier ready for alerts).

---

## Directory & File Structure

```text
vizag-startup-map/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing page: Map immediately visible (Map/List/Grid view)
│   │   ├── layout.tsx                   # Root HTML layout with fonts and metadata
│   │   ├── jobs/                        # Startup jobs board & directory
│   │   ├── dashboard/                   # Founder portal (edit listing, manage jobs, claim organization)
│   │   ├── admin/                       # Admin review queue, claim verification, CSV import/export
│   │   ├── submit/                      # Add startup form with interactive pin-drop map
│   │   ├── pricing/                     # Pricing comparison (Free vs Pro vs Featured)
│   │   ├── account/                     # Manage subscription, cancel, invoices
│   │   ├── login/                       # Supabase Magic Link & Google Auth
│   │   ├── startup/[slug]/              # SEO startup detail pages with JSON-LD schema
│   │   ├── area/[slug]/                 # SEO area pages (Rushikonda, Siripuram, etc.)
│   │   ├── sector/[slug]/               # SEO sector pages (AI, SaaS, Fintech, etc.)
│   │   ├── terms/                       # Terms of Service legal draft
│   │   ├── privacy/                     # Privacy Policy legal draft
│   │   ├── refund/                      # Refund & Cancellation policy draft
│   │   ├── sitemap.ts & robots.ts       # Dynamic sitemap & crawler indexing rules
│   │   └── api/
│   │       ├── jobs/                    # Open roles CRUD (enforces 1 free vs 5 featured)
│   │       ├── claim/                   # Founder listing claim requests & admin approvals
│   │       ├── favourites/              # Saved startups & named lists (server-side Pro locked)
│   │       ├── analytics/               # Profile views & website clicks tracking
│   │       ├── news/                    # 1-hour cached AP/Vizag RSS news proxy
│   │       ├── payments/                # Razorpay subscription generation
│   │       ├── webhooks/razorpay/       # Verified webhook handler (HMAC-SHA256)
│   │       ├── alerts/                  # Email alert subscription
│   │       └── listings/export/         # CSV export (server-side Pro locked)
│   ├── components/
│   │   ├── map/                         # MapContainer (MapLibre GL), MiniMap, LocationPicker
│   │   ├── layout/                      # TopNav, FilterBar, NewsStrip, SampleDataBanner
│   │   └── directory/                   # ListingCard, ListingList, ListingGrid, ProLockModal
│   ├── config/
│   │   ├── map.ts                       # Single tile URL configuration
│   │   ├── pricing.ts                   # Centralized INR pricing plans
│   │   ├── constants.ts                 # Types, areas, sectors, stages, coastline polyline
│   │   ├── areaDescriptions.ts          # Rich editorial blurbs for area landing pages
│   │   └── sectorDescriptions.ts        # Rich editorial blurbs for sector landing pages
│   ├── lib/
│   │   ├── supabase/                    # Unified resilient service, server/admin clients
│   │   ├── payments/                    # Modular Razorpay helper & HMAC-SHA256 signature check
│   │   ├── email/                       # Resend email client
│   │   └── utils/                       # Haversine distance, SEO JSON-LD helpers
│   └── types/                           # TypeScript interfaces
├── supabase/
│   ├── migrations/
│   │   └── 20261021000000_initial_schema.sql  # 8 tables, RLS policies, triggers
│   ├── seed.sql                         # Sample seed dataset (starts with "Sample")
│   └── seed_data.csv                    # CSV seed dataset
├── tests/
│   └── filter_and_webhook.test.mjs      # Unit tests for filter logic & HMAC signature verification
├── .env.example                         # Complete environment template
└── package.json
```

---

## Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
cd vizag-startup-map
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase and Razorpay credentials (the app works out of the box with the bundled resilient fallback data if credentials are not yet connected).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The map centered on Visakhapatnam loads immediately!

### 4. Run Unit Tests
```bash
npm test
```
Executes tests verifying the directory filter logic, Haversine coastline proximity, and Razorpay HMAC-SHA256 webhook signature verification.

---

## Step-by-Step Production Hand-off Checklist

### Step 1: Create Supabase Project & Run Migrations
1. Sign up at [supabase.com](https://supabase.com/) (free tier).
2. Create a new project (select the AWS Mumbai `ap-south-1` region for fastest latency in India).
3. Navigate to **SQL Editor** in the Supabase Dashboard.
4. Open `supabase/migrations/20261021000000_initial_schema.sql`, paste its content into the SQL Editor, and click **Run**.
   - This creates all 8 tables (`profiles`, `listings`, `jobs`, `favourites`, `subscriptions`, `submissions`, `alerts`, `analytics_events`), configures PostgreSQL triggers, and enables strict Row Level Security (RLS) on every table.
5. In **Project Settings** > **API**, copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`
6. In **Authentication** > **Providers**, enable Email (Magic Link) and Google OAuth (optional).

### Step 2: Make Your Account an Admin
To access `/admin` and review submissions or founder claims:
1. Sign up or log in via `/login` using your personal email (e.g. `you@domain.com`).
2. Run this query in the Supabase SQL editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'you@domain.com';
```
3. Visit `http://localhost:3000/admin` to access the moderation queue, import CSVs, and approve claims.

### Step 3: Configure Razorpay Subscriptions (Test First, Then Live)
1. Sign up at [razorpay.com](https://razorpay.com/) (Standard Indian Business account).
2. Go to **Settings** > **API Keys** and generate **Test Keys**:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
3. Go to **Subscriptions** > **Plans** in Razorpay and create 4 plans matching `src/config/pricing.ts`:
   - `Pro Monthly`: ₹199 / month -> `RAZORPAY_PLAN_PRO_MONTHLY`
   - `Pro Yearly`: ₹1,499 / year -> `RAZORPAY_PLAN_PRO_YEARLY`
   - `Featured Monthly`: ₹999 / month -> `RAZORPAY_PLAN_FEATURED_MONTHLY`
   - `Featured Yearly`: ₹7,999 / year -> `RAZORPAY_PLAN_FEATURED_YEARLY`
4. Go to **Settings** > **Webhooks**:
   - Webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Secret: enter a secure string and add it to `RAZORPAY_WEBHOOK_SECRET`
   - Active events to check:
     - `subscription.authenticated`
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.cancelled`
     - `subscription.completed`
     - `subscription.expired`
     - `payment.failed`
5. Test payments in Razorpay test mode using test cards. When ready for production, switch keys to **Live Mode**.

### Step 4: Replace Sample Data with Real Data
- The application includes sample entries (prefixed with "Sample") and displays the "Sample data" banner on `/`.
- In `/admin`, use the **Import CSV** button to upload your verified CSV dataset using the column format in `supabase/seed_data.csv`.
- Once all records no longer contain "Sample", the sample data warning banner automatically disappears!

### Step 5: Deploy to Vercel (Free Tier)
1. Push your repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com/) and click **New Project** > import your repository.
3. In **Environment Variables**, add the keys from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `RAZORPAY_PLAN_PRO_MONTHLY`
   - `RAZORPAY_PLAN_PRO_YEARLY`
   - `RAZORPAY_PLAN_FEATURED_MONTHLY`
   - `RAZORPAY_PLAN_FEATURED_YEARLY`
   - `RESEND_API_KEY` (optional)
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Click **Deploy**.
5. Connect your custom domain (e.g. `vizagstartupmap.com`) in Vercel Project Settings > Domains.
