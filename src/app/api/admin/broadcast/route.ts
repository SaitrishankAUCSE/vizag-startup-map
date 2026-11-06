import { NextRequest, NextResponse } from 'next/server';
import { notifySubscribersOfNewStartup } from '@/lib/email/resend';
import { getListingBySlug } from '@/lib/firebase/service';

export async function POST(req: NextRequest) {
  try {
    const { slug, name, sector, area, description, website } = await req.json();

    let startupData = {
      name,
      slug,
      sector,
      area,
      description,
      website,
    };

    if (slug && !name) {
      const existing = await getListingBySlug(slug);
      if (existing) {
        startupData = {
          name: existing.name,
          slug: existing.slug,
          sector: existing.sector,
          area: existing.area,
          description: existing.description || existing.one_liner,
          website: existing.website,
        };
      }
    }

    if (!startupData.name || !startupData.slug) {
      return NextResponse.json({ error: 'Startup slug or details required.' }, { status: 400 });
    }

    const result = await notifySubscribersOfNewStartup(startupData);

    return NextResponse.json({
      success: true,
      message: `Broadcasted email alert for "${startupData.name}" to ${result.totalSent} subscriber(s).`,
      recipients: result.recipientEmails,
    });
  } catch (error: any) {
    console.error('[/api/admin/broadcast] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to broadcast alert.' }, { status: 500 });
  }
}
