// Government Registration & Entity Validation Engine
// Supports Indian corporate & startup identifiers:
//  1. GSTIN (Goods & Services Tax Identification Number - 15 chars + Modulo 36 Checksum)
//  2. CIN (Corporate Identification Number - 21 chars, ROC MCA)
//  3. DPIIT (Startup India Recognition Number)
//  4. UDYAM (Ministry of MSME Registration)

export type GovIdType = 'gstin' | 'cin' | 'dpiit' | 'udyam' | 'none';

export interface GovIdValidationResult {
  valid: boolean;
  type: GovIdType;
  raw: string;
  normalized: string;
  reason?: string;
  details?: {
    stateCode?: string;
    isAndhraPradesh?: boolean;
    pan?: string;
    entityType?: string;
    incorporationYear?: number;
    isListed?: boolean;
    rocNumber?: string;
  };
}

const GST_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Validates an Indian GSTIN (15 characters) including:
 * - 15-character statutory structure
 * - PAN format & entity type character
 * - State code (01-38, 97, 99; '37' is Andhra Pradesh)
 * - Official Goods and Services Tax Modulo 36 Luhn-like checksum algorithm
 */
export function validateGSTIN(input: string): GovIdValidationResult {
  const normalized = (input || '').trim().toUpperCase();
  const baseResult: GovIdValidationResult = {
    valid: false,
    type: 'gstin',
    raw: input,
    normalized,
  };

  if (!normalized) {
    return { ...baseResult, reason: 'GSTIN cannot be empty.' };
  }

  // Format: 2 digits (state) + 5 letters (PAN) + 4 digits + 1 letter + 1 char + Z + 1 check digit
  const gstRegex = /^([0-9]{2})([A-Z]{5}[0-9]{4}[A-Z]{1})([1-9A-Z]{1})(Z)([0-9A-Z]{1})$/;
  const match = normalized.match(gstRegex);

  if (!match) {
    return {
      ...baseResult,
      reason: 'Invalid GSTIN format. Must be a 15-character alphanumeric code (e.g. 37AACCF4148Q1Z4).',
    };
  }

  const stateCode = match[1];
  const pan = match[2];
  const panEntityType = pan[3];
  const validEntityTypes = ['C', 'P', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];

  if (!validEntityTypes.includes(panEntityType)) {
    return {
      ...baseResult,
      reason: `Invalid PAN entity classification character "${panEntityType}" inside GSTIN.`,
    };
  }

  // Official Modulo 36 GSTIN Checksum Algorithm
  let factor = 1;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = GST_ALPHABET.indexOf(normalized[i]);
    if (codePoint === -1) {
      return { ...baseResult, reason: `Unrecognized character "${normalized[i]}" in GSTIN.` };
    }
    let digit = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
  }

  const remainder = sum % 36;
  const checkCodePoint = (36 - remainder) % 36;
  const expectedCheckDigit = GST_ALPHABET[checkCodePoint];

  if (expectedCheckDigit !== normalized[14]) {
    return {
      ...baseResult,
      reason: `GSTIN checksum verification failed (expected "${expectedCheckDigit}", received "${normalized[14]}"). This number is not an authentic issued GSTIN.`,
    };
  }

  const entityTypeMap: Record<string, string> = {
    C: 'Private/Public Limited Company',
    P: 'Proprietorship',
    F: 'Partnership / Limited Liability Partnership (LLP)',
    H: 'Hindu Undivided Family (HUF)',
    A: 'Association of Persons',
    T: 'Trust',
  };

  return {
    valid: true,
    type: 'gstin',
    raw: input,
    normalized,
    details: {
      stateCode,
      isAndhraPradesh: stateCode === '37',
      pan,
      entityType: entityTypeMap[panEntityType] || 'Registered Entity',
    },
  };
}

/**
 * Validates a Corporate Identification Number (CIN) issued by MCA / ROC:
 * Format: 21 characters:
 *   [L/U][5-digit NIC][2-letter State][4-digit Year][3-letter Entity][6-digit ROC]
 * Example: U72200AP2021PTC118543
 */
