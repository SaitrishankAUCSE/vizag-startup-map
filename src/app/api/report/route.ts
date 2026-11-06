import { NextRequest, NextResponse } from 'next/server';
import { createReport } from '@/lib/firebase/service';
import { z } from 'zod';

const reportSchema = z.object({
  listing_id: z.string().min(1, 'Listing ID is required'),
  kind: z.enum(['incorrect_data', 'remove_listing', 'duplicate']),
  message: z.string().min(5, 'Please provide more details (min 5 chars)'),
  reporter_email: z.string().email('Valid email is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reportSchema.parse(body);

    const result = await createReport(
      parsed.listing_id,
      parsed.kind,
      parsed.message,
      parsed.reporter_email
    );

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Report submitted. Our moderation team will review this within 48 hours.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const issueMessage = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message;
      return NextResponse.json(
        { success: false, error: issueMessage || 'Invalid form input' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
