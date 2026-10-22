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

  // Pro Plan (For individuals: job seekers, researchers, investors)
  pro: {
    monthly: {
      amount: 199,
      displayPrice: '₹199',
      period: 'month',
      planId: process.env.RAZORPAY_PLAN_PRO_MONTHLY || 'plan_pro_monthly',
    },
    yearly: {
      amount: 1499,
      displayPrice: '₹1,499',
      period: 'year',
      savings: 'Save ~37%',
      planId: process.env.RAZORPAY_PLAN_PRO_YEARLY || 'plan_pro_yearly',
    },
    features: [
      'Export filtered directory to CSV',
      'Save favourite startups and create named lists',
      'Instant email alerts for new startups in chosen sectors/areas',
      'Job alerts when tracked startups post new roles',
      'Advanced filters: founded year, team size, funding range',
      'Ad-free, high-speed map experience',
      'Early access to new ecosystem datasets',
    ],
  },

  // Featured Listing Plan (For startups wanting maximum visibility)
  featured: {
    monthly: {
      amount: 999,
      displayPrice: '₹999',
      period: 'month',
      planId: process.env.RAZORPAY_PLAN_FEATURED_MONTHLY || 'plan_featured_monthly',
    },
    yearly: {
      amount: 7999,
      displayPrice: '₹7,999',
      period: 'year',
      savings: 'Save ~33%',
      planId: process.env.RAZORPAY_PLAN_FEATURED_YEARLY || 'plan_featured_yearly',
    },
    features: [
      'Larger highlighted map pin with pulsing accent ring',
      'Top-of-list placement in all area, sector, and search queries',
      'Distinguished "Featured" badge across all views',
      'Extended company description and 3-image photo gallery',
      'Post up to 5 active job openings (free listings get 1)',
      'Founder analytics dashboard (track profile views & website clicks)',
      'Direct social & pitch deck link buttons',
    ],
  },
};
