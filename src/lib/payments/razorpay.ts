// Modular Razorpay Subscriptions integration (India, INR)
// Kept in one isolated module so the payment provider can be swapped easily.

import crypto from 'crypto';
import { PRICING_CONFIG } from '@/config/pricing';

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'sample_webhook_secret';

export interface CreateSubscriptionParams {
  planId: string;
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

/**
 * Creates a recurring subscription order in Razorpay.
 * In development or when test keys are not configured, provides a mock response.
 */
export async function createRazorpaySubscription({
  planId,
  totalCount = 12,
  customerEmail,
  notes = {},
}: CreateSubscriptionParams): Promise<SubscriptionResponse> {
  const isConfigured =
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.includes('sample');

  if (isConfigured) {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1,
        notes: {
          ...notes,
          customer_email: customerEmail || 'unregistered',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description || 'Razorpay subscription creation failed');
    }

    return await res.json();
  }

  // Resilient mock fallback for development & preview environments
  return {
    id: `sub_${Date.now()}_mock`,
    plan_id: planId,
    status: 'created',
    current_start: Math.floor(Date.now() / 1000),
    current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
    short_url: 'https://rzp.io/i/mock_subscription',
  };
}

/**
 * Securely verifies the Razorpay Webhook signature using HMAC-SHA256.
 * Timing-safe comparison prevents timing attacks.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret = RAZORPAY_WEBHOOK_SECRET
): boolean {
  if (!signature || !secret || !rawBody) {
    return false;
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * Returns plan details and prices by product and billing interval.
 */
export function getPlanDetails(
  product: 'pro' | 'featured',
  interval: 'monthly' | 'yearly'
) {
  const plan = PRICING_CONFIG[product][interval];
  return {
    product,
    interval,
    amount: plan.amount,
    currency: PRICING_CONFIG.currency,
    displayPrice: plan.displayPrice,
    planId: plan.planId,
  };
}
