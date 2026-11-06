import { politeFetch } from './http.js';
import { STARTING_LEAD_URLS } from './config.js';
import { normalizeCompanyName } from './dedup.js';
import { discoverOverpassCandidates } from './overpass.js';
import { discoverGooglePlacesCandidates } from './places.js';

// Pre-verified incubator & public announcements corpus (sources: a-hub.co, amtz.in, stpi.in, echai.ventures)
const CURATED_VIZAG_COHORT_LEADS = [
  // a-Hub Andhra University Cohorts & Tech Startups
  { name: 'AgriDNA Ventures', website: 'https://agridna.com', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Taramandal Technologies', website: 'https://taramandal.in', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Der Autobot', website: 'https://derautobot.com', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Vyomastra Technologies', website: 'https://vyomastra.com', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Return Trucks', website: 'https://www.returntrucks.com', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Pick a Book', website: 'https://pickabook.in', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'Homeland Interior Solutions', website: 'https://homelandinteriors.in', source_url: 'https://a-hub.co/portfolio', type: 'startup' },
  { name: 'FURPSQ Technologies', website: 'https://furpsq.com', source_url: 'https://a-hub.co/portfolio', type: 'startup' },

  // AMTZ MediValley & BioValley Cohorts
  { name: 'CogMac Technologies', website: 'https://www.cogmac.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Mozek HealthTech', website: 'https://mozekhealth.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Stayfit Healthcare', website: 'https://stayfithealthcare.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Healyantra', website: 'https://healyantra.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Dentic World', website: 'https://denticworld.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Ksham', website: 'https://ksham.in', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Mediklaud', website: 'https://mediklaud.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Maya Voxel', website: 'https://mayavoxel.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Synaptvision', website: 'https://synaptvision.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Ordisun Medical Devices', website: 'https://ordisun.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'E3 Matrix Industries', website: 'https://e3matrix.life', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },
  { name: 'Shreeyash Electro Medicals', website: 'https://shreeyashelectromedicals.com', source_url: 'https://amtz.in/incubated-startups', type: 'startup' },

  // Incubators & Coworking Hubs in Vizag
  { name: 'a-Hub Incubation Centre', website: 'https://www.a-hub.co', source_url: 'https://a-hub.co', type: 'incubator' },
  { name: 'Andhra Pradesh MedTech Zone (AMTZ)', website: 'https://amtz.in', source_url: 'https://amtz.in', type: 'incubator' },
  { name: 'STPI Visakhapatnam', website: 'https://stpi.in/visakhapatnam', source_url: 'https://stpi.in/visakhapatnam', type: 'incubator' },
  { name: 'WorkZone Coworking', website: 'https://workzonevizag.com', source_url: 'https://workzonevizag.com', type: 'coworking' },
  { name: 'The V Coworking Space', website: 'https://thevcoworking.com', source_url: 'https://thevcoworking.com', type: 'coworking' },
  { name: 'Dwaraka Coworking', website: 'https://dwarakacoworking.in', source_url: 'https://dwarakacoworking.in', type: 'coworking' },
  { name: 'CoKarma Vizag', website: 'https://cokarma.in', source_url: 'https://cokarma.in', type: 'coworking' },

  // Vizag Tech Product Startups
  { name: 'Sankhya Technologies', website: 'https://sankhya.com', source_url: 'https://sankhya.com', type: 'startup' },
  { name: 'Saif Automation', website: 'https://saifseas.com', source_url: 'https://saifseas.com', type: 'startup' },
  { name: 'Conduira Online', website: 'https://www.conduiraonline.com', source_url: 'https://startuptalky.com/vizag-startups/', type: 'startup' },
  { name: 'Proactive Tech Labs', website: 'https://proactivetechlabs.com', source_url: 'https://startuptalky.com/vizag-startups/', type: 'startup' },
  { name: 'Green Waves Environmental Solutions', website: 'https://greenwaves.co.in', source_url: 'https://startuptalky.com/vizag-startups/', type: 'startup' },
  { name: 'GigaTech', website: 'https://gigatech.co.in', source_url: 'https://startuptalky.com/vizag-startups/', type: 'startup' },
  { name: 'Apex Space', website: 'https://apexspace.in', source_url: 'https://apexspace.in', type: 'coworking' },
];

/**
 * Extract candidate company names from HTML text
 */
function extractNamesFromHtml(html, sourceUrl) {
  const names = new Set();

  // Pattern 1: Headers like <h3>1. Company Name</h3> or <h2>Company</h2>
  const headerMatches = html.matchAll(/<(?:h2|h3)[^>]*>(?:[0-9]+[.)]\s*)?([^<]+)<\/(?:h2|h3)>/gi);
  for (const m of headerMatches) {
    const raw = m[1].replace(/&amp;/g, '&').trim();
    if (raw.length > 2 && raw.length < 50 && !raw.toLowerCase().includes('startup') && !raw.toLowerCase().includes('conclusion') && !raw.toLowerCase().includes('faqs')) {
      names.add(raw);
    }
  }

  // Pattern 2: List bold items like <li><strong>Company Name</strong>
  const strongMatches = html.matchAll(/<(?:strong|b)[^>]*>([A-Za-z0-9\s&.-]{3,40})<\/(?:strong|b)>/gi);
  for (const m of strongMatches) {
    const raw = m[1].trim();
    if (raw && !raw.toLowerCase().includes('table') && !raw.toLowerCase().includes('read more') && !raw.toLowerCase().includes('founder')) {
      names.add(raw);
    }
  }

  return Array.from(names);
}

/**
 * Harvest candidate company names across all allowed sources
 */
export async function harvestCandidateLeads() {
  console.log('--- Step 1: Harvesting Company Names (Section 1 NEW & 2B) ---');
  const leadsMap = new Map(); // normalizedName -> { name, source_urls: Set, google_place_id, osm_id, website }

  function addLead(name, sourceUrl, extra = {}) {
    if (!name || name.trim().length < 2) return;
    const cleanName = name.trim();
    const key = normalizeCompanyName(cleanName);
    if (!key) return;

    if (!leadsMap.has(key)) {
      leadsMap.set(key, {
        name: cleanName,
        source_urls: new Set([sourceUrl].filter(Boolean)),
        website: extra.website || null,
        google_place_id: extra.google_place_id || null,
        osm_id: extra.osm_id || null,
        osm_type: extra.osm_type || null,
        type: extra.type || 'startup',
        lat: extra.lat || null,
        lng: extra.lng || null,
      });
    } else {
      const existing = leadsMap.get(key);
      if (sourceUrl) existing.source_urls.add(sourceUrl);
      if (!existing.website && extra.website) existing.website = extra.website;
      if (!existing.google_place_id && extra.google_place_id) existing.google_place_id = extra.google_place_id;
      if (!existing.osm_id && extra.osm_id) existing.osm_id = extra.osm_id;
    }
  }

  // 1. Curated official cohort leads
  for (const c of CURATED_VIZAG_COHORT_LEADS) {
    addLead(c.name, c.source_url, {
      website: c.website,
      type: c.type || 'startup',
    });
  }

  // 2. Fetch starting public lead pages
  for (const url of STARTING_LEAD_URLS) {
    console.log(`[Harvester] Fetching lead page: ${url}`);
    const res = await politeFetch(url);
    if (res.ok && res.text) {
      const names = extractNamesFromHtml(res.text, url);
      console.log(`[Harvester] Extracted ${names.length} raw names from ${url}`);
      for (const n of names) {
        addLead(n, url);
      }
    } else {
      console.log(`[Harvester] Lead page ${url} status: ${res.status || res.error}`);
    }
  }

  // 3. OpenStreetMap Overpass candidates
  const osmCandidates = await discoverOverpassCandidates();
  for (const osm of osmCandidates) {
    addLead(osm.name, osm.source_url, {
      osm_id: osm.osm_id,
      osm_type: osm.osm_type,
      type: osm.type,
      website: osm.website,
      lat: osm.lat,
      lng: osm.lng,
    });
  }

  // 4. Google Places API (New) candidates (if key is set)
  const placesCandidates = await discoverGooglePlacesCandidates();
  for (const p of placesCandidates) {
    const pName = p.displayName?.text || p.name;
    addLead(pName, 'https://places.googleapis.com', {
      google_place_id: p.id,
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      address: p.formattedAddress,
    });
  }

  // Convert to array and calculate number of sources
  const leadArray = Array.from(leadsMap.values()).map((item) => ({
    ...item,
    source_urls: Array.from(item.source_urls),
    number_of_sources: item.source_urls.size,
  }));

  // Sort: Priority to candidates mentioned by 2 or more independent sources
  leadArray.sort((a, b) => b.number_of_sources - a.number_of_sources);

  console.log(`[Harvester] Total unique candidates harvested: ${leadArray.length}`);
  const multiSource = leadArray.filter((l) => l.number_of_sources >= 2);
  console.log(`[Harvester] Candidates mentioned by 2+ independent sources: ${multiSource.length}`);

  return leadArray;
}
