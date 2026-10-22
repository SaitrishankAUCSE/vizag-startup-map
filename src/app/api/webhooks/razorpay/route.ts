import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

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
      status: subStatus,
      current_end: currentEndUnix,
      notes = {},
    } = subscription;

    const product = notes.product || 'pro';
    const customerEmail = notes.customer_email;
    const listingId = notes.listing_id;
    const currentPeriodEnd = currentEndUnix
      ? new Date(currentEndUnix * 1000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();

    const supabaseAdmin = createAdminClient();

    switch (event) {
      case 'subscription.authenticated':
      case 'subscription.activated': {
        // Upgrade user plan or mark startup as featured
        if (supabaseAdmin) {
          if (product === 'pro' && customerEmail) {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'pro', updated_at: new Date().toISOString() })
              .eq('email', customerEmail);
          } else if (product === 'featured' && listingId) {
            await supabaseAdmin
              .from('listings')
              .update({
                is_featured: true,
                featured_until: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              })
              .eq('id', listingId);
          }

          // Record in subscriptions table
          await supabaseAdmin.from('subscriptions').upsert(
            {
              razorpay_subscription_id: razorpaySubId,
              product,
              listing_id: listingId || null,
              status: 'active',
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'razorpay_subscription_id' }
          );
        }
        break;
      }

      case 'subscription.charged': {
        // Renewed: extend period end
        if (supabaseAdmin) {
          if (product === 'featured' && listingId) {
            await supabaseAdmin
              .from('listings')
              .update({
                is_featured: true,
                featured_until: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              })
              .eq('id', listingId);
          }

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', razorpaySubId);
        }
        break;
      }

      case 'subscription.cancelled': {
        // Cancelled: retain access until current_period_end, mark status
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', razorpaySubId);
        }
        break;
      }

      case 'subscription.completed':
      case 'subscription.expired':
      case 'subscription.halted': {
        // When plan ends, quietly return the user to Free and remove premium features
        if (supabaseAdmin) {
          if (product === 'pro' && customerEmail) {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'free', updated_at: new Date().toISOString() })
              .eq('email', customerEmail);
          } else if (product === 'featured' && listingId) {
            await supabaseAdmin
              .from('listings')
              .update({
                is_featured: false,
                featured_until: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', listingId);
          }

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', razorpaySubId);
        }
        break;
      }

      case 'payment.failed': {
        // Log payment failure
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
