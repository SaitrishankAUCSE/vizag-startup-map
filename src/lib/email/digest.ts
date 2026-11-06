import fs from 'fs';
import path from 'path';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { sendEmailAlert } from '@/lib/email/resend';

export interface QueuedStartup {
  id: string;
  name: string;
  slug: string;
  sector?: string | null;
  area?: string | null;
  one_liner?: string | null;
  description?: string | null;
  website?: string | null;
  queued_at: string;
}

export interface QueuedJob {
  id: string;
  title: string;
  company_name: string;
  company_slug?: string;
  department?: string | null;
  location?: string | null;
  salary_range?: string | null;
  apply_url: string;
  queued_at: string;
}

export interface DigestSubscriber {
  id: string;
  email: string;
  position?: string;
  company?: string;
  plan?: 'free' | 'pro';
  created_at: string;
  trial_ends_at?: string;
}

const STARTUPS_QUEUE_FILE = path.join(process.cwd(), 'src', 'data', 'pending_digest.json');
const JOBS_QUEUE_FILE = path.join(process.cwd(), 'src', 'data', 'pending_jobs.json');
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'subscribers.json');

// Free trial duration: 3 days (strictly reduced per user requirements)
export const FREE_TRIAL_DAYS = 3;

/**
 * Loads pending startups queue.
 */
