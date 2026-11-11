'use client';

import React, { useState, useMemo } from 'react';
import { NewsItem } from '@/types';
import {
  Search,
  ExternalLink,
  Sparkles,
  Radio,
  Clock,
  X,
  Filter,
  Globe2,
} from 'lucide-react';

interface NewsDirectoryClientProps {
  initialNews: NewsItem[];
}

const CATEGORIES = [
  'ALL',
  'AI & LLMS',
  'SOFTWARE DEV',
  'CYBERSECURITY',
  'CLOUD & INFRA',
  'STARTUPS & VC',
  'TECH & IT',
];

export function NewsDirectoryClient({ initialNews = [] }: NewsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredNews = useMemo(() => {
    return (initialNews || []).filter((item) => {
      if (!item) return false;

      // Category filter
      if (selectedCategory !== 'ALL') {
        const itemCat = (item.matched_keyword || '').toUpperCase();
        if (itemCat !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const sourceMatch = (item.source_name || item.source || '').toLowerCase().includes(q);
        const catMatch = (item.matched_keyword || '').toLowerCase().includes(q);
        if (!titleMatch && !sourceMatch && !catMatch) return false;
      }

      return true;
    });
  }, [initialNews, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* ── Search & Category Filter Toolbar ── */}
      <div className="bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#3A0F34]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search global tech news, AI models, frameworks, cloud, security..."
            className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-[#3A0F34]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs font-medium text-[#3A0F34] placeholder:text-[#3A0F34]/40 focus:outline-none focus:ring-2 focus:ring-[#3A0F34]/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[34px] px-3.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-xs'
                    : 'bg-white/60 hover:bg-white text-[#3A0F34] border-[#3A0F34]/15 hover:border-[#3A0F34]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Filters Status Bar ── */}
      <div className="flex items-center justify-between text-xs text-[#3A0F34]/70 px-1">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#3A0F34]">
            {filteredNews.length}
          </span>
          <span>
            {filteredNews.length === 1 ? 'article found' : 'articles found'}
          </span>
          {selectedCategory !== 'ALL' && (
            <span className="bg-[#EAAA00]/25 text-[#3A0F34] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {selectedCategory}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>Live Hourly Feed</span>
        </div>
      </div>

      {/* ── News Articles Stream ── */}
      {filteredNews.length === 0 ? (
        <div className="bg-white/80 border border-[#3A0F34]/15 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <Globe2 className="w-8 h-8 text-[#3A0F34]/50 mx-auto" />
          <h3 className="font-display font-bold text-lg text-[#3A0F34]">
            No matching news articles
          </h3>
          <p className="text-xs text-[#3A0F34]/70 leading-relaxed">
            Try adjusting your search query or switching to another technology category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A0F34] text-[#DDE3E8] text-xs font-bold uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((article, idx) => {
            const timeAgo = article.pubDate || 'Recent';
            const category = article.matched_keyword || 'TECH & IT';
            const source = article.source_name || article.source || 'Tech Desk';
            const link = article.url || article.link || '#';

            return (
              <a
                key={article.id || `news-${idx}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/80 hover:bg-white border border-[#3A0F34]/15 hover:border-[#3A0F34]/35 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9.5px] font-extrabold tracking-[0.14em] text-[#EAAA00] bg-[#3A0F34] px-2.5 py-0.5 rounded-full uppercase">
                      {category}
                    </span>
                    <span className="text-[11px] font-bold text-[#3A0F34]/80 bg-[#3A0F34]/8 px-2 py-0.5 rounded-md">
                      {source}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3A0F34]/60">
                    <Clock className="w-3 h-3 text-[#3A0F34]/40" />
                    <span>{timeAgo}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#3A0F34] group-hover:text-[#3A0F34]/80 transition-colors leading-snug">
                    {article.title}
                  </h2>
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-[#3A0F34]/5 group-hover:bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center transition-colors mt-0.5">
                    <ExternalLink className="w-3.5 h-3.5 group-hover:stroke-[2.5]" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

