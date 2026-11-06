import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAndSendOtp } from '@/lib/verification/otp';

const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  startupName: z.string().min(1, 'Startup name is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, startupName } = parsed.data;
    const result = await createAndSendOtp(email, startupName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      dev_code: result.dev_code,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error sending verification code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

