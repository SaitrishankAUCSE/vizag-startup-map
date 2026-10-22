import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmailAlert } from '@/lib/email/resend';
import { z } from 'zod';

const alertSchema = z.object({
  email: z.string().email('Valid email address is required'),
  sector: z.string().optional(),
  area: z.string().optional(),
  userPlan: z.enum(['free', 'pro']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = alertSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, sector, area, userPlan = 'pro' } = parsed.data;

    if (userPlan !== 'pro') {
      return NextResponse.json(
        { error: 'Custom email alerts require an active Pro subscription.', requiresPro: true },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.from('alerts').insert({
        sector: sector || 'all',
        area: area || 'all',
      });
    }

    // Send confirmation email
    await sendEmailAlert({
      to: email,
      subject: 'Vizag Startup Map: Alert Activated',
      htmlContent: `<p>Your alert for <strong>${sector || 'All Sectors'}</strong> startups in <strong>${area || 'All Areas'}</strong> has been activated.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
