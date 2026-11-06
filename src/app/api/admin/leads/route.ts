import { NextRequest, NextResponse } from 'next/server';
import { getLeads, createListingWithSource } from '@/lib/firebase/service';
import { Listing } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leadData: Partial<Listing> = {
      ...body,
      status: 'lead',
      is_verified: false,
    };

    const result = await createListingWithSource(leadData, {
      source_type: 'manual_research',
      source_url: body.source_url || null,
      note: body.source_note || 'Imported lead',
    });

    return NextResponse.json({ success: true, id: result.id, slug: result.slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create lead' }, { status: 400 });
  }
}
