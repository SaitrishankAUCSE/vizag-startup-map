import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/service';

// Favourites are stored in Firestore under collection 'favourites'.
// Pro plan check: verified via Firebase Auth custom claims in the header.
// Without a full Auth middleware, the isPro flag falls back to query param.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ favourites: [] });
    }

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ favourites: [] });

    const snap = await db
      .collection('favourites')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const favourites = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ favourites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch favourites';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, listName, userId, userPlan = 'free' } = body;

    if (!listingId || !userId) {
      return NextResponse.json({ error: 'listingId and userId are required' }, { status: 400 });
    }

    // TODO: verify Firebase ID token for plan check
    const isPro = userPlan === 'pro';

    if (!isPro) {
      return NextResponse.json(
        {
          error: 'Saving favourites and creating named lists is a Pro feature.',
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });

    const now = new Date().toISOString();
    await db.collection('favourites').add({
      user_id: userId,
      listing_id: listingId,
      list_name: listName || 'My Watchlist',
      created_at: now,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save favourite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');

    if (!listingId || !userId) {
      return NextResponse.json({ error: 'listingId and userId required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ success: false }, { status: 503 });

    const snap = await db
      .collection('favourites')
      .where('user_id', '==', userId)
      .where('listing_id', '==', listingId)
      .limit(1)
      .get();

    if (!snap.empty) {
      await snap.docs[0].ref.delete();
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove favourite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
