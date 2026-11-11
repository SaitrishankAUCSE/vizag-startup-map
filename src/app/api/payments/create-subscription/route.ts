import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    free: true,
    message: 'Vizag Startup Map is 100% free. No payment system or subscription required.',
  });
}
