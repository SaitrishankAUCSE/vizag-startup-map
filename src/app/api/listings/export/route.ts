import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/supabase/service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planParam = searchParams.get('plan');

    let isPro = planParam === 'pro';

    // Verify authenticated user profile if available
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, role')
          .eq('id', user.id)
          .single();
        if (profile?.plan === 'pro' || profile?.role === 'admin') {
          isPro = true;
        }
      }
    }

    if (!isPro) {
      return NextResponse.json(
        {
          error: 'Exporting directory listings to CSV is a Pro feature.',
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    const listings = await getListings();

    const headers = [
      'name',
      'type',
      'description',
      'sector',
      'stage',
      'area',
      'address',
      'lat',
      'lng',
      'website',
      'linkedin',
      'founded_year',
      'team_size',
      'funding_range',
      'is_featured',
      'is_verified',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listings.map((l) => [
      escapeCsv(l.name),
      escapeCsv(l.type),
      escapeCsv(l.description),
      escapeCsv(l.sector),
      escapeCsv(l.stage),
      escapeCsv(l.area),
      escapeCsv(l.address),
      l.lat,
      l.lng,
      escapeCsv(l.website || ''),
      escapeCsv(l.linkedin || ''),
      l.founded_year || '',
      escapeCsv(l.team_size || ''),
      escapeCsv(l.funding_range || ''),
      l.is_featured,
      l.is_verified,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vizag_startups_${Date.now()}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
