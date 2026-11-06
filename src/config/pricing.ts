// Pricing Plans for Vizag Startup Map (INR, Razorpay Subscriptions)

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

  // Pro Plan (For individuals: job seekers, researchers, tech talent, founders)
  pro: {
    monthly: {
      amount: 99,
      displayPrice: '₹99',
      period: 'month',
      planId: process.env.RAZORPAY_PLAN_PRO_MONTHLY || 'plan_pro_monthly',
    },
    yearly: {
      amount: 799,
      displayPrice: '₹799',
      period: 'year',
      savings: 'Save ~33%',
      planId: process.env.RAZORPAY_PLAN_PRO_YEARLY || 'plan_pro_yearly',
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

  // 7-Day Spotlight Boost (For startups launching or actively hiring)
  boost: {
    amount: 499,
    displayPrice: '₹499',
    period: '7 days',
    features: [
      '2x marker dimensions across all city map zoom levels',
      'Unclustered priority (never collapsed into coordinate numbers)',
      'Radar amber pulse ring directing active founder & talent discovery',
      'Promoted pin placement in area & search filters',
      'Live within 5–10 minutes of confirmation',
    ],
  },

  // Featured Listing Plan (For startups wanting continuous top placement)
  featured: {
    monthly: {
      amount: 499,
      displayPrice: '₹499',
      period: 'month',
      planId: process.env.RAZORPAY_PLAN_FEATURED_MONTHLY || 'plan_featured_monthly',
    },
    yearly: {
      amount: 3999,
      displayPrice: '₹3,999',
      period: 'year',
      savings: 'Save ~33%',
      planId: process.env.RAZORPAY_PLAN_FEATURED_YEARLY || 'plan_featured_yearly',
    },
    features: [
      'Larger highlighted 54px pin with pulsing Marigold gold accent ring',
      'Top-of-list placement in all area, sector, and search queries',
      'Distinguished "Featured" badge across map, grid, and detail views',
      'Extended company description and direct pitch deck / demo link',
      'Post up to 5 active job openings with direct applicant routing',
      'Founder analytics dashboard (profile views & career click metrics)',
      'Direct social & recruiter contact buttons',
    ],
  },
};
