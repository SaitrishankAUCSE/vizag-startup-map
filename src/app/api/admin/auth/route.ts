import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, createAdminToken, verifyAdminRequest } from '@/lib/verification/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Incorrect Admin Passkey. Access Denied.' },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: 'Admin access authorized.',
      token,
    });

    // Also set an HTTP-only cookie for secure browser navigation
    response.cookies.set('vsm_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const isAuthorized = verifyAdminRequest(req);
  return NextResponse.json({ authenticated: isAuthorized });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Admin session terminated.' });
  response.cookies.delete('vsm_admin_token');
  return response;
}
