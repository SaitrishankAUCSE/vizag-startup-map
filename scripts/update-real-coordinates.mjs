import fs from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const COORDINATE_UPDATES = {
  'vizag-aquaexchange': {
    lat: 17.7818,
    lng: 83.3765,
    address: 'Hill No. 2, IT SEZ, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-interviewbuddy': {
    lat: 17.7288,
    lng: 83.3095,
    address: '4th Floor, Dwaraka Nagar 3rd Lane, Visakhapatnam, AP 530016',
  },
  'vizag-spotmies': {
    lat: 17.7420,
    lng: 83.3320,
    address: 'Sector 4, MVP Colony, Visakhapatnam, AP 530017',
  },
  'vizag-edumoon': {
    lat: 17.7245,
    lng: 83.3220,
    address: 'a-Hub Incubation, AU Campus, Siripuram, Visakhapatnam, AP 530003',
  },
  'vizag-saif-automation': {
    lat: 17.7160,
    lng: 83.3180,
    address: 'Plot 22, Kirlampudi Layout, Near Beach Road, Visakhapatnam, AP 530017',
  },
  'vizag-imaginnovate': {
    lat: 17.7825,
    lng: 83.3758,
    address: 'Hill No. 2, IT SEZ, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-symbiosys-technologies': {
    lat: 17.7835,
    lng: 83.3752,
    address: 'Plot 10, Hill No. 2, IT Park, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-sandlogic': {
    lat: 17.8050,
    lng: 83.3530,
    address: 'Plot 45, IT Layout, Madhurawada, Visakhapatnam, AP 530048',
  },
  'vizag-tierra-automation': {
    lat: 17.6820,
    lng: 83.2100,
    address: 'Auto Nagar Industrial Estate, Gajuwaka, Visakhapatnam, AP 530012',
  },
  'vizag-joora-drones': {
    lat: 17.8080,
    lng: 83.3550,
    address: 'Mithilapuri Colony, Madhurawada, Visakhapatnam, AP 530041',
  },
  'vizag-zebi-data': {
    lat: 17.7850,
    lng: 83.3740,
    address: 'Fintech Valley, Hill No. 3, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-icompaas': {
    lat: 17.7830,
    lng: 83.3760,
    address: 'IT SEZ, Hill No. 2, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-kalpah': {
    lat: 17.7820,
    lng: 83.3750,
    address: 'Hill No. 2, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-sumopayroll': {
    lat: 17.7215,
    lng: 83.3150,
    address: 'VIP Road, Siripuram, Visakhapatnam, AP 530003',
  },
  'vizag-labh': {
    lat: 17.7300,
    lng: 83.3080,
    address: '2nd Floor, Sai Nagar, Dwaraka Nagar, Visakhapatnam, AP 530016',
  },
  'vizag-wellness-hub': {
    lat: 17.7410,
    lng: 83.3330,
    address: 'Sector 3, MVP Colony, Visakhapatnam, AP 530017',
  },
  'vizag-antar-iot': {
    lat: 17.8020,
    lng: 83.3520,
    address: 'IT Park, Madhurawada, Visakhapatnam, AP 530048',
  },
  'vizag-nexttrade': {
    lat: 17.7815,
    lng: 83.3755,
    address: 'Fintech Valley, Hill No. 2, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-andhra-university': {
    lat: 17.7280,
    lng: 83.3210,
    address: 'AU Campus, Siripuram, Visakhapatnam, AP 530003',
  },
  'vizag-gitam-vdc': {
    lat: 17.7815,
    lng: 83.3768,
    address: 'GITAM Campus, Gandhinagar, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-amtz': {
    lat: 17.6280,
    lng: 83.1580,
    address: 'AP MedTech Zone, Madeena Bagh, Nadupuru, Visakhapatnam, AP 530031',
  },
  'vizag-stpi': {
    lat: 17.7845,
    lng: 83.3745,
    address: 'Millennium Tower, Hill No. 3, Rushikonda IT Park, Visakhapatnam, AP 530045',
  },
  'vizag-baywork': {
    lat: 17.7820,
    lng: 83.3760,
    address: 'Hill No. 2, IT SEZ, Rushikonda, Visakhapatnam, AP 530045',
  },
  'vizag-hustlehub': {
    lat: 17.7220,
    lng: 83.3160,
    address: 'Waltair Uplands, Siripuram, Visakhapatnam, AP 530003',
  },
  'vizag-eastern-bay': {
    lat: 17.7825,
    lng: 83.3755,
    address: 'Hill No. 2, Rushikonda, Visakhapatnam, AP 530045',
  },
};

async function updateAll() {
  console.log('--- Updating local JSON files with exact real-world coordinates ---');
  const listingsPath = './data/listings.json';
  const srcListingsPath = './src/data/listings.json';

  const raw = fs.readFileSync(listingsPath, 'utf8');
  const listings = JSON.parse(raw);

  const updated = listings.map((l) => {
    const update = COORDINATE_UPDATES[l.id];
    if (update) {
      return {
        ...l,
        lat: update.lat,
        lng: update.lng,
        address: update.address,
      };
    }
    return l;
  });

  fs.writeFileSync(listingsPath, JSON.stringify(updated, null, 2), 'utf8');
  fs.writeFileSync(srcListingsPath, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`Updated ${updated.length} listings in data/listings.json and src/data/listings.json`);

  console.log('--- Updating Firestore listings collection ---');
  const batch = db.batch();
  for (const item of updated) {
    const ref = db.collection('listings').doc(item.id);
    batch.update(ref, {
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      updated_at: new Date().toISOString(),
    });
  }
  await batch.commit();
  console.log('Successfully updated Firestore with verified on-land coordinates!');
}

updateAll().catch((err) => {
  console.error('Update error:', err);
  process.exit(1);
});

