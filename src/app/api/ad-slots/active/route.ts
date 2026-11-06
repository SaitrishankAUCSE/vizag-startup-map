import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminFirestore } from '@/lib/firebase/admin';

const RESERVATIONS_FILE = path.join(process.cwd(), 'src', 'data', 'showcase_reservations.json');

export async function GET() {
  try {
    let activeShowcase = null;

    // 1. Try local JSON
    if (fs.existsSync(RESERVATIONS_FILE)) {
      try {
        const raw = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          activeShowcase = list[list.length - 1]; // most recent confirmed
        }
      } catch {}
    }

    // 2. Try Firestore
    if (!activeShowcase) {
      try {
        const db = getAdminFirestore();
        if (db) {
          const snap = await db
            .collection('showcase_reservations')
            .where('status', '==', 'confirmed')
            .limit(1)
            .get();
          if (!snap.empty) {
            activeShowcase = snap.docs[0].data();
          }
        }
      } catch {}
    }

    // Fallback default showcase if none booked yet
    if (!activeShowcase) {
      activeShowcase = {
        booking_id: 'VSM-DEFAULT',
        org_name: 'Fluentgrid',
        website: 'https://fluentgrid.com',
        target_url: 'https://fluentgrid.com',
        headline: 'Powering 100M+ smart energy meters worldwide from Rushikonda IT SEZ',
        pitch: 'Clean energy transition & smart city enterprise software.',
        cta_label: 'Explore Solutions →',
        slot_type: 'FLASH_SPOTLIGHT_7D',
        cycle_window: 'Current 7-Day Cycle',
      };
    }

    return NextResponse.json({ activeShowcase });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

