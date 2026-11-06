import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { CACHE_DIR, USER_AGENT, TIMEOUT_MS, HOST_DELAY_MS } from './config.js';

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Track last request timestamp per host to enforce HOST_DELAY_MS
const lastRequestTimeByHost = new Map();

// In-memory cache for robots.txt rules per host
const robotsRulesByHost = new Map();

function getHost(urlStr) {
  try {
    return new URL(urlStr).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getCachePath(urlStr) {
  const hash = crypto.createHash('sha256').update(urlStr).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

/**
 * Polite sleep to respect per-host rate limits
 */
async function enforceHostRateLimit(host) {
  if (!host) return;
  const now = Date.now();
  const lastTime = lastRequestTimeByHost.get(host) || 0;
  const elapsed = now - lastTime;
  if (elapsed < HOST_DELAY_MS) {
    const waitTime = HOST_DELAY_MS - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTimeByHost.set(host, Date.now());
}

/**
 * Check robots.txt for a host
 */
async function isAllowedByRobots(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (!robotsRulesByHost.has(host)) {
      const robotsUrl = `${parsed.protocol}//${host}/robots.txt`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(robotsUrl, {
          headers: { 'User-Agent': USER_AGENT },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const text = await res.text();
          const disallowLines = [];
          let appliesToBot = false;

          for (const rawLine of text.split('\n')) {
            const line = rawLine.split('#')[0].trim();
            if (!line) continue;
            const lower = line.toLowerCase();
            if (lower.startsWith('user-agent:')) {
              const agent = lower.replace('user-agent:', '').trim();
              appliesToBot = agent === '*' || agent.includes('vizagstartupmapbot');
            } else if (appliesToBot && lower.startsWith('disallow:')) {
              const rule = line.substring(line.indexOf(':') + 1).trim();
              if (rule) disallowLines.push(rule);
            }
          }
          robotsRulesByHost.set(host, disallowLines);
        } else {
          robotsRulesByHost.set(host, []);
        }
      } catch {
        robotsRulesByHost.set(host, []);
      }
    }

    const rules = robotsRulesByHost.get(host) || [];
    for (const rule of rules) {
      if (rule === '/' || pathname.startsWith(rule)) {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Polite fetch with disk caching, robots.txt check, and timeout
 */
export async function politeFetch(urlStr, options = {}) {
  const { skipCache = false, forceRefresh = false } = options;
  const host = getHost(urlStr);
  const cachePath = getCachePath(urlStr);

  // Check cache first
  if (!skipCache && !forceRefresh && fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      return cached;
    } catch {
      // cache corrupted, re-fetch
    }
  }

  // Check robots.txt
  const allowed = await isAllowedByRobots(urlStr);
  if (!allowed) {
    const resObj = {
      url: urlStr,
      status: 403,
      ok: false,
      text: '',
      error: 'blocked_by_robots_txt',
      headers: {},
      isHttps: urlStr.startsWith('https://'),
      finalUrl: urlStr,
    };
    fs.writeFileSync(cachePath, JSON.stringify(resObj, null, 2));
    return resObj;
  }

  // Rate limit
  await enforceHostRateLimit(host);

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(urlStr, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    const finalUrl = res.url || urlStr;
    const isHttps = finalUrl.startsWith('https://');

    const result = {
      url: urlStr,
      finalUrl,
      status: res.status,
      ok: res.ok,
      isHttps,
      text,
      contentType: res.headers.get('content-type') || '',
      error: res.ok ? null : `HTTP_${res.status}`,
    };

    if (!skipCache) {
      fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
    }
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    const result = {
      url: urlStr,
      finalUrl: urlStr,
      status: 0,
      ok: false,
      isHttps: urlStr.startsWith('https://'),
      text: '',
      error: err.name === 'AbortError' ? 'timeout_after_8s' : err.message,
    };
    if (!skipCache) {
      fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
    }
    return result;
  }
}

