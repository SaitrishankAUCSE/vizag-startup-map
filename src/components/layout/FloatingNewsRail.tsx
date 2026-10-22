'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem } from '@/types';
import { Newspaper, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface FloatingNewsRailProps {
  initialNews?: NewsItem[];
}

export function FloatingNewsRail({ initialNews = [] }: FloatingNewsRailProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [page, setPage] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDismissed, setMobileDismissed] = useState(false);
  const [mobileTickerIndex, setMobileTickerIndex] = useState(0);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (initialNews.length > 0) return;

    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          if (data.news && data.news.length > 0) {
            setNews(data.news);
          }
        }
      } catch {
        // Handled silently
      }
    }
    fetchNews();
  }, [initialNews]);

  // Mobile ticker auto-cycle every 5 seconds
  useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => {
      setMobileTickerIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  if (news.length === 0) return null;

  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const currentNews = news.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const getDomainFromSource = (source: string, link: string) => {
    try {
      if (link && link.startsWith('http')) {
        return new URL(link).hostname;
      }
    } catch {
      // Fallback
    }
    const s = source.toLowerCase();
    if (s.includes('hindu')) return 'thehindu.com';
    if (s.includes('times of india')) return 'timesofindia.indiatimes.com';
    if (s.includes('economic times')) return 'economictimes.indiatimes.com';
    if (s.includes('yourstory')) return 'yourstory.com';
    if (s.includes('inc42')) return 'inc42.com';
    if (s.includes('entrackr')) return 'entrackr.com';
    return 'google.com';
  };

  const getCategoryFromTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('raise') || t.includes('fund') || t.includes('invest') || t.includes('crore'))
      return 'funding';
    if (t.includes('launch') || t.includes('debut') || t.includes('unveil'))
      return 'launch';
    if (t.includes('policy') || t.includes('govt') || t.includes('grant'))
      return 'policy';
    if (t.includes('port') || t.includes('maritime') || t.includes('shipping'))
      return 'maritime';
    return 'ecosystem';
  };

  return (
    <>
      {/* 1. Desktop Floating News Card (data-map-chrome="news") */}
      <div
        data-map-chrome="news"
        className="pointer-events-none absolute right-3 top-[78px] sm:top-[74px] z-[1100] hidden sm:block w-[300px]"
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="pointer-events-auto ml-auto flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md backdrop-blur-md hover:bg-zinc-50 transition"
          >
            <Newspaper className="w-3.5 h-3.5 text-[#E04F36]" />
            <span>Latest news</span>
          </button>
        ) : (
          <div className="pointer-events-auto rounded-2xl border border-zinc-200/90 bg-white/95 shadow-xl backdrop-blur-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 tracking-tight">
                  Latest news
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse News"
                className="grid h-5 w-5 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <ul className="divide-y divide-zinc-100 max-h-[360px] overflow-y-auto">
              {currentNews.map((item, idx) => {
                const domain = getDomainFromSource(item.source, item.link);
                const tag = getCategoryFromTitle(item.title);
                return (
                  <li key={idx}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3.5 py-2.5 transition-colors hover:bg-zinc-50/80 group"
                    >
                      <p className="text-[11.5px] font-medium leading-snug text-zinc-800 group-hover:text-[#0E4D64] line-clamp-2 transition-colors">
                        {item.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-zinc-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                          alt=""
                          className="h-3.5 w-3.5 rounded-xs object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="truncate max-w-[90px]">{item.source}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.pubDate}</span>
                        <span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.2 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
                          {tag}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 px-3.5 py-2 bg-zinc-50/50 text-[11px] text-zinc-500">
              <span>
                {page * ITEMS_PER_PAGE + 1}–
                {Math.min((page + 1) * ITEMS_PER_PAGE, news.length)} of {news.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-full p-1 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="rounded-full bg-zinc-900 hover:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-white transition disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Mobile News Ticker Strip (matches Bangalore Startup Map mobile ticker) */}
      {!mobileDismissed && (
        <div className="absolute inset-x-2 top-[78px] z-[1100] flex h-7 items-center gap-2 rounded-lg border border-zinc-200/90 bg-white/95 px-2.5 py-0 shadow-xs backdrop-blur-md sm:hidden">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#E04F36]">
            News
          </span>
          <a
            href={news[mobileTickerIndex]?.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-[11px] text-zinc-800 hover:text-[#0E4D64]"
          >
            {news[mobileTickerIndex]?.title}
          </a>
          <button
            type="button"
            onClick={() => setMobileDismissed(true)}
            aria-label="Hide News"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-zinc-400 active:bg-zinc-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
}
