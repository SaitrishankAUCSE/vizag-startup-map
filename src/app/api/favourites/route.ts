import { NextRequest, NextResponse } from 'next/server';
import { getFavourites, addFavourite, removeFavourite } from '@/lib/supabase/service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'mock_user_1';

    const favourites = await getFavourites(userId);
    return NextResponse.json({ favourites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch favourites';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, listName, userId = 'mock_user_1', userPlan = 'free' } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    // Server-side verification for Pro Plan!
    // Check user's profile in Supabase if authenticated, or enforce plan parameter
    let isPro = userPlan === 'pro';

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan === 'pro') {
          isPro = true;
        }
      }
    }

    if (!isPro) {
      return NextResponse.json(
        {
          error: 'Saving favourites and creating named lists is a Pro feature.',
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    const ok = await addFavourite(userId, listingId, listName || 'My Watchlist');
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save favourite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId') || 'mock_user_1';

    if (!listingId) {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    }

    const ok = await removeFavourite(userId, listingId);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove favourite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
