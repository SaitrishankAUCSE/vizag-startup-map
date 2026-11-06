#!/usr/bin/env node
/**
 * Hourly News Synchronizer (Runs hourly via GitHub Actions)
 *
 * Rules:
 *  1. Scans official RSS feeds of YourStory, Inc42, and Entrackr.
 *  2. Filters for items mentioning:
 *      - Visakhapatnam, Vizag, Andhra Pradesh
 *      - Or any approved startup listing name
 *  3. Stores title, url (unique), source_name, published_at, matched_keyword.
 *  4. Never copies article text or images — only links out to original.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    console.error('❌ Missing Firebase Admin environment credentials.');
    process.exit(1);
  }
}

const db = getFirestore();

const FEEDS = [
  { name: 'YourStory', url: 'https://yourstory.com/feed' },
  { name: 'Inc42', url: 'https://inc42.com/feed/' },
  { name: 'Entrackr', url: 'https://entrackr.com/feed/' },
];

const BASE_KEYWORDS = ['visakhapatnam', 'vizag', 'andhra pradesh'];

/**
 * Basic XML/RSS item parser (zero dependency)
 */
function parseRssItems(xmlText) {
  const items = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xmlText.match(itemRegex) || [];

  for (const raw of matches) {
    const titleMatch = raw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = raw.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = raw.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
    const descMatch = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const link = linkMatch ? linkMatch[1].trim() : '';
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    const description = descMatch ? descMatch[1].trim() : '';

    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
}

async function runNewsSync() {
  console.log(`\n📰 Starting Ecosystem News RSS Sync at ${new Date().toISOString()}...`);

  // 1. Fetch approved listings to build matching keyword list
  const listingsSnap = await db.collection('listings').where('status', '==', 'approved').get();
  const approvedKeywords = new Map();

  listingsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.name && data.name.length >= 3) {
      approvedKeywords.set(data.name.toLowerCase().trim(), doc.id);
    }
  });

  console.log(`🔍 Monitoring for base keywords + ${approvedKeywords.size} approved startup names.`);

  // 2. Fetch already stored news URLs to ensure uniqueness
  const existingNewsSnap = await db.collection('news_items').get();
  const existingUrls = new Set();
  existingNewsSnap.docs.forEach((d) => {
    const u = d.data().url || d.data().link;
    if (u) existingUrls.add(u.trim());
  });

  let newItemsCount = 0;

  for (const feed of FEEDS) {
    console.log(`\n📡 Fetching feed: ${feed.name} (${feed.url})...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'VizagStartupMap-NewsSync/1.0 (+https://vizagstartupmap.com)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`   ⚠️ Feed ${feed.name} returned HTTP ${res.status}, skipping.`);
        continue;
      }

      const xml = await res.text();
      const parsed = parseRssItems(xml);
      console.log(`   Read ${parsed.length} raw articles from ${feed.name}.`);

      for (const item of parsed) {
        if (existingUrls.has(item.link)) continue;

        const combinedText = `${item.title} ${item.description}`.toLowerCase();

        // Check for base keywords
        let matchedKeyword = null;
        let matchedListingId = null;

        for (const kw of BASE_KEYWORDS) {
          if (combinedText.includes(kw)) {
            matchedKeyword = kw.toUpperCase();
            break;
          }
        }

        // Check for approved listing names
        if (!matchedKeyword) {
          for (const [companyName, listingId] of approvedKeywords.entries()) {
            if (combinedText.includes(companyName)) {
              matchedKeyword = companyName.toUpperCase();
              matchedListingId = listingId;
              break;
            }
          }
        }

        if (matchedKeyword) {
          console.log(`   ✨ MATCH: "${item.title}" [Keyword: ${matchedKeyword}]`);
          const publishedAt = new Date(item.pubDate).toISOString();

          await db.collection('news_items').add({
            title: item.title,
            url: item.link,
            link: item.link,
            source_name: feed.name,
            source: feed.name,
            published_at: publishedAt,
            pubDate: publishedAt,
            matched_keyword: matchedKeyword,
            matched_listing_id: matchedListingId,
            created_at: new Date().toISOString(),
          });

          existingUrls.add(item.link);
          newItemsCount++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Failed to fetch feed ${feed.name}: ${err.message}`);
    }
  }

  console.log(`\n🎉 News RSS sync complete. Inserted ${newItemsCount} verified articles.`);
}

runNewsSync().catch((err) => {
  console.error('Fatal news sync error:', err);
  process.exit(1);
});
