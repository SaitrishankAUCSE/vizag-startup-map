// Directory filters, type mappings — STRICT 3-COLOR PALETTE
// Palette: #DDE3E8 Ice Silver | #3A0F34 Deep Aubergine | #EAAA00 Marigold

export const LISTING_TYPES = [
  { id: 'all', label: 'All', color: '#3A0F34' },
  { id: 'startup', label: 'Startups', icon: 'Rocket', color: '#3A0F34' },
  { id: 'investor', label: 'Investors', icon: 'Briefcase', color: '#EAAA00' },
  { id: 'incubator', label: 'Incubators', icon: 'Sparkles', color: '#3A0F34' },
  { id: 'campus', label: 'Campuses', icon: 'GraduationCap', color: '#EAAA00' },
  { id: 'coworking', label: 'Coworking', icon: 'Building2', color: '#3A0F34' },
] as const;

// All type colors strictly within the 3-color system
export const TYPE_COLORS: Record<string, { bg: string; text: string; ring: string; hex: string }> = {
  startup:  { bg: 'bg-[#3A0F34]/10',  text: 'text-[#3A0F34]',   ring: 'ring-[#3A0F34]', hex: '#3A0F34' },
  investor: { bg: 'bg-[#EAAA00]/20',  text: 'text-[#3A0F34]',   ring: 'ring-[#EAAA00]', hex: '#EAAA00' },
  incubator:{ bg: 'bg-[#3A0F34]/10',  text: 'text-[#3A0F34]',   ring: 'ring-[#3A0F34]', hex: '#3A0F34' },
  campus:   { bg: 'bg-[#EAAA00]/15',  text: 'text-[#3A0F34]',   ring: 'ring-[#EAAA00]', hex: '#EAAA00' },
  coworking:{ bg: 'bg-[#3A0F34]/8',   text: 'text-[#3A0F34]',   ring: 'ring-[#3A0F34]', hex: '#3A0F34' },
};

// Pin tile colors for logo fallback tiles (alternates by name hash)
export const PIN_TILE_VARIANTS = [
  { bg: '#EAAA00', text: '#3A0F34' }, // marigold bg, aubergine text
  { bg: '#3A0F34', text: '#DDE3E8' }, // aubergine bg, silver text
] as const;

export const AREAS = [
  'Rushikonda',
  'Madhurawada',
  'MVP Colony',
  'Siripuram',
  'Dwaraka Nagar',
  'Seethammadhara',
  'Beach Road',
  'Gajuwaka',
  'Pendurthi',
  'Other',
] as const;

export const STAGES = [
  'Pre-seed',
  'Seed',
  'Bootstrapped',
  'Series A',
  'Series B',
  'Series C+',
  'Acquired',
  'Public',
] as const;

export const SECTORS = [
  'AI',
  'SaaS',
  'Fintech',
  'Edtech',
  'Healthtech',
  'Pharma',
  'Logistics and Port',
  'Tourism',
  'Agritech',
  'Consumer',
  'D2C',
  'Deeptech',
  'Gaming',
  'Other',
] as const;

export const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

export const FUNDING_RANGES = [
  'Bootstrapped',
  'Under ₹1 Cr',
  '₹1 Cr - ₹5 Cr',
  '₹5 Cr - ₹25 Cr',
  '₹25 Cr - ₹100 Cr',
  '₹100 Cr+',
] as const;

// Coastline points for Visakhapatnam (lat, lng pairs) for distance-to-beach computation
export const VIZAG_COASTLINE_POINTS: [number, number][] = [
  [17.6833, 83.2980], // Dolphin's Nose Lighthouse
  [17.6970, 83.3080], // Port & Naval Base
  [17.7130, 83.3220], // Ramakrishna (RK) Beach
  [17.7280, 83.3370], // VUDA Park / Coastal Battery
  [17.7420, 83.3480], // Lawson's Bay / MVP Beach
  [17.7650, 83.3670], // Sagar Nagar Beach
  [17.7818, 83.3850], // Rushikonda Beach & Hill Promenade
  [17.8180, 83.4100], // Thotlakonda Buddhist Beach
  [17.8900, 83.4560], // Bheemunipatnam (Bheemili) Dutch Beach
];
