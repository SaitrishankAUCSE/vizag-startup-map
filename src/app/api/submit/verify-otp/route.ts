import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyOtp } from '@/lib/verification/otp';

const verifyOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid code format' },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;
    const result = await verifyOtp(email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      message: 'Email successfully verified!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error verifying code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

