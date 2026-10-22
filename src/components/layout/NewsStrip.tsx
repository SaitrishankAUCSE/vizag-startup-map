'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { NewsItem } from '@/types';

export function NewsStrip() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          if (data.news && data.news.length > 0) {
            setNews(data.news);
          }
        }
      } catch {
        // Fallback handled by API
      }
    }
    loadNews();
  }, []);

  // Auto-advance ticker every 6 seconds
  useEffect(() => {
    if (news.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news.length]);

  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-[#093345] text-white px-3 md:px-5 py-1.5 text-xs flex items-center justify-between border-b border-teal-900/60 overflow-hidden">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded shrink-0 border border-teal-500/30">
          <Newspaper className="w-3 h-3 text-teal-300" />
          <span>Vizag Ecosystem News</span>
        </span>

        <a
          href={current.link}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-teal-100 hover:text-white flex items-center gap-1.5 transition-colors group"
          title={current.title}
        >
          <span className="truncate group-hover:underline">{current.title}</span>
          <span className="text-[10px] text-teal-400 font-medium shrink-0">
            • {current.source} ({current.pubDate})
          </span>
          <ExternalLink className="w-3 h-3 text-teal-400 shrink-0 opacity-70 group-hover:opacity-100" />
        </a>
      </div>

      <div className="hidden sm:flex items-center gap-1 shrink-0 ml-3">
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % news.length)}
          className="p-0.5 rounded text-teal-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Next news item"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
