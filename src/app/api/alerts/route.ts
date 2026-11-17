import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/service';
import { sendEmailAlert } from '@/lib/email/resend';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const alertSubscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  position: z.string().optional().default(''),
  company: z.string().optional().default(''),
  sector: z.string().optional().default('all'),
  area: z.string().optional().default('all'),
});

// File-based persistence fallback when Firestore is not yet connected
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'subscribers.json');

interface SubscriberRecord {
  id: string;
  email: string;
  position: string;
  company: string;
  sector: string;
  area: string;
  created_at: string;
}

function loadLocalSubscribers(): SubscriberRecord[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Ignore error
  }
  return [];
}

function saveLocalSubscriber(record: SubscriberRecord) {
  try {
    const list = loadLocalSubscribers();
    const existingIndex = list.findIndex(
      (s) => s.email.toLowerCase() === record.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.push(record);
    }
    const dir = path.dirname(SUBSCRIBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Subscribers Storage] Could not write to local file:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = alertSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, position, company, sector, area } = parsed.data;

    const record: SubscriberRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      position: position || '',
      company: company || '',
      sector: sector || 'all',
      area: area || 'all',
      created_at: new Date().toISOString(),
    };

    // 1. Save to local fallback so it is 100% reliable
    saveLocalSubscriber(record);

    // 2. Save to Firestore if connected
    try {
      const db = getAdminFirestore();
      if (db) {
        await db.collection('alert_subscribers').add(record);
      }
    } catch {
      // Firestore is optional; local fallback is already saved
    }

    // 3. Send welcome email
    const emailSubject = `Welcome to Vizag Startup Map – New Company Alerts`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>${emailSubject}</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DDE3E8; margin: 0; padding: 24px; color: #3A0F34;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(58,15,52,0.15); padding: 28px; box-shadow: 0 4px 20px rgba(58,15,52,0.08);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span style="font-size: 20px;">📍</span>
              <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #3A0F34;">Vizag Startup Map · New Company Alerts</h2>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #3A0F34; margin-bottom: 20px;">
              Hello${position ? ` (${position}${company ? ` at ${company}` : ''})` : ''},
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #3A0F34; margin-bottom: 20px;">
              You are now subscribed to <strong>New Company Alerts</strong>. You will receive an instant email alert whenever a newly verified company or startup is added to the Visakhapatnam map.
            </p>
            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="https://vizagstartupmap.com" style="background: #3A0F34; color: #DDE3E8; padding: 10px 22px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-block;">
                Explore the Interactive Map →
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(58,15,52,0.1); margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: rgba(58,15,52,0.6); text-align: center; margin: 0;">
              100% Free · Direct email alerts when new companies are mapped · Zero spam
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmailAlert({
      to: email,
      subject: emailSubject,
      htmlContent: emailHtml,
    });

    return NextResponse.json({
      success: true,
      subscriber: record,
      message: 'Subscribed to New Company Alerts',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const subscribers = loadLocalSubscribers();
  return NextResponse.json({
    totalSubscribers: subscribers.length,
    recentCount: subscribers.length,
  });
}