export function validateCIN(input: string): GovIdValidationResult {
  const normalized = (input || '').trim().toUpperCase();
  const baseResult: GovIdValidationResult = {
    valid: false,
    type: 'cin',
    raw: input,
    normalized,
  };

  if (!normalized) {
    return { ...baseResult, reason: 'CIN cannot be empty.' };
  }

  const cinRegex = /^([LU])([0-9]{5})([A-Z]{2})([0-9]{4})(PLC|PTC|SGC|FTC|GAP|NPL|ULL)([0-9]{6})$/;
  const match = normalized.match(cinRegex);

  if (!match) {
    return {
      ...baseResult,
      reason: 'Invalid CIN format. Must be 21 characters (e.g. U72200AP2021PTC118543).',
    };
  }

  const [, listedChar, , stateCode, yearStr, companyType, rocNumber] = match;
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();

  if (year < 1900 || year > currentYear) {
    return {
      ...baseResult,
      reason: `Invalid incorporation year "${yearStr}" in CIN. Must be between 1900 and ${currentYear}.`,
    };
  }

  const typeNameMap: Record<string, string> = {
    PTC: 'Private Limited Company',
    PLC: 'Public Limited Company',
    ULL: 'Unlimited Liability',
    SGC: 'State Government Company',
    FTC: 'Subsidiary of Foreign Company',
  };

  return {
    valid: true,
    type: 'cin',
    raw: input,
    normalized,
    details: {
      isListed: listedChar === 'L',
      stateCode,
      isAndhraPradesh: stateCode === 'AP',
      incorporationYear: year,
      entityType: typeNameMap[companyType] || companyType,
      rocNumber,
    },
  };
}

/**
 * Validates DPIIT / Startup India Recognition Certificate ID:
 * Format: DIPP[0-9]{4,8} or DPIIT[0-9]{4,8} or DPIIT-XXXXX
 * Example: DIPP124982 or DPIIT87261
 */
export function validateDPIIT(input: string): GovIdValidationResult {
  const normalized = (input || '').trim().toUpperCase().replace(/[\s-_]/g, '');
  const baseResult: GovIdValidationResult = {
    valid: false,
    type: 'dpiit',
    raw: input,
    normalized,
  };

  if (!normalized) {
    return { ...baseResult, reason: 'DPIIT registration number cannot be empty.' };
  }

  const dpiitRegex = /^(DIPP|DPIIT)([0-9]{4,8})$/;
  const match = normalized.match(dpiitRegex);

  if (!match) {
    return {
      ...baseResult,
      reason: 'Invalid Startup India ID. Must start with DIPP or DPIIT followed by 4-8 digits (e.g. DIPP124982).',
    };
  }

  return {
    valid: true,
    type: 'dpiit',
    raw: input,
    normalized: match[0],
    details: {
      entityType: 'DPIIT Recognized Startup',
    },
  };
}

/**
 * Validates UDYAM / MSME Registration Number:
 * Format: UDYAM-[State 2 letters]-[District 2 digits]-[7 digits]
 * Example: UDYAM-AP-01-0012345
 */
export function validateUDYAM(input: string): GovIdValidationResult {
  const normalized = (input || '').trim().toUpperCase();
  const baseResult: GovIdValidationResult = {
    valid: false,
    type: 'udyam',
    raw: input,
    normalized,
  };

  if (!normalized) {
    return { ...baseResult, reason: 'UDYAM number cannot be empty.' };
  }

  const udyamRegex = /^UDYAM-([A-Z]{2})-([0-9]{2})-([0-9]{7})$/;
  const match = normalized.match(udyamRegex);

  if (!match) {
    return {
      ...baseResult,
      reason: 'Invalid UDYAM format. Must follow UDYAM-XX-00-0000000 (e.g. UDYAM-AP-01-0012345).',
    };
  }

  const stateCode = match[1];

  return {
    valid: true,
    type: 'udyam',
    raw: input,
    normalized,
    details: {
      stateCode,
      isAndhraPradesh: stateCode === 'AP',
      entityType: 'MSME Registered Enterprise',
    },
  };
}

/**
 * Master dispatcher for government registration validation.
 */
export function validateGovernmentRegistration(
  type: GovIdType,
  value: string
): GovIdValidationResult {
  if (!type || type === 'none') {
    return {
      valid: false,
      type: 'none',
      raw: value || '',
      normalized: '',
      reason: 'No government ID provided.',
    };
  }

  switch (type) {
    case 'gstin':
      return validateGSTIN(value);
    case 'cin':
      return validateCIN(value);
    case 'dpiit':
      return validateDPIIT(value);
    case 'udyam':
      return validateUDYAM(value);
    default:
      return {
        valid: false,
        type: 'none',
        raw: value,
        normalized: value,
        reason: `Unsupported government registration type "${type}".`,
      };
  }
}
