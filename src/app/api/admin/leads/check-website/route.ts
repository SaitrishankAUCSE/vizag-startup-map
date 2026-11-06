import { NextRequest, NextResponse } from 'next/server';

/**
 * Check website reachability for lead verification:
 * - 8 second timeout
 * - Respects robots.txt
 * - Identifies as polite user-agent
 * - Returns status, latency_ms, ok, and robots_txt status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let url = body.url?.trim();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const parsedUrl = new URL(url);
    const domain = parsedUrl.origin;

    // 1. Check robots.txt (polite check)
    let robotsAllowed = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const robotsRes = await fetch(`${domain}/robots.txt`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'VizagStartupMapBot/1.0 (+https://vizagstartupmap.com)' },
      });
      clearTimeout(timeoutId);

      if (robotsRes.ok) {
        const robotsText = await robotsRes.text();
        const disallows = robotsText
          .split('\n')
          .filter((line) => line.toLowerCase().startsWith('disallow:'))
          .map((line) => line.split(':')[1]?.trim());

        if (disallows.includes('/') || disallows.some((p) => p && parsedUrl.pathname.startsWith(p))) {
          robotsAllowed = false;
        }
      }
    } catch {
      // If robots.txt fails or times out, proceed to site check
    }

    // 2. Fetch website with 8-second timeout
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VizagStartupMapBot/1.0; +https://vizagstartupmap.com)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const isOk = response.status >= 200 && response.status < 400;

      return NextResponse.json({
        ok: isOk,
        status: response.status,
        statusText: response.statusText,
        finalUrl: response.url,
        latencyMs,
        robotsAllowed,
        message: isOk
          ? `Website responded with HTTP ${response.status} in ${latencyMs}ms.`
          : `Website returned status code ${response.status}.`,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === 'AbortError';
      return NextResponse.json({
        ok: false,
        status: isTimeout ? 408 : 0,
        statusText: isTimeout ? 'Request Timeout (8s)' : 'Network Error',
        latencyMs: Date.now() - startTime,
        robotsAllowed,
        message: isTimeout
          ? 'Website took longer than 8 seconds to respond.'
          : `Failed to reach website: ${fetchErr.message}`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid URL' }, { status: 400 });
  }
}
