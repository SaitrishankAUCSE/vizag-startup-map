import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubmission } from '@/lib/supabase/service';

// In-memory rate limiting map: ip -> timestamps
const rateLimitMap = new Map<string, number[]>();

const submissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['startup', 'investor', 'incubator', 'campus', 'coworking']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  sector: z.string().min(2),
  stage: z.string().min(2),
  area: z.string().min(2),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  lat: z.number().min(17.0).max(18.5),
  lng: z.number().min(82.5).max(84.0),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  founder_name: z.string().min(2, 'Founder name is required'),
  contact_email: z.string().email('Valid contact email is required'),
  // Honeypot field for bot spam protection:
  hp_website_confirm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];

    // Filter to last 60 seconds
    const recent = timestamps.filter((t) => now - t < 60000);
    if (recent.length >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);

    const body = await req.json();

    // Check honeypot field
    if (body.hp_website_confirm && body.hp_website_confirm.trim() !== '') {
      // Quietly reject bot
      return NextResponse.json({ success: true, message: 'Submission received' });
    }

    const validated = submissionSchema.parse(body);

    const listingData = {
      name: validated.name,
      type: validated.type,
      description: validated.description,
      sector: validated.sector,
      stage: validated.stage,
      area: validated.area,
      address: validated.address,
      lat: validated.lat,
      lng: validated.lng,
      website: validated.website || null,
      linkedin: validated.linkedin || null,
      logo_url: validated.logo_url || null,
    };

    const result = await createSubmission(
      listingData,
      validated.founder_name,
      validated.contact_email
    );

    return NextResponse.json({
      success: true,
      message: 'Your submission has been received and is pending review by our moderation team.',
      id: result.id,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your submission.' },
      { status: 500 }
    );
  }
}
