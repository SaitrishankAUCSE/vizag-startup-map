import { NextRequest, NextResponse } from 'next/server';
import {
  createRazorpaySubscription,
  getPlanDetails,
  RAZORPAY_KEY_ID,
} from '@/lib/payments/razorpay';
import { z } from 'zod';

const subscriptionRequestSchema = z.object({
  product: z.enum(['pro', 'featured']),
  interval: z.enum(['monthly', 'yearly']),
  customerEmail: z.string().email().optional(),
  listingId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscriptionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid subscription request' },
        { status: 400 }
      );
    }

    const { product, interval, customerEmail, listingId } = parsed.data;
    const planDetails = getPlanDetails(product, interval);

    const subscription = await createRazorpaySubscription({
      planId: planDetails.planId,
      totalCount: interval === 'yearly' ? 5 : 12,
      customerEmail,
      notes: {
        product,
        interval,
        listing_id: listingId || '',
        customer_email: customerEmail || '',
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      keyId: RAZORPAY_KEY_ID,
      amount: planDetails.amount,
      currency: planDetails.currency,
      displayPrice: planDetails.displayPrice,
      product,
      interval,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Subscription generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
