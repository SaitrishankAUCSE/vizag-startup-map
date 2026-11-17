/**
 * Live Government Registry Lookup Module
 *
 * When GSTIN_API_KEY or MCA_API_KEY env vars are configured, this module
 * queries official third-party GSP (GST Suvidha Provider) APIs to:
 *   1. Fetch the government-registered legal_name and trade_name for a GSTIN
 *   2. Compare the submitted startup name against those official names
 *   3. Return whether they match (fuzzy word-overlap, threshold ≥ 0.65)
 *
 * When no API key is configured, the module gracefully returns `null` and the
 * submit route falls back to the existing algorithmic-only verification path.
 *
 * Supported lookup sources (in priority order):
 *   - gstinapi.in  → GET /v1/gstin/{gstin}  (header: x-api-key)
 *
 * To enable: add GSTIN_API_KEY=<your_key> to .env.local
 * Free dev keys: https://gstinapi.in/
 */

export interface GovRegistryResult {
  /** Full legal name as registered in government database */
  legal_name: string;
  /** Trade/brand name if different from legal name, or null */
  trade_name: string | null;
  /** GST registration status: 'Active' | 'Cancelled' | 'Suspended' | other */
  status: string;
  taxpayer_type?: string;
  state_code?: string;
  registered_address?: string;
  /** Which API source returned this data */
  api_source: 'gstinapi' | 'gstincheck' | 'mock';
}

export interface NameMatchResult {
  matched: boolean;
  confidence: number; // 0.0 – 1.0
  matchedOn: 'trade_name' | 'legal_name' | 'none';
  submittedNormalized: string;
  registryNormalized: string;
}

// Legal entity suffixes to strip before comparison
const LEGAL_SUFFIXES = [
  'private limited',
  'pvt limited',
  'pvt ltd',
  'private ltd',
  '(pvt) ltd',
  '(p) ltd',
  'limited liability partnership',
  'llp',
  'limited',
  'ltd',
  'one person company',
  'opc private limited',
  'opc pvt ltd',
  'opc',
  'innovations',
  'technologies',
  'technology',
  'solutions',
  'services',
  'systems',
  'ventures',
  'enterprises',
  'india',
  'bharat',
  'infotech',
  'infosystems',
  'informatics',
  'softtech',
  'software',
  'digital',
];

/**
 * Normalize a company name for fuzzy comparison:
 * - Lowercase
 * - Strip legal entity suffixes (pvt ltd, limited, llp, etc.)
 * - Strip punctuation (commas, dots, hyphens, brackets)
 * - Collapse whitespace
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  let n = name.toLowerCase().trim();
  // Strip punctuation: commas, dots, hyphens, brackets, ampersands
  n = n.replace(/[,.()&@#\-_\[\]{}'"/\\]/g, ' ');
  // Strip legal suffixes (try multiple times as they can nest: "pvt ltd" -> strip "ltd" -> strip "pvt")
  for (let pass = 0; pass < 3; pass++) {
    for (const suffix of LEGAL_SUFFIXES) {
      // Strip from the end of string
      const pattern = new RegExp(`\\b${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b\\s*$`, 'i');
      n = n.replace(pattern, '').trim();
      // Also strip from anywhere in the string (some names have them in the middle)
      const patternMid = new RegExp(`\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'gi');
      n = n.replace(patternMid, ' ').trim();
    }
  }
  // Collapse extra spaces
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

/**
 * Calculate word-overlap Jaccard similarity score between two normalized strings.
 * Returns a value from 0.0 (no match) to 1.0 (perfect match).
 */
function jaccardWordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = new Set(a.split(/\s+/).filter(Boolean));
  const setB = new Set(b.split(/\s+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((w) => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Check if one string is a contiguous substring of the other (after normalization).
 * "spotmies" is a substring of "spotmies labs" → true
 */
function isSubstringMatch(shorter: string, longer: string): boolean {
  if (!shorter || !longer) return false;
  return longer.includes(shorter) || shorter.includes(longer);
}

/**
 * Compare a user-submitted startup name against government-registered names.
 *
 * Strategy (in priority order):
 *   1. Exact match after normalization (confidence 1.0)
 *   2. Substring match after normalization (confidence 0.90)
 *   3. Jaccard word overlap ≥ 0.65 (confidence = Jaccard score)
 *   4. Single core word match when both normalized names have only 1 token (confidence 0.80)
 *
 * Trade name is checked first (usually shorter and more recognizable),
 * then legal name.
 */
export function isStartupNameMatchingGovRecord(
  submittedName: string,
  legalName: string,
  tradeName: string | null
): NameMatchResult {
  const THRESHOLD = 0.65;

  const submittedNorm = normalizeCompanyName(submittedName);
  const legalNorm = normalizeCompanyName(legalName);
  const tradeNorm = tradeName ? normalizeCompanyName(tradeName) : null;

  const tryMatch = (normA: string, normB: string): { matched: boolean; confidence: number } => {
    if (!normA || !normB) return { matched: false, confidence: 0 };

    // 1. Exact match
    if (normA === normB) return { matched: true, confidence: 1.0 };

    // 2. Substring match (one is contained in the other)
    if (isSubstringMatch(normA, normB)) return { matched: true, confidence: 0.9 };

    // 3. Jaccard word overlap
    const jaccard = jaccardWordSimilarity(normA, normB);
    if (jaccard >= THRESHOLD) return { matched: true, confidence: jaccard };

    // 4. Single-token heuristic: if both reduce to exactly 1 word after stripping, they must match exactly
    const wordsA = normA.split(/\s+/).filter(Boolean);
    const wordsB = normB.split(/\s+/).filter(Boolean);
    if (wordsA.length === 1 && wordsB.length === 1 && wordsA[0] === wordsB[0]) {
      return { matched: true, confidence: 0.8 };
    }

    return { matched: false, confidence: jaccard };
  };

  // Try trade name first
  if (tradeNorm) {
    const tradeResult = tryMatch(submittedNorm, tradeNorm);
    if (tradeResult.matched) {
      return {
        matched: true,
        confidence: tradeResult.confidence,
        matchedOn: 'trade_name',
        submittedNormalized: submittedNorm,
        registryNormalized: tradeNorm,
      };
    }
  }

  // Try legal name
  const legalResult = tryMatch(submittedNorm, legalNorm);
  return {
    matched: legalResult.matched,
    confidence: legalResult.confidence,
    matchedOn: legalResult.matched ? 'legal_name' : 'none',
    submittedNormalized: submittedNorm,
    registryNormalized: legalNorm,
  };
}

/**
 * Fetch GSTIN details from gstinapi.in (requires GSTIN_API_KEY in env).
 *
 * Returns null if:
 *   - API key not configured (graceful degradation)
 *   - Network error / timeout (graceful degradation)
 *   - API quota exhausted (graceful degradation)
 *   - GSTIN not found in registry (returns null — format-valid but not found)
 */
export async function lookupGSTINFromRegistry(gstin: string): Promise<GovRegistryResult | null> {
  const apiKey = process.env.GSTIN_API_KEY;
  if (!apiKey) {
    // No API key configured — caller should fall back to algorithmic-only
    return null;
  }

  const normalizedGstin = gstin.trim().toUpperCase();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    let response: Response;
    try {
      response = await fetch(`https://gstinapi.in/v1/gstin/${normalizedGstin}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          Accept: 'application/json',
          'User-Agent': 'VizagStartupMap/1.0',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // 404 → GSTIN not found in registry (format valid but not registered / cancelled)
      // 401/403 → invalid API key
      // 429 → quota exhausted
      // All are graceful degradation → return null
      console.warn(`[govRegistry] GSTIN API returned HTTP ${response.status} for ${normalizedGstin}`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();

    // gstinapi.in response shape: { data: { legal_name, trade_name, status, taxpayer_type, ... } }
    const data = json?.data || json;

    if (!data?.legal_name) {
      console.warn('[govRegistry] GSTIN API response missing legal_name', json);
      return null;
    }

    return {
      legal_name: (data.legal_name as string).trim(),
      trade_name: data.trade_name ? (data.trade_name as string).trim() : null,
      status: (data.status || data.gstin_status || 'Unknown') as string,
      taxpayer_type: data.taxpayer_type,
      state_code: data.state_code || normalizedGstin.substring(0, 2),
      registered_address: data.principal_address || data.address,
      api_source: 'gstinapi',
    };
  } catch (err: unknown) {
    // Network failure, timeout, DNS error — graceful degradation
    if ((err as Error)?.name === 'AbortError') {
      console.warn('[govRegistry] GSTIN API request timed out');
    } else {
      console.warn('[govRegistry] GSTIN API fetch error:', (err as Error)?.message);
    }
    return null;
  }
}
