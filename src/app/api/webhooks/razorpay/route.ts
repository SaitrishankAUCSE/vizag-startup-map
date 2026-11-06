import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';
import { getAdminFirestore } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook HMAC-SHA256 signature strictly. NEVER trust unverified payloads.
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const subscription = payload.payload?.subscription?.entity;

    if (!subscription) {
      return NextResponse.json({ received: true });
    }

    const {
      id: razorpaySubId,
      current_end: currentEndUnix,
      notes = {},
    } = subscription;

    const product = notes.product || 'pro';
    const customerEmail = notes.customer_email;
    const listingId = notes.listing_id;
    const currentPeriodEnd = currentEndUnix
      ? new Date(currentEndUnix * 1000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();

    const db = getAdminFirestore();
    const now = new Date().toISOString();

    switch (event) {
      case 'subscription.authenticated':
      case 'subscription.activated': {
        if (db) {
          // Upgrade user plan to pro by email
          if (product === 'pro' && customerEmail) {
            const profileSnap = await db
              .collection('profiles')
              .where('email', '==', customerEmail)
              .limit(1)
              .get();
            if (!profileSnap.empty) {
              await profileSnap.docs[0].ref.update({ plan: 'pro', updated_at: now });
            }
          } else if (product === 'featured' && listingId) {
            await db.collection('listings').doc(listingId).update({
              is_boosted: true,
              boosted_until: currentPeriodEnd,
              updated_at: now,
            });
          }

          // Upsert subscription record
          const subSnap = await db
            .collection('subscriptions')
            .where('razorpay_subscription_id', '==', razorpaySubId)
            .limit(1)
            .get();

          const subData = {
            razorpay_subscription_id: razorpaySubId,
            product,
            listing_id: listingId || null,
            status: 'active',
            current_period_end: currentPeriodEnd,
            updated_at: now,
          };

          if (subSnap.empty) {
            await db.collection('subscriptions').add({ ...subData, created_at: now });
          } else {
            await subSnap.docs[0].ref.update(subData);
          }
        }
        break;
      }

      case 'subscription.charged': {
        if (db) {
          if (product === 'featured' && listingId) {
            await db.collection('listings').doc(listingId).update({
              is_boosted: true,
              boosted_until: currentPeriodEnd,
              updated_at: now,
            });
          }

          const subSnap = await db
            .collection('subscriptions')
            .where('razorpay_subscription_id', '==', razorpaySubId)
            .limit(1)
            .get();
          if (!subSnap.empty) {
            await subSnap.docs[0].ref.update({
              status: 'active',
              current_period_end: currentPeriodEnd,
              updated_at: now,
            });
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        if (db) {
          const subSnap = await db
            .collection('subscriptions')
            .where('razorpay_subscription_id', '==', razorpaySubId)
            .limit(1)
            .get();
          if (!subSnap.empty) {
            await subSnap.docs[0].ref.update({ status: 'cancelled', updated_at: now });
          }
        }
        break;
      }

      case 'subscription.completed':
      case 'subscription.expired':
      case 'subscription.halted': {
        if (db) {
          if (product === 'pro' && customerEmail) {
            const profileSnap = await db
              .collection('profiles')
              .where('email', '==', customerEmail)
              .limit(1)
              .get();
            if (!profileSnap.empty) {
              await profileSnap.docs[0].ref.update({ plan: 'free', updated_at: now });
            }
          } else if (product === 'featured' && listingId) {
            await db.collection('listings').doc(listingId).update({
              is_boosted: false,
              boosted_until: null,
              updated_at: now,
            });
          }

          const subSnap = await db
            .collection('subscriptions')
            .where('razorpay_subscription_id', '==', razorpaySubId)
            .limit(1)
            .get();
          if (!subSnap.empty) {
            await subSnap.docs[0].ref.update({ status: 'expired', updated_at: now });
          }
        }
        break;
      }

      case 'payment.failed': {
        console.warn(`[Razorpay Webhook] Payment failed for subscription: ${razorpaySubId}`);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ success: true, event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
