import { NextRequest, NextResponse } from 'next/server';
import { updateListingProfile, getAdminFirestore } from '@/lib/firebase/service';
import { detectAtsFromUrl } from '@/lib/ats/detect';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, description, website, linkedin, logo_url, team_size, funding_text, ats_url } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const updates: any = {};
    if (description !== undefined) updates.description = description;
    if (website !== undefined) updates.website = website;
    if (linkedin !== undefined) updates.linkedin_url = linkedin;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (team_size !== undefined) {
      updates.team_size = team_size;
      updates.team_size_source = 'Updated by founder';
    }
    if (funding_text !== undefined) {
      updates.funding_text = funding_text;
      updates.funding_source_url = website || null;
    }

    const ok = await updateListingProfile(listingId, updates);

    // If ATS URL is provided, save or update the ats_boards collection
    if (ats_url && ats_url.trim()) {
      const ats = detectAtsFromUrl(ats_url);
      if (ats.provider && ats.boardSlug) {
        const db = getAdminFirestore();
        if (db) {
          const boardsRef = db.collection('ats_boards');
          const existing = await boardsRef.where('listing_id', '==', listingId).get();
          if (!existing.empty) {
            await existing.docs[0].ref.update({
              provider: ats.provider,
              board_slug: ats.boardSlug,
              consecutive_failures: 0,
            });
          } else {
            await boardsRef.add({
              listing_id: listingId,
              provider: ats.provider,
              board_slug: ats.boardSlug,
              consecutive_failures: 0,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json({ success: ok, message: 'Profile updated successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