export function getPendingDigestQueue(): QueuedStartup[] {
  try {
    if (fs.existsSync(STARTUPS_QUEUE_FILE)) {
      const raw = fs.readFileSync(STARTUPS_QUEUE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Digest Queue] Error reading local startup queue file:', err);
  }
  return [];
}

/**
 * Saves pending startups queue.
 */
function savePendingDigestQueue(queue: QueuedStartup[]) {
  try {
    const dir = path.dirname(STARTUPS_QUEUE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STARTUPS_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Digest Queue] Error writing startup queue file:', err);
  }
}

/**
 * Loads pending jobs queue.
 */
export function getPendingJobsQueue(): QueuedJob[] {
  try {
    if (fs.existsSync(JOBS_QUEUE_FILE)) {
      const raw = fs.readFileSync(JOBS_QUEUE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Digest Queue] Error reading local jobs queue file:', err);
  }
  return [];
}

/**
 * Saves pending jobs queue.
 */
function savePendingJobsQueue(queue: QueuedJob[]) {
  try {
    const dir = path.dirname(JOBS_QUEUE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(JOBS_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Digest Queue] Error writing jobs queue file:', err);
  }
}

/**
 * Adds a newly approved startup to the morning digest queue.
 */
export async function queueStartupForMorningDigest(startup: {
  name: string;
  slug: string;
  sector?: string | null;
  area?: string | null;
  one_liner?: string | null;
  description?: string | null;
  website?: string | null;
}): Promise<void> {
  const item: QueuedStartup = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: startup.name,
    slug: startup.slug,
    sector: startup.sector || 'Technology',
    area: startup.area || 'Visakhapatnam',
    one_liner: startup.one_liner || startup.description || 'Newly verified venture on Vizag Startup Map.',
    description: startup.description || null,
    website: startup.website || null,
    queued_at: new Date().toISOString(),
  };

  const queue = getPendingDigestQueue();
  const filtered = queue.filter((q) => q.slug !== startup.slug);
  filtered.push(item);
  savePendingDigestQueue(filtered);

  try {
    const db = getAdminFirestore();
    if (db) {
      await db.collection('pending_startup_digest').doc(item.slug).set(item);
    }
  } catch (err) {
    console.warn('[Digest Queue] Firestore set error:', err);
  }

  console.log(`[Digest Queue] Queued "${startup.name}" for the morning digest.`);
}

/**
 * Adds a newly posted or synced tech job to the morning digest queue.
 */
export async function queueJobForMorningDigest(job: {
  id?: string;
  title: string;
  company_name: string;
  company_slug?: string;
  department?: string | null;
  location?: string | null;
  salary_range?: string | null;
  apply_url: string;
}): Promise<void> {
  const item: QueuedJob = {
    id: job.id || `job_queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: job.title,
    company_name: job.company_name,
    company_slug: job.company_slug,
    department: job.department || null,
    location: job.location || 'Visakhapatnam',
    salary_range: job.salary_range || null,
    apply_url: job.apply_url,
    queued_at: new Date().toISOString(),
  };

  const queue = getPendingJobsQueue();
  const filtered = queue.filter((j) => j.id !== item.id && !(j.title === item.title && j.company_name === item.company_name));
  filtered.push(item);
  savePendingJobsQueue(filtered);

  try {
    const db = getAdminFirestore();
    if (db) {
      await db.collection('pending_job_digest').doc(item.id).set(item);
    }
  } catch (err) {
    console.warn('[Digest Queue] Firestore job set error:', err);
  }

  console.log(`[Digest Queue] Queued job "${job.title}" at "${job.company_name}" for morning digest.`);
}

/**
 * Retrieves all subscribers, checking their 3-Day Free Trial vs Pro status.
 */
export async function getActiveSubscribers(): Promise<DigestSubscriber[]> {
  const subscriberMap = new Map<string, DigestSubscriber>();

  // 1. Fetch from Firestore
  try {
    const db = getAdminFirestore();
    if (db) {
      const snap = await db.collection('alert_subscribers').get();
      snap.forEach((doc) => {
        const d = doc.data() as any;
        if (d.email && typeof d.email === 'string') {
          const email = d.email.trim().toLowerCase();
          subscriberMap.set(email, {
            id: doc.id,
            email,
            position: d.position || '',
            company: d.company || '',
            plan: d.plan || 'free',
            created_at: d.created_at || new Date().toISOString(),
            trial_ends_at: d.trial_ends_at,
          });
        }
      });
    }
  } catch (err) {
    console.warn('[getActiveSubscribers] Firestore fallback:', err);
  }

  // 2. Fetch from local JSON file
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        list.forEach((item: any) => {
          if (item.email && typeof item.email === 'string') {
            const email = item.email.trim().toLowerCase();
            if (!subscriberMap.has(email)) {
              subscriberMap.set(email, {
                id: item.id || `sub_${email}`,
                email,
                position: item.position || '',
                company: item.company || '',
                plan: item.plan || 'free',
                created_at: item.created_at || new Date().toISOString(),
                trial_ends_at: item.trial_ends_at,
              });
            }
          }
        });
      }
    }
  } catch {}

  return Array.from(subscriberMap.values());
}

/**
 * Dispatches the Daily Morning Digest.
 * 
 * Rules:
 * 1. If NO startups AND NO jobs added in the last 24h -> DOES NOT send any email.
 * 2. Bundles both newly verified startups AND open roles into TWO distinct sections in ONE single email.
 * 3. Free subscribers receive it for exactly 3 DAYS (3-day free trial). After that, paywall gates them.
 * 4. Pro users receive it permanently as long as their subscription is active.
 */
export async function dispatchMorningDigest(): Promise<{
  success: boolean;
  message: string;
  startupsCount: number;
  jobsCount: number;
  recipientsCount: number;
  skippedExpiredCount: number;
}> {
  // 1. Fetch pending startups
  let pendingStartups: QueuedStartup[] = [];
  try {
    const db = getAdminFirestore();
    if (db) {
      const snap = await db.collection('pending_startup_digest').get();
      snap.forEach((doc) => pendingStartups.push(doc.data() as QueuedStartup));
    }
  } catch {}
  if (pendingStartups.length === 0) {
    pendingStartups = getPendingDigestQueue();
  }

  // 2. Fetch pending jobs
  let pendingJobs: QueuedJob[] = [];
  try {
    const db = getAdminFirestore();
    if (db) {
      const snap = await db.collection('pending_job_digest').get();
      snap.forEach((doc) => pendingJobs.push(doc.data() as QueuedJob));
    }
  } catch {}
  if (pendingJobs.length === 0) {
    pendingJobs = getPendingJobsQueue();
  }

  // 3. ZERO NOISE RULE: If neither startups nor jobs were added/updated -> DO NOT SEND MAIL!
  if (pendingStartups.length === 0 && pendingJobs.length === 0) {
    console.log('[Morning Digest] No startups or jobs added in the past 24 hours. Skipped sending.');
    return {
      success: true,
      message: 'No new updates (0 startups, 0 jobs) in queue. No emails sent today.',
      startupsCount: 0,
      jobsCount: 0,
      recipientsCount: 0,
      skippedExpiredCount: 0,
    };
  }

  // 4. Load all subscribers and filter by 3-Day Free Trial vs Pro status
  const allSubscribers = await getActiveSubscribers();
  const now = Date.now();
  const trialDurationMs = FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;

  const eligibleRecipients: DigestSubscriber[] = [];
  let skippedExpired = 0;

  for (const sub of allSubscribers) {
    if (sub.plan === 'pro') {
      // Pro subscribers always receive morning updates throughout their active plan
      eligibleRecipients.push(sub);
      continue;
    }

    // Free subscriber trial check: 3 days from created_at
    const createdAtMs = new Date(sub.created_at).getTime() || now;
    const trialEndsMs = sub.trial_ends_at
      ? new Date(sub.trial_ends_at).getTime()
      : createdAtMs + trialDurationMs;

    if (now <= trialEndsMs) {
      eligibleRecipients.push(sub);
    } else {
      skippedExpired++;
    }
  }

  if (eligibleRecipients.length === 0) {
    return {
      success: true,
      message: 'No active eligible subscribers (free trials passed 3-day window; subscribers must upgrade to Pro).',
      startupsCount: pendingStartups.length,
      jobsCount: pendingJobs.length,
      recipientsCount: 0,
      skippedExpiredCount: skippedExpired,
    };
  }

  // 5. Construct Single Editorial Email with Two Clear Sections
  const startupCount = pendingStartups.length;
  const jobCount = pendingJobs.length;

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const subject = `🌅 Today's Vizag Tech Digest: ${
    startupCount > 0 ? `${startupCount} New ${startupCount === 1 ? 'Startup' : 'Startups'}` : ''
  }${startupCount > 0 && jobCount > 0 ? ' · ' : ''}${
    jobCount > 0 ? `${jobCount} New Open ${jobCount === 1 ? 'Role' : 'Roles'}` : ''
  } (${todayDateStr})`;

  // Startups Section HTML
  const startupsHtml =
    startupCount > 0
      ? `
        <div style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <span style="background: #3A0F34; color: #EAAA00; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 9999px;">
              🚀 Newly Mapped Ventures (${startupCount})
            </span>
          </div>
          ${pendingStartups
            .map(
              (s, idx) => `
            <div style="background: #FFFFFF; border: 1px solid rgba(58, 15, 52, 0.12); border-radius: 12px; padding: 16px 20px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #3A0F34;">${idx + 1}. ${s.name}</h3>
                <span style="background: rgba(58, 15, 52, 0.08); color: #3A0F34; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px;">
                  ${s.sector || 'Tech'} · ${s.area || 'Vizag'}
                </span>
              </div>
              <p style="font-size: 13px; line-height: 1.5; color: rgba(58, 15, 52, 0.8); margin: 0 0 12px 0;">
                ${s.one_liner || s.description || 'Newly verified venture in Visakhapatnam.'}
              </p>
              <div>
                <a href="https://vizagstartupmap.com/?startup=${s.slug}" style="background: #EAAA00; color: #3A0F34; text-decoration: none; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                  View on Live Map →
                </a>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      : '';

  // Jobs Section HTML
  const jobsHtml =
    jobCount > 0
      ? `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <span style="background: #059669; color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 9999px;">
              💼 New Tech Openings & Roles (${jobCount})
            </span>
          </div>
          ${pendingJobs
            .map(
              (j, idx) => `
            <div style="background: #FFFFFF; border: 1px solid rgba(5, 150, 105, 0.2); border-radius: 12px; padding: 16px 20px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #3A0F34;">${idx + 1}. ${j.title}</h4>
                ${
                  j.salary_range
                    ? `<span style="font-size: 11px; font-weight: 700; color: #047857;">${j.salary_range}</span>`
                    : ''
                }
              </div>
              <div style="font-size: 12px; font-weight: 600; color: rgba(58, 15, 52, 0.65); margin-bottom: 10px;">
                ${j.company_name} · ${j.location || 'Visakhapatnam'}
              </div>
              <div>
                <a href="${j.apply_url}" style="background: #3A0F34; color: #DDE3E8; text-decoration: none; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                  Apply Directly →
                </a>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #DDE3E8; margin: 0; padding: 24px; color: #3A0F34; }
          .container { max-width: 580px; margin: 0 auto; background: #FAF9F6; border-radius: 16px; border: 1px solid rgba(58, 15, 52, 0.15); overflow: hidden; box-shadow: 0 4px 24px rgba(58, 15, 52, 0.08); }
          .header { background: #3A0F34; padding: 28px 24px; text-align: center; }
          .pill { display: inline-block; background: #EAAA00; color: #3A0F34; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px; }
          .title { color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
          .subtitle { color: rgba(221, 227, 232, 0.85); font-size: 12px; margin: 0; }
          .content { padding: 28px 24px; }
          .pro-banner { background: #3A0F34; color: #DDE3E8; border-radius: 12px; padding: 18px 20px; text-align: center; margin-top: 24px; border: 1px solid #EAAA00; }
          .footer { padding: 18px 24px; background: #ECEEF1; border-top: 1px solid rgba(58, 15, 52, 0.08); text-align: center; font-size: 11px; color: rgba(58, 15, 52, 0.6); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="pill">🌅 Daily Morning Intelligence</span>
            <h1 class="title">Vizag Tech Morning Briefing</h1>
            <p class="subtitle">${todayDateStr} · Startups & Hiring Digest</p>
          </div>
          <div class="content">
            <p style="font-size: 13.5px; line-height: 1.6; color: #3A0F34; margin: 0 0 24px 0;">
              Good morning! Here is your consolidated morning briefing covering all verified startups mapped and tech openings posted across Visakhapatnam in the last 24 hours.
            </p>

            ${startupsHtml}
            ${jobsHtml}

            <div class="pro-banner">
              <div style="font-size: 10px; font-weight: 800; color: #EAAA00; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 4px;">
                ⭐ Pro Member Intelligence
              </div>
              <p style="font-size: 12px; margin: 0 0 12px 0; color: #DDE3E8; line-height: 1.5;">
                Pro members get continuous daily job updates throughout their subscription, direct verified Founder LinkedIn/WhatsApp dossier access, and full 1-click CSV ecosystem exports.
              </p>
              <a href="https://vizagstartupmap.com/pricing" style="background: #EAAA00; color: #3A0F34; text-decoration: none; font-size: 11px; font-weight: 800; padding: 8px 18px; border-radius: 9999px; display: inline-block;">
                Get Pro Access (₹499/mo) →
              </a>
            </div>
          </div>
          <div class="footer">
            You are receiving this single morning digest because you subscribed on <a href="https://vizagstartupmap.com" style="color: #3A0F34; font-weight: 700;">Vizag Startup Map</a>.<br />
            Free subscriber trial active for 3 days. Upgrade to Pro for uninterrupted daily updates.
          </div>
        </div>
      </body>
    </html>
  `;

  // 6. Deliver 1 email per eligible subscriber
  for (const subscriber of eligibleRecipients) {
    await sendEmailAlert({
      to: subscriber.email,
      subject,
      htmlContent: emailHtml,
    });
  }

  // 7. Clear both queues
  savePendingDigestQueue([]);
  savePendingJobsQueue([]);

  try {
    const db = getAdminFirestore();
    if (db) {
      const snapStartups = await db.collection('pending_startup_digest').get();
      const snapJobs = await db.collection('pending_job_digest').get();
      const batch = db.batch();
      snapStartups.docs.forEach((doc) => batch.delete(doc.ref));
      snapJobs.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  } catch {}

  console.log(
    `[Morning Digest Dispatched] Sent 1 email with ${startupCount} startup(s) and ${jobCount} job(s) to ${eligibleRecipients.length} subscriber(s). Skipped ${skippedExpired} expired trial(s).`
  );

  return {
    success: true,
    message: `Dispatched 1 morning digest with ${startupCount} startup(s) and ${jobCount} job(s) to ${eligibleRecipients.length} subscriber(s).`,
    startupsCount: startupCount,
    jobsCount: jobCount,
    recipientsCount: eligibleRecipients.length,
    skippedExpiredCount: skippedExpired,
  };
}
