// Free Community Access Configuration for Vizag Startup Map (100% Free, No Payments)

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  targetUser: string;
}

export const PRICING_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',

  // Free Ecosystem Access (For individuals: job seekers, researchers, tech talent, founders)
  pro: {
    monthly: {
      amount: 0,
      displayPrice: 'Free',
      period: 'forever',
      planId: 'free_community',
    },
    yearly: {
      amount: 0,
      displayPrice: 'Free',
      period: 'forever',
      savings: '100% Free',
      planId: 'free_community',
    },
    features: [
      'Export full filtered directory to CSV & JSON',
      'Save favourite startups and create named lists',
      'Instant job alerts when tracked startups post new roles',
      'Direct founder & leadership LinkedIn / contact handles',
      'Advanced filters: founded year, team size, funding, landlocked zones',
      'Private notes on startups & interview tracking',
      'Monthly Vizag Ecosystem Intelligence & Growth Report',
      'Early access to newly verified startup discoveries',
      'Ad-free, maximum speed map experience',
    ],
  },

  // 7-Day Spotlight Boost (For startups launching or actively hiring - 100% Free)
  boost: {
    amount: 0,
    displayPrice: 'Free',
    period: '7 days',
    features: [
      '2x marker dimensions across all city map zoom levels',
      'Unclustered priority (never collapsed into coordinate numbers)',
      'Radar amber pulse ring directing active founder & talent discovery',
      'Promoted pin placement in area & search filters',
      'Live within 5–10 minutes of confirmation',
    ],
  },

  // Community Showcase (For startups wanting continuous top placement - 100% Free)
  featured: {
    monthly: {
      amount: 0,
      displayPrice: 'Free',
      period: 'forever',
      planId: 'free_showcase',
    },
    yearly: {
      amount: 0,
      displayPrice: 'Free',
      period: 'forever',
      savings: '100% Free',
      planId: 'free_showcase',
    },
    features: [
      'Larger highlighted 54px pin with pulsing Marigold gold accent ring',
      'Top-of-list placement in all area, sector, and search queries',
      'Distinguished "Featured" badge across map, grid, and detail views',
      'Extended company description and direct pitch deck / demo link',
      'Post active job openings with direct applicant routing',
      'Founder analytics dashboard (profile views & career click metrics)',
      'Direct social & recruiter contact buttons',
    ],
  },
};
