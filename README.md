# Vizag Startup Map

> An interactive, high-performance directory and map of startups, venture investors, incubators, universities, and coworking hubs in **Visakhapatnam (Vizag), Andhra Pradesh, India**.
> Built to match the clean, frictionless user experience of [bangalorestartupmap.com](https://bangalorestartupmap.com) and [hyderabadstartupsmap.lol](https://hyderabadstartupsmap.lol).

---

## 0. Golden Rules (Enforced System-Wide)

1. **NEVER invent data**: No hardcoded fake companies, fake founders, funding amounts, jobs, logos, URLs or coordinates exist anywhere in production code or the database. All company data comes exclusively from real CSV imports, founder submissions, or verified ATS feeds.
2. **Zero fake sample rows**: The app works out of the box with an empty database and presents a clean empty state: *"No startups on the map yet. Be the first to add yours"* with a direct submit button.
3. **Traceable facts**: Every listing carries a source tag (e.g. `Submitted by founder`, `Incubator portfolio`, `Startup India`, `Manual research`). Founded year, team size, and funding amounts are shown **only** if a verifiable source is stored; if unknown, nothing is rendered (never "N/A" filler or guesses).
4. **Computed counts**: All counts across top bars, jobs tabs, badges, and stats are computed dynamically from Firestore via `public_stats` and cached for 5 minutes (`revalidate = 300`) to protect Spark-plan read limits.
5. **No restricted scraping**: Zero scraping of LinkedIn, Naukri, Indeed, Wellfound, Glassdoor, or Google Maps. Background workflows politely poll official ATS public feeds and official RSS streams, strictly respecting `robots.txt`.

---

## 1. How to Prepare the CSV for Import

You can bulk import companies through the **Admin UI** (`/admin`) or the **CLI script** (`scripts/import-csv.mjs`).

### CSV Column Specification:
```csv
name,type,one_liner,sector,stage,area,address,website,linkedin_url,source_type,source_url,careers_url,ats_provider,ats_board_slug
```

| Column | Required | Accepted Values / Format | Notes |
|---|---|---|---|
| `name` | **Yes** | e.g. `BayLogic AI` | Company or organization name |
| `type` | **Yes** | `startup`, `investor`, `incubator`, `campus`, `coworking` | Defaults to `startup` |
| `one_liner` | No | Up to 240 characters | Short elevator pitch |
| `sector` | No | `AI`, `SaaS`, `Fintech`, `Edtech`, `Healthtech`, `Logistics and Port`, etc. | Industry vertical |
| `stage` | No | `Pre-seed`, `Seed`, `Bootstrapped`, `Series A`, `Series B`, etc. | Company stage |
| `area` | No | `Rushikonda`, `Madhurawada`, `MVP Colony`, `Siripuram`, `Dwaraka Nagar`, `Beach Road`, etc. | Vizag neighborhood |
| `address` | No | e.g. `Hill No. 3, Rushikonda IT SEZ, Visakhapatnam` | Used for Nominatim geocoding |
| `website` | No | e.g. `https://baylogic.in` | Normalized to clean domain |
| `linkedin_url` | No | e.g. `https://linkedin.com/company/baylogic` | Must be a valid URL |
| `source_type` | **Yes** | `founder_submission`, `incubator_page`, `startup_india`, `company_website`, `news`, `manual_research` | Primary traceable origin |
| `source_url` | No | e.g. `https://startupindia.gov.in/entity/...` | Source verification link |
| `careers_url` | No | e.g. `https://baylogic.in/careers` | Official careers page |
| `ats_provider` | No | `greenhouse`, `lever`, `ashby` | If using an ATS |
| `ats_board_slug`| No | e.g. `baylogic-ai` | Public board identifier |

### Import Behavior:
- **Zod validation**: Every row is strictly validated.
- **Domain normalization**: URLs are normalized to base domains for deduplication.
- **Duplicate protection**: Duplicate domain names or identical company names in the same neighborhood are skipped and recorded in the import report.
- **HTTP responsiveness**: Websites are checked with an 8-second timeout (`HEAD` with `GET` fallback).
- **Nominatim geocoding**: Addresses are converted to latitude/longitude at a polite rate limit of 1 request/second with OpenStreetMap attribution. If ambiguous, the row is flagged with `needs_review` so an admin can drop a pin.
- **Pending status**: All imported rows receive `status = "pending"`. Nothing goes live without admin review.

---

## 2. How to Find a Company's ATS Board Slug

Applicant Tracking Systems expose public, unauthenticated read-only job feeds that we poll directly without API keys:

### A. Greenhouse (`greenhouse`)
- **Public Career Page URL pattern**:
  - `https://boards.greenhouse.io/{board_slug}`
  - `https://job-boards.greenhouse.io/{board_slug}`
- **How to find it**: Inspect the company's careers page link. If the URL is `https://boards.greenhouse.io/postman`, the slug is `postman`.
- **API Endpoint polled**: `https://boards-api.greenhouse.io/v1/boards/{board_slug}/jobs?content=true`

### B. Lever (`lever`)
- **Public Career Page URL pattern**:
  - `https://jobs.lever.co/{board_slug}`
- **How to find it**: If the company's job listings open at `https://jobs.lever.co/atlan`, the slug is `atlan`.
- **API Endpoint polled**: `https://api.lever.co/v0/postings/{board_slug}?mode=json`

### C. Ashby (`ashby`)
- **Public Career Page URL pattern**:
  - `https://jobs.ashbyhq.com/{board_slug}`
- **How to find it**: If the company's job board is at `https://jobs.ashbyhq.com/synthesia`, the slug is `synthesia`.
- **API Endpoint polled**: `https://api.ashbyhq.com/posting-api/job-board/{board_slug}`

---

## 3. How to Set GitHub Actions Secrets

Background sync workflows run on GitHub's free runner tier via GitHub Actions.

1. Navigate to your repository on GitHub: **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add the following:

| Secret Name | Value Description | Example / Format |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Your Firebase Project ID | `vizag-startup-map` |
| `FIREBASE_CLIENT_EMAIL` | Service Account email address | `firebase-adminsdk-xxx@vizag-startup-map.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key (including BEGIN and END blocks) | `-----BEGIN PRIVATE KEY-----\nMIIEv...` |
| `CLOUDINARY_CLOUD_NAME` | *(Optional)* Cloudinary Cloud Name for logo storage | `vizag-ecosystem` |
| `CLOUDINARY_API_KEY` | *(Optional)* Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | *(Optional)* Cloudinary API secret | `abcde_fghijk...` |

---

## 4. How to Run Each Workflow by Hand

All background workflows support manual execution via GitHub `workflow_dispatch` and via the command line.

### A. Running via GitHub Web UI:
1. Open your repository on GitHub and click on the **Actions** tab.
2. Under "Workflows" on the left sidebar:
   - Select **Sync ATS Jobs** (`.github/workflows/sync-jobs.yml`)
   - Select **Sync Tech News RSS** (`.github/workflows/sync-news.yml`)
   - Select **Nightly Data Health Check** (`.github/workflows/health-check.yml`)
3. Click the **Run workflow** dropdown button on the right, select `main`, and click **Run workflow**.

### B. Running Locally / by CLI:
Ensure your `.env.local` contains Firebase Admin credentials, then run:

```bash
# 1. Run ATS Job Sync (every 6 hours scheduled)
node scripts/sync-jobs.mjs

# 2. Run Tech News RSS Sync (hourly scheduled)
node scripts/sync-news.mjs

# 3. Run Nightly Data Health Check (daily scheduled)
node scripts/health-check.mjs

# 4. Import a CSV file locally
node scripts/import-csv.mjs path/to/startups.csv
```

---

## 5. Acceptance Checklist & Verification

| Checklist Item | Status | Verification & Proof |
|---|---|---|
| **No fake company or job exists in code/DB** | **PROVEN** | `mockData.ts` contains `INITIAL_MOCK_LISTINGS = []` and `INITIAL_MOCK_JOBS = []`. Hardcoded fake news articles removed from `src/app/news/page.tsx`. Zero sample rows in database. |
| **App works and looks good with 0 listings** | **PROVEN** | Verified empty state in `LandingMapView.tsx`: displays *"No startups on the map yet. Be the first to add yours"* with a styled Submit button. |
| **Every listing has a source; funding and team size show only with source** | **PROVEN** | Enforced in `service.ts`, `StartupDetailCard.tsx`, and `/startup/[slug]/page.tsx`. `founded_year`, `team_size`, and `funding_text` are strictly omitted unless accompanied by their stored source field. Tested in `tests/real_data_and_ats.test.mjs`. |
| **Imported rows stay pending until admin approves** | **PROVEN** | Both `/api/admin/import/route.ts` and `scripts/import-csv.mjs` explicitly write listings with `status = "pending"` (or `"needs_review"` if geocoding pin requires manual adjustment). |
| **Jobs sync from public feeds, close when removed, counts match DB** | **PROVEN** | `scripts/sync-jobs.mjs` polls Greenhouse, Lever, and Ashby; sets `is_active = false` if absent for 2 consecutive runs; updates `stats/public` cache so top bar and directory show exact live counts. |
| **Verified badge, last-verified date, report and remove buttons work** | **PROVEN** | Verified badge renders only when `is_verified: true`. Last verified date displays on card. "Report incorrect data" and "Remove listing" trigger `ReportModal.tsx` and submit to `reports` collection. |
| **No scraping of LinkedIn, Naukri, Indeed, or Google Maps** | **PROVEN** | No restricted scrapers exist in codebase. Only official ATS public JSON APIs, official RSS feeds, and OpenStreetMap/Nominatim (1 req/sec rate limit with User-Agent) are used. |

---

## 6. Running Tests

```bash
npm test
```
Runs 19 automated unit tests verifying:
- HMAC-SHA256 signature checks
- Directory area/type/sector filters
- Coastal haversine proximity calculation
- ATS URL detection for Greenhouse, Lever, and Ashby
- Domain normalization & duplicate detection
- Golden Rule #3 traceable facts guard
