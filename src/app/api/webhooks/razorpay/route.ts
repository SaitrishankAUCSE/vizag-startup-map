import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    received: true,
    payments: 'disabled',
    message: 'Payment system has been permanently disabled. All platform access is free.',
  });
}
