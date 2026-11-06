/**
 * Creator & Engineer Configuration for Vizag Startup Map
 * Conceived, designed, and developed by Venkata Sai Trishank Kamma
 */
export const CREATOR_CONFIG = {
  /** Display Name */
  name: 'Trishank Kamma',
  fullName: 'Venkata Sai Trishank Kamma',
  initials: 'TK',

  /** Title & Identity */
  role: 'Developer & Creator, Vizag Startup Map',
  tagline: 'Full-Stack Software Engineer · Andhra University College of Engineering (AU CSE)',
  bio: 'Conceived, designed, and developed the Vizag Startup Map to chronicle Visakhapatnam\'s accelerating tech ecosystem — engineering a real-time atlas of 60+ verified ventures, active hiring feeds, and automated morning intelligence.',

  /** Location */
  location: 'Visakhapatnam, Andhra Pradesh',

  /** Contact Information */
  email: 'trishankofficial1311@gmail.com',
  phone: '+91-8179369677',
  phoneFormatted: '+91 81793 69677',

  /** Social & Professional Links */
  linkedinUrl: 'https://linkedin.com/in/saitrishank',
  githubUrl: 'https://github.com/SaitrishankAUCSE',
  portfolioUrl: 'https://github.com/SaitrishankAUCSE',

  /** Engineering Stack Behind Vizag Startup Map */
  stack: [
    'Next.js 16 (App Router)',
    'TypeScript',
    'Tailwind CSS',
    'Leaflet & OpenStreetMap',
    'Firebase Firestore',
    'Python & Web Scraping',
    'Resend Email Engine',
  ],

  /** Architectural Highlights of Vizag Startup Map */
  architectureHighlights: [
    {
      title: 'Geospatial Intelligence Engine',
      description: 'Custom Leaflet & CartoDB engine mapping 60+ ventures across Rushikonda IT SEZ, AMTZ, and university hubs with sub-kilometer coordinates.',
    },
    {
      title: 'Automated Morning Digest System',
      description: 'Zero-noise cron engine batching newly approved startups and open engineering roles into a consolidated morning briefing.',
    },
    {
      title: '1-Click Ecosystem Data Export',
      description: 'RFC 4180-compliant real-time CSV and JSON export engine for researchers, founders, and community analysts.',
    },
  ],
} as const;
