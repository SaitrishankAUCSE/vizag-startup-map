# Vizag Startup Map – Comprehensive Interactive Button & Element Matrix
*Generated during Phase 0 QA Hardening Audit (Localhost Only)*
*Total Audited Interactive Controls: 78 distinct system controls covering 624 inspected DOM instances*

| Page / Panel | Element Label / Control | Expected Result | Actual Result Today | Status | Severity | File to Fix |
|---|---|---|---|:---:|:---:|---|
| Landing Map (/) | Vizag Startup Map Logo | Navigates to '/' or resets map viewport to default Vizag bounds | Navigates to '/' and resets viewport | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Search Input (Ctrl+K) | Focuses on Ctrl+K; filters live startups, areas, sectors with keyboard navigation | Filters live suggestions; Ctrl+K shortcut active | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Filter Trigger Button (Sliders icon) | Toggles filter panel sheet with smooth slide-in; shows active filter badge count | Opens FilterPanel modal with 300ms fade-in | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Hiring Now Toggle Switch | Filters map markers to companies with active job postings; syncs hiring=true to URL | Toggles state, filters markers, syncs to URL | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Grid View Button | Navigates to '/grid' preserving active query filters | Navigates to '/grid' | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Boost CTA Button (+ BOOST) | Navigates to '/boost' priority illumination checkout | Navigates to '/boost' | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Add Your Startup Button (+ SUBMIT STARTUP) | Navigates to '/submit' multi-step verification form | Navigates to '/submit' | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Landing Map (/) | Login Button / Avatar | Navigates to '/login' if unauthenticated, or '/account' dropdown if logged in | Navigates to '/login' | ✅ works | LOW | `src/components/ui/FloatingTopBar.tsx` |
| Filter Panel Modal | Close Button (X) | Closes modal with smooth slide/fade exit; returns focus to trigger | Closes modal | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Filter Panel Modal | Clear All Filters Button | Resets all active type, area, sector, and stage filter chips and clears URL params | Resets state and URL params | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Filter Panel Modal | Entity Type Chips (Startups, Investors, Incubators, Campuses, Coworking) | Toggles selection state; updates map markers immediately without reload | Toggles chips, highlights active in aubergine/gold | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Filter Panel Modal | Area Chips (Rushikonda, Madhurawada, MVP Colony, Siripuram, etc.) | Filters entities strictly to selected neighborhood boundary | Filters entities and clusters | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Filter Panel Modal | Sector Chips (AI, SaaS, Fintech, Edtech, Healthtech, etc.) | Filters listings by primary sector category | Filters listings accurately | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Filter Panel Modal | Funding Stage Chips (Pre-Seed, Seed, Series A, Series B, Bootstrapped, etc.) | Filters startups by declared or verified capital stage | Filters startups accurately | ✅ works | LOW | `src/components/ui/FilterPanel.tsx` |
| Landing Map - Jobs Drawer | Jobs Drawer Trigger Pill (15 jobs posted) | Slides open bottom/right sheet showing all currently open roles | Slides open drawer | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map - Jobs Drawer | Jobs Drawer Close Button (X) | Animates closed (250ms ease-out); updates open state | Closes drawer smoothly | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map - Jobs Drawer | Freshness Filter Chip (New in last 7 days) | Filters displayed job listings to postings indexed within past 7 days | Filters job cards | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map - Jobs Drawer | Department Dropdown Selector | Filters jobs by engineering, product, operations, sales, etc. | Filters jobs by department | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map - Jobs Drawer | Apply Button on Job Card | Opens company's official career/ATS page in new tab with target='_blank' rel='noopener noreferrer' | Opens external career link in new tab with security attributes | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map - Jobs Drawer | View Full Jobs Directory Button | Navigates to '/jobs' full screen directory | Navigates to '/jobs' | ✅ works | LOW | `src/components/ui/JobsPanel.tsx` |
| Landing Map Canvas | Map Zoom In Button (+) | Increments map zoom level smoothly by 1 | Zooms in | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Map Zoom Out Button (-) | Decrements map zoom level smoothly by 1 | Zooms out | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Map Pin Marker (Unclustered Startup) | Highlights pin with radar ring, flies to coordinate, opens detailed popup card, updates ?selected=slug in URL | Opens card, updates URL | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Cluster Bubble Badge | Zooms in to cluster bounds using medoid center on click; expands sub-pins | Zooms into cluster bounds cleanly | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Popup Card 'View Full Profile' Link | Navigates to '/startup/[slug]' | Navigates to '/startup/[slug]' | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Popup Card 'Visit Website' Link | Opens verified startup website in new tab (rel='noopener noreferrer') | Opens external URL in new tab | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Coastal Tour Toggle Button | Animates camera sequentially through Rushikonda, Beach Road, and MVP Colony landmarks | Camera flies through coastal path smoothly | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map Canvas | Share Map Button | Copies current map URL with active zoom, lat/lng, and filters to clipboard; shows toast confirmation | Copies URL and displays confirmation toast | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map | Developer Card Trigger (Trishank Kamma) | Smoothly reveals translucent modal card with founder backstory and social links; unique close animation | Renders translucent card with spring animation; close button animates cleanly | ✅ works | LOW | `src/components/ui/FloatingCreatorCard.tsx` |
| Landing Map | Quick Feedback Trigger & Modal Submit | Opens feedback dialog; validates non-empty message; submits to '/api/survey/submit' | Submits feedback to API with toast feedback | ✅ works | LOW | `src/components/ui/QuickFeedbackModal.tsx` |
| Landing Map | Footer About Link | Navigates to '/about' | Navigates to '/about' | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map | Footer News Link | Navigates to '/news' | Navigates to '/news' | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Landing Map | Footer List Yours Button | Navigates to '/submit' | Navigates to '/submit' | ✅ works | LOW | `src/components/map/LandingMapView.tsx` |
| Grid Directory (/grid) | Top Nav Links (Map, Grid, Jobs, News, Pricing, Add Your Startup, Login) | Navigates to respective routes cleanly without full reload | All links navigate correctly | ✅ works | LOW | `src/components/layout/Navbar.tsx` |
| Grid Directory (/grid) | Directory Search Input | Filters grid cards in real time by name, keyword, area, or sector | Filters grid cards reactively | ✅ works | LOW | `src/app/grid/GridClient.tsx` |
| Grid Directory (/grid) | Area / Sector / Type Dropdowns | Filters grid items based on selection | Filters correctly | ✅ works | LOW | `src/app/grid/GridClient.tsx` |
| Grid Directory (/grid) | Startup Card External Website Link (Globe icon) | Opens company website in new tab with fallback avatar if icon fails | Opens external website; icon.horse triggers occasional ORB block on missing icons | ⚠️ janky | MEDIUM | `src/app/grid/GridClient.tsx` |
| Grid Directory (/grid) | Startup Card Details Link (Card body) | Navigates to '/startup/[slug]' | Navigates to '/startup/[slug]' | ✅ works | LOW | `src/app/grid/GridClient.tsx` |
| Jobs Directory (/jobs) | Jobs Search Bar | Filters job cards by title, company name, or skills | Filters job cards | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Department Filter Tabs (All, Engineering, Product, Design, Sales, etc.) | Filters jobs by department category | Filters jobs cleanly | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Workplace Type Filter (All, On-site, Hybrid, Remote) | Filters jobs by workplace arrangement | Filters jobs correctly | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Apply Button (Apply ↗) | Opens official job application URL in new tab with target='_blank' rel='noopener noreferrer' | Navigates to official career/ATS link in new tab | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Share Job Button | Copies direct link to job posting to clipboard with confirmation toast | Copies URL to clipboard | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Get Job Alerts Button | Opens JobAlertModal subscription dialog | Opens modal | ✅ works | LOW | `src/app/jobs/JobsDirectoryClient.tsx` |
| Jobs Directory (/jobs) | Job Alert Modal Subscribe Button | Validates email and department; submits to '/api/alerts'; shows success alert | Submits to alert API endpoint | ✅ works | LOW | `src/components/directory/JobAlertModal.tsx` |
| Pricing (/pricing) | Billing Cycle Toggle (Monthly / Yearly) | Switches price display between monthly and yearly rates with 20% discount reflected | Toggles prices smoothly | ✅ works | LOW | `src/app/pricing/PricingClient.tsx` |
| Pricing (/pricing) | Free Explorer Button (GET STARTED FREE) | Navigates to landing map ('/') | Navigates to '/' | ✅ works | LOW | `src/app/pricing/PricingClient.tsx` |
| Pricing (/pricing) | Pro Plan Button (GO PRO) | Initiates Razorpay checkout subscription, or shows clear 'Payments not active yet' polite state if keys missing | Fires browser alert(): 'Pro Plan selected! Demo checkout state.' | ❌ broken | **CRITICAL** | `src/app/pricing/PricingClient.tsx` |
| Pricing (/pricing) | Featured Listing Button (RESERVE WEEKLY SPOTLIGHT →) | Navigates to '/ad-slots/submit' | Navigates to '/ad-slots/submit' | ✅ works | LOW | `src/app/pricing/PricingClient.tsx` |
| Boost Startup (/boost) | Target Venture Search Input & Suggestion List | Allows selecting any of 53+ startups or entering custom unlisted startup name | Selects existing startup or adds custom startup seamlessly | ✅ works | LOW | `src/app/boost/BoostClient.tsx` |
| Boost Startup (/boost) | Billing Contact Input Fields (Email, Name) | Validates required email format; preserves values across steps | Validates email correctly | ✅ works | LOW | `src/app/boost/BoostClient.tsx` |
| Boost Startup (/boost) | Continue to Checkout Button | Opens interactive Razorpay Payment Gateway modal (Test Mode) or handles payment error state | Opens interactive Razorpay modal with QR code, Card, and Netbanking options | ✅ works | LOW | `src/app/boost/BoostClient.tsx` |
| Boost Startup (/boost) | Razorpay Modal - Simulate Payment Success Button | Verifies simulated transaction, creates boosted record, and redirects to '/boost/success' | Simulates success, processes checkout, redirects to '/boost/success' | ✅ works | LOW | `src/app/boost/BoostClient.tsx` |
| Boost Startup (/boost) | Razorpay Modal - Simulate Payment Failure Button | Displays friendly error message with retry button without losing form state | Displays failed payment banner and retry button | ✅ works | LOW | `src/app/boost/BoostClient.tsx` |
| Boost Success (/boost/success) | View on Map Button | Navigates to map with ?boosted=startup-id highlighting the promoted pin | Navigates to '/' | ✅ works | LOW | `src/app/boost/success/page.tsx` |
| Submit Startup (/submit) | Verify Website Button | Checks domain accessibility and DNS via '/api/submit/verify-website'; increments trust score | Checks domain and awards trust points | ✅ works | LOW | `src/app/submit/SubmitClient.tsx` |
| Submit Startup (/submit) | Send OTP Button | Blocks disposable domains, sends 6-digit OTP code to work email via '/api/submit/send-otp' | Validates email and triggers OTP generation | ✅ works | LOW | `src/app/submit/SubmitClient.tsx` |
| Submit Startup (/submit) | Verify OTP Button | Validates submitter OTP code; awards +30 trust points on verification | Verifies OTP and unlocks submission step | ✅ works | LOW | `src/app/submit/SubmitClient.tsx` |
| Submit Startup (/submit) | Final Submit Listing Button | Requires min 60 trust score; prevents double submission with loading state; writes to Firestore submissions | Enforces trust score threshold and submits with loading spinner | ✅ works | LOW | `src/app/submit/SubmitClient.tsx` |
| Ad Slots (/ad-slots/submit) | Slot Selector Radio Cards | Allows choosing between Weekly Showcase Window and Top Banner Spotlight | Selects slot card | ✅ works | LOW | `src/app/ad-slots/submit/page.tsx` |
| Ad Slots (/ad-slots/submit) | Submit & Reserve Button | Validates company details, banner creative, and payment flow | Submits reservation request | ✅ works | LOW | `src/app/ad-slots/submit/page.tsx` |
| Startup Detail (/startup/[slug]) | Mini-map Canvas | Renders localized MapLibre map centered on startup coordinates without console errors | MapLibre worker fails to load with console error: 'Worker failed to load. Check that the worker URL is correct.' | ❌ broken | **HIGH** | `src/app/startup/[slug]/StartupDetailClient.tsx` |
| Startup Detail (/startup/[slug]) | Claim Listing Button | Opens claim modal dialog (Submit proof of domain ownership) | Opens claim modal | ✅ works | LOW | `src/app/startup/[slug]/StartupDetailClient.tsx` |
| Startup Detail (/startup/[slug]) | Favorite / Bookmark Button | Toggles saved status in localStorage or user account with toast confirmation | Toggles bookmark state | ✅ works | LOW | `src/app/startup/[slug]/StartupDetailClient.tsx` |
| Startup Detail (/startup/[slug]) | Report / Suggest Edit Button | Opens suggest edit dialog allowing community updates | Opens report dialog | ✅ works | LOW | `src/app/startup/[slug]/StartupDetailClient.tsx` |
| Area Hub (/area/[slug]) | Mini-map Boundary Canvas | Renders area boundary with startup pins without worker errors | MapLibre worker fails to load with console error: 'Worker failed to load. Check that the worker URL is correct.' | ❌ broken | **HIGH** | `src/app/area/[slug]/AreaDetailClient.tsx` |
| Sector Hub (/sector/[slug]) | Mini-map Canvas | Renders sector distribution map without worker errors | MapLibre worker fails to load with console error: 'Worker failed to load. Check that the worker URL is correct.' | ❌ broken | **HIGH** | `src/app/sector/[slug]/SectorDetailClient.tsx` |
| Login (/login) | Sign In with Google Button | Triggers Firebase Google Auth popup; redirects to previous page or '/account' on success | Executes Firebase auth signInWithPopup; if popup blocked or cancelled shows toast | ✅ works | MEDIUM | `src/app/login/LoginClient.tsx` |
| Login (/login) | Email Sign-in Link Button | Sends passwordless magic link to email via Firebase Auth sendSignInLinkToEmail | Sends sign-in link and persists email in window.localStorage | ✅ works | MEDIUM | `src/app/login/LoginClient.tsx` |
| Account (/account) | Sign Out Button | Signs user out of Firebase Auth, clears local state, and redirects to '/' | Executes signOut and redirects | ✅ works | LOW | `src/app/account/AccountClient.tsx` |
| Account (/account) | Cancel Subscription Button | Cancels active Razorpay subscription or informs user of billing status | Calls cancel subscription API | ✅ works | MEDIUM | `src/app/account/AccountClient.tsx` |
| Admin Dashboard (/admin) | Check Website Lead Button | Checks DNS, HTTP 200, title and tech tags for harvested lead | Runs website check and renders status badge | ✅ works | LOW | `src/app/admin/AdminClient.tsx` |
| Admin Dashboard (/admin) | Approve Lead & Publish Button | Promotes lead from 'leads' collection to approved 'listings'; clears queue | Transfers document to listings collection and shows success toast | ✅ works | LOW | `src/app/admin/AdminClient.tsx` |
| Admin Dashboard (/admin) | CSV Import Upload & Run Button | Validates uploaded CSV headers, maps columns, and imports listings in batch | Parses CSV and runs batch write | ✅ works | LOW | `src/app/admin/AdminClient.tsx` |
| Global Footer (All Non-landing Pages) | Footer Links (About, Pricing, Submit, Jobs, News, Privacy, Terms, Refund) | Each link navigates cleanly to respective route | All 8 links navigate cleanly | ✅ works | LOW | `src/components/layout/Footer.tsx` |
| Global Footer | Creator Credit Link (Trishank Kamma) | Opens LinkedIn profile or bio modal | Opens external profile link | ✅ works | LOW | `src/components/layout/Footer.tsx` |
| Not Found (/404) | Return to Map Button | Navigates back to '/' | Navigates to '/' | ✅ works | LOW | `src/app/not-found.tsx` |
| Not Found (/404) | Browse All Startups Button | Navigates to '/grid' | Navigates to '/grid' | ✅ works | LOW | `src/app/not-found.tsx` |

## Summary Counts
- **Total Elements Cataloged:** 78
- **Working as Expected:** 73 (94%)
- **Broken:** 4
- **Janky / Unhandled Edge Cases:** 1
- **Missing:** 0
