// Payments have been completely removed.
// All ecosystem features on Vizag Startup Map are 100% free and open for the community.

export const PAYMENTS_ENABLED = false;
export const RAZORPAY_KEY_ID = '';
export const RAZORPAY_KEY_SECRET = '';
export const RAZORPAY_WEBHOOK_SECRET = '';

export interface CreateSubscriptionParams {
  planId?: string;
  totalCount?: number;
  customerEmail?: string;
  notes?: Record<string, string>;
}

export interface SubscriptionResponse {
  id: string;
  plan_id: string;
  status: string;
  current_start?: number;
  current_end?: number;
  short_url?: string;
}

export async function createRazorpaySubscription(): Promise<SubscriptionResponse> {
  return {
    id: 'free_community_tier',
    plan_id: 'free_community',
    status: 'active',
  };
}

export function verifyRazorpayWebhookSignature(): boolean {
  return false;
}

export function getPlanDetails() {
  return {
    planId: 'free',
    amount: 0,
    currency: 'INR',
    displayPrice: '₹0',
  };
}
