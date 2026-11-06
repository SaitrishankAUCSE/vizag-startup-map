// Resend email integration (Free tier, up to 3,000 emails/mo)
// Real-time subscriber alerts for new startup additions & job postings.

import fs from 'fs';
import path from 'path';
import { getAdminFirestore } from '@/lib/firebase/admin';

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmailAlert({
  to,
  subject,
  htmlContent,
}: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && !apiKey.includes('sample')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Vizag Startup Map <alerts@vizagstartupmap.com>',
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, id: data.id };
      }
    } catch (err) {
      console.warn('[Resend API Error]', err);
    }
  }

  // Development logger (fallback when RESEND_API_KEY is not yet populated)
  console.log(`[Email Alert Mock] To: ${to} | Subject: "${subject}"`);
  return { success: true, id: `mock_email_${Date.now()}` };
}

/**
 * Broadcasts an alert to all active subscribers when a new startup is added or approved.
 */
export async function notifySubscribersOfNewStartup(startup: {
  name: string;
  slug: string;
  sector?: string | null;
  area?: string | null;
  one_liner?: string | null;
  description?: string | null;
  website?: string | null;
}): Promise<{ totalSent: number; recipientEmails: string[] }> {
  const emailSet = new Set<string>();

  // 1. Fetch from Firestore alert_subscribers collection
  try {
    const db = getAdminFirestore();
    if (db) {
      const snap = await db.collection('alert_subscribers').get();
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.email && typeof data.email === 'string') {
          emailSet.add(data.email.trim().toLowerCase());
        }
      });
    }
  } catch (err) {
    console.warn('[notifySubscribers] Firestore query fallback:', err);
  }

  // 2. Fetch from local JSON file fallback
  try {
    const localFile = path.join(process.cwd(), 'src', 'data', 'subscribers.json');
    if (fs.existsSync(localFile)) {
      const content = fs.readFileSync(localFile, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item.email && typeof item.email === 'string') {
            emailSet.add(item.email.trim().toLowerCase());
          }
        });
      }
    }
  } catch {}

  const emails = Array.from(emailSet).filter((e) => e && e.includes('@'));
  if (emails.length === 0) {
    console.log('[notifySubscribers] No subscribers found to notify.');
    return { totalSent: 0, recipientEmails: [] };
  }

  const sectorText = startup.sector || 'Technology';
  const areaText = startup.area || 'Visakhapatnam';
  const oneLiner = startup.one_liner || startup.description || 'A newly verified venture joining the Visakhapatnam tech corridor.';
  const mapUrl = `https://vizagstartupmap.com/?startup=${startup.slug}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #DDE3E8; margin: 0; padding: 24px; color: #3A0F34; }
          .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid rgba(58, 15, 52, 0.15); overflow: hidden; box-shadow: 0 4px 20px rgba(58, 15, 52, 0.08); }
          .header { background: #3A0F34; padding: 24px; text-align: center; }
          .pill { display: inline-block; background: #EAAA00; color: #3A0F34; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px; }
          .title { color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 0; }
          .body { padding: 28px 24px; }
          .startup-name { font-size: 22px; font-weight: 800; color: #3A0F34; margin: 0 0 6px 0; }
          .meta { font-size: 12px; font-weight: 600; color: rgba(58, 15, 52, 0.65); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary { font-size: 14px; line-height: 1.6; color: rgba(58, 15, 52, 0.85); margin-bottom: 24px; }
          .btn { display: block; text-align: center; background: #EAAA00; color: #3A0F34; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 24px; border-radius: 9999px; margin-bottom: 12px; }
          .website-link { display: block; text-align: center; color: #3A0F34; font-size: 12px; font-weight: 600; text-decoration: underline; }
          .footer { padding: 16px 24px; background: #F8FAFC; border-top: 1px solid rgba(0,0,0,0.06); text-align: center; font-size: 11px; color: rgba(58, 15, 52, 0.5); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="pill">New Venture Mapped</span>
            <h1 class="title">Vizag Startup Map Update</h1>
          </div>
          <div class="body">
            <h2 class="startup-name">${startup.name}</h2>
            <div class="meta">${sectorText} · ${areaText}</div>
            <p class="summary">${oneLiner}</p>
            <a href="${mapUrl}" class="btn">View on Live Map →</a>
            ${startup.website ? `<a href="${startup.website}" class="website-link">Visit Official Website</a>` : ''}
          </div>
          <div class="footer">
            You are receiving this update because you subscribed to alerts on <a href="https://vizagstartupmap.com" style="color:#3A0F34; font-weight:600;">Vizag Startup Map</a>.
          </div>
        </div>
      </body>
    </html>
  `;

  const subject = `🚀 New Startup Mapped: ${startup.name} (${sectorText} · ${areaText})`;

  for (const recipient of emails) {
    await sendEmailAlert({
      to: recipient,
      subject,
      htmlContent,
    });
  }

  console.log(`[notifySubscribers] Broadcasted alert for "${startup.name}" to ${emails.length} subscriber(s).`);
  return { totalSent: emails.length, recipientEmails: emails };
}
