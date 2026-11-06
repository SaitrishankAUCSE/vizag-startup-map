import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const OUTPUT_DIR = path.join(ROOT_DIR, 'data', 'discovery-output');
export const CACHE_DIR = path.join(OUTPUT_DIR, 'cache');

// Visakhapatnam geographic bounding box
export const VIZAG_BOUNDS = {
  minLat: 17.55,
  maxLat: 17.92,
  minLng: 83.05,
  maxLng: 83.50,
};

// Safe land coordinate bounds
export const VIZAG_LAND_RULES = {
  rushikondaMaxLng: 83.388,
  cityCenterMaxLng: 83.332,
  mvpColonyMaxLng: 83.338,
  madhurawadaMaxLng: 83.40,
  gajuwakaMaxLng: 83.25,
};

// User-Agent and Contact
export const USER_AGENT = process.env.BOT_USER_AGENT || 'VizagStartupMapBot/1.0 (contact@vizagstartupmap.com)';
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@vizagstartupmap.com';

// Request constraints
export const TIMEOUT_MS = 8000;
export const HOST_DELAY_MS = 2000; // at least 2 seconds per host
export const NOMINATIM_DELAY_MS = 1100; // max 1 request/sec

// Google Places API limits
export const PLACES_BUDGET = {
  maxSearchRequests: 150,
  maxDetailRequests: 400,
};

// Keywords for Places and Web Discovery
export const SEARCH_KEYWORDS = [
  'software startup',
  'SaaS company',
  'AI company',
  'machine learning',
  'fintech',
  'edtech',
  'healthtech',
  'medtech startup',
  'pharma tech',
  'biotech startup',
  'logistics tech',
  'maritime technology',
  'drone company',
  'robotics',
  'IoT company',
  'agritech',
  'aquaculture technology',
  'e-commerce startup',
  'mobile app development company',
  'product company',
  'deep tech',
  'cybersecurity',
  'blockchain',
  'gaming studio',
  'ev startup',
  'renewable energy startup',
  'startup incubator',
  'coworking space',
];

export const VIZAG_AREAS = [
  'Rushikonda',
  'Madhurawada',
  'MVP Colony',
  'Siripuram',
  'Dwaraka Nagar',
  'Seethammadhara',
  'Beach Road',
  'Gajuwaka',
  'Akkayyapalem',
  'Maharanipeta',
  'Yendada',
  'Pendurthi',
  'NAD Junction',
  'Autonagar',
];

// Starting hint pages
export const STARTING_LEAD_URLS = [
  'https://yourstory.com/companies/visakhapatnam',
  'https://startuptalky.com/startups-in-visakhapatnam/',
  'https://startupgrantsindia.com/top-10-startups-in-visakhapatnam/',
  'https://echai.ventures/stories/startups-in-visakhapatnam',
  'https://andhrastartupmap.in/vizag',
  'https://startuptalky.com/vizag-startups/',
  'https://www.startupgrantsindia.com/incubators/in-visakhapatnam',
  'https://echai.ventures/visakhapatnam/fintech',
];

// Pre-filter exclusion patterns (Rule 3A)
export const EXCLUSION_TERMS = [
  'restaurant', 'cafe', 'bistro', 'dhaba', 'bakery', 'kitchen', 'hotel', 'resort', 'lodge',
  'hospital', 'clinic', 'diagnostic center', 'pharmacy', 'medical store',
  'school', 'junior college', 'degree college', 'high school', 'vidyalaya', 'university', 'college', 'polytechnic',
  'bank', 'atm', 'finance corporation', 'cooperative bank',
  'temple', 'church', 'mosque', 'ashram',
  'salon', 'spa', 'beauty parlour', 'gym', 'fitness', 'yoga',
  'real estate', 'realtors', 'builders', 'properties', 'housing',
  'travels', 'tours', 'car rental', 'taxi',
  'tuition', 'coaching', 'training institute', 'classes', 'spoken english',
  'staffing', 'recruitment', 'manpower', 'placement consultancy',
];

// Disallowed corporate branches / enterprise multinationals (Rule 3A)
export const BANNED_MNC_NAMES = [
  'tcs', 'tata consultancy services',
  'infosys',
  'wipro',
  'tech mahindra',
  'hcl', 'hcl tech', 'hcl technologies',
  'cognizant', 'cts',
  'accenture',
  'capgemini',
  'ibm',
  'deloitte',
  'amazon', 'aws',
  'google', 'alphabet',
  'microsoft',
  'oracle',
  'dxc', 'dxc technology',
  'hexaware',
  'mphasis',
  'virtusa',
  'genpact',
  'l&t infotech', 'lti', 'mindtree', 'ltimindtree',
];
