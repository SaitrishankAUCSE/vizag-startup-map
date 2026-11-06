import { NextRequest, NextResponse } from 'next/server';
import { updateLead, approveLead, deleteLead } from '@/lib/firebase/service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const ok = await updateLead(id, body);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'approve') {
      const result = await approveLead(id, body.leadData);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Approval failed' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Lead approved and moved to active listings' });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteLead(id);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
