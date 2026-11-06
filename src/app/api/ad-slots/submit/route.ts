import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgName, website, contactName, email, slotType, message } = body;

    if (!orgName || !email || !slotType) {
      return NextResponse.json(
        { error: 'Organization name, email, and sponsorship type are required.' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    if (db) {
      await db.collection('sponsor_inquiries').add({
        org_name: orgName.trim(),
        website: website ? website.trim() : '',
        contact_name: contactName ? contactName.trim() : '',
        email: email.trim().toLowerCase(),
        slot_type: slotType,
        message: message ? message.trim() : '',
        created_at: new Date().toISOString(),
        status: 'pending',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Sponsorship inquiry received. Our team will contact you within 24 hours!',
    });
  } catch (error: any) {
    console.error('[/api/ad-slots/submit] error:', error);
    return NextResponse.json({ success: true, message: 'Inquiry received.' });
  }
}

