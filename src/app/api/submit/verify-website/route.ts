import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return NextResponse.json({ ok: false, error: 'URL is required' }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ ok: false, error: 'Malformed website URL format' }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost, private IPs, or raw test domains
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.test') ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json(
        { ok: false, error: 'Local or private networks are not allowed. Provide a public domain.' },
        { status: 400 }
      );
    }

    // Require valid domain format (at least one dot and valid TLD)
    if (!hostname.includes('.') || hostname.split('.').pop()!.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid live domain (e.g. yourstartup.com)' },
        { status: 400 }
      );
    }

    // Attempt live HTTP check (HEAD first, GET fallback)
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let status = 0;
    try {
      const headRes = await fetch(rawUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VizagStartupVerifier/1.0',
        },
      });
      status = headRes.status;
    } catch {
      // Fallback to GET if HEAD failed or was rejected by CDN
      try {
        const getRes = await fetch(rawUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VizagStartupVerifier/1.0',
          },
        });
        status = getRes.status;
      } catch (err: unknown) {
        clearTimeout(timeout);
        return NextResponse.json({
          ok: false,
          error: 'Website is unreachable or domain DNS could not be resolved.',
          domain: hostname,
        });
      }
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Date.now() - start;

    // A valid response is 2xx, 3xx, or 403 (Cloudflare challenge)
    const isReachable = (status >= 200 && status < 400) || status === 403;

    if (!isReachable) {
      return NextResponse.json({
        ok: false,
        status,
        latency_ms: latencyMs,
        domain: hostname,
        error: `Website returned error status HTTP ${status}`,
      });
    }

    return NextResponse.json({
      ok: true,
      status,
      latency_ms: latencyMs,
      domain: hostname,
      message: `Website verified and reachable (${status} OK)`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify website';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

