import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import fs from 'fs';
import path from 'path';

const RESERVATIONS_FILE = path.join(process.cwd(), 'src', 'data', 'showcase_reservations.json');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgName,
      website,
      targetUrl,
      headline,
      pitch,
      ctaLabel,
      contactName,
      email,
      slotType,
      cycleWindow,
      cycleDates,
      amount,
    } = body;

    if (!orgName || !email) {
      return NextResponse.json(
        { error: 'Organization name and contact email are required.' },
        { status: 400 }
      );
    }

    const bookingId = `VSM-SHOWCASE-${Date.now().toString(36).toUpperCase()}`;

    const reservationRecord = {
      booking_id: bookingId,
      org_name: orgName.trim(),
      website: website ? website.trim() : '',
      target_url: targetUrl ? targetUrl.trim() : website || '',
      headline: headline ? headline.trim() : `${orgName} on Vizag Startup Map`,
      pitch: pitch ? pitch.trim() : '',
      cta_label: ctaLabel || 'Visit Website →',
      contact_name: contactName ? contactName.trim() : '',
      email: email.trim().toLowerCase(),
      slot_type: slotType || 'STANDARD_7D',
      cycle_window: cycleWindow || 'Next Upcoming Cycle',
      cycle_dates: cycleDates || null,
      amount: amount || 2499,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    // 1. Save to local fallback file
    try {
      const dir = path.dirname(RESERVATIONS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let existing: any[] = [];
      if (fs.existsSync(RESERVATIONS_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(RESERVATIONS_FILE, 'utf-8'));
          if (!Array.isArray(existing)) existing = [];
        } catch {}
      }
      existing.push(reservationRecord);
      fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Showcase Reservation] Local file write warning:', err);
    }

    // 2. Save to Firestore
    try {
      const db = getAdminFirestore();
      if (db) {
        await db.collection('showcase_reservations').doc(bookingId).set(reservationRecord);
      }
    } catch (err) {
      console.warn('[Showcase Reservation] Firestore set warning:', err);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Showcase slot successfully reserved!',
    });
  } catch (error: any) {
    console.error('[/api/ad-slots/submit] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process reservation.' },
      { status: 500 }
    );
  }
}
