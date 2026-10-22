// Directory filters, type mappings, color codes, and coastal geometry

export const LISTING_TYPES = [
  { id: 'all', label: 'All', color: '#0E4D64' },
  { id: 'startup', label: 'Startups', color: '#0E4D64', icon: 'Rocket' },
  { id: 'investor', label: 'Investors', color: '#059669', icon: 'Briefcase' },
  { id: 'incubator', label: 'Incubators', color: '#7C3AED', icon: 'Sparkles' },
  { id: 'campus', label: 'Campuses', color: '#D97706', icon: 'GraduationCap' },
  { id: 'coworking', label: 'Coworking', color: '#DB2777', icon: 'Building2' },
] as const;

export const TYPE_COLORS: Record<string, { bg: string; text: string; hex: string; ring: string }> = {
  startup: { bg: 'bg-[#0E4D64]/10', text: 'text-[#0E4D64]', hex: '#0E4D64', ring: 'ring-[#0E4D64]' },
  investor: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', hex: '#059669', ring: 'ring-emerald-500' },
  incubator: { bg: 'bg-purple-500/10', text: 'text-purple-700', hex: '#7C3AED', ring: 'ring-purple-500' },
  campus: { bg: 'bg-amber-500/10', text: 'text-amber-800', hex: '#D97706', ring: 'ring-amber-500' },
  coworking: { bg: 'bg-pink-500/10', text: 'text-pink-700', hex: '#DB2777', ring: 'ring-pink-500' },
};

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

// Coastline points for Visakhapatnam to compute distance to beach (lat, lng)
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
