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
  Globe2,
  Building2,
  Waves,
  Newspaper,
  Flame,
} from 'lucide-react';

interface NewsDirectoryClientProps {
  vizagNews?: NewsItem[];
  worldNews?: NewsItem[];
  // Backwards compatibility if initialNews is passed
  initialNews?: NewsItem[];
}

const WORLD_CATEGORIES = [
  'ALL',
  'AI & LLMS',
  'SOFTWARE DEV',
  'CYBERSECURITY',
  'CLOUD & INFRA',
  'STARTUPS & VC',
  'TECH & IT',
];

const VIZAG_CATEGORIES = [
  'ALL',
  'AI & INFRA',
  'MEDTECH',
  'AGRITECH',
  'CLIMATE TECH',
  'MOBILITY',
  'INCUBATOR',
  'FUNDING',
  'POLICY & BEAT',
];

export function NewsDirectoryClient({
  vizagNews = [],
  worldNews = [],
  initialNews = [],
}: NewsDirectoryClientProps) {
  // Support both dual-source props and single initialNews prop
  const resolvedWorldNews = worldNews.length > 0 ? worldNews : initialNews;
  const resolvedVizagNews = vizagNews;

  const [activeTab, setActiveTab] = useState<'vizag' | 'world' | 'all'>('vizag');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Switch tabs and reset category filter
  const handleTabChange = (tab: 'vizag' | 'world' | 'all') => {
    setActiveTab(tab);
    setSelectedCategory('ALL');
  };

  // Compute active list based on tab
  const currentTabPool = useMemo(() => {
    if (activeTab === 'vizag') return resolvedVizagNews;
    if (activeTab === 'world') return resolvedWorldNews;
    // 'all' merges and sorts by publication date
    const merged = [...resolvedVizagNews, ...resolvedWorldNews];
    return merged.sort((a, b) => {
      const timeA = new Date(a.published_at || 0).getTime();
      const timeB = new Date(b.published_at || 0).getTime();
      return timeB - timeA;
    });
  }, [activeTab, resolvedVizagNews, resolvedWorldNews]);

  // Available categories based on active tab
  const availableCategories = useMemo(() => {
    if (activeTab === 'vizag') return VIZAG_CATEGORIES;
    if (activeTab === 'world') return WORLD_CATEGORIES;
    return ['ALL', 'AI & LLMS', 'SOFTWARE DEV', 'MEDTECH', 'AGRITECH', 'CLOUD & INFRA', 'INCUBATOR'];
  }, [activeTab]);

  // Filtered news items
  const filteredNews = useMemo(() => {
    return currentTabPool.filter((item) => {
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
  }, [currentTabPool, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* ── Top Level View Switcher Tabs ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-white/70 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl shadow-xs">
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
          {/* Vizag Startups Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('vizag')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-display font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'vizag'
                ? 'bg-[#3A0F34] text-[#EAAA00] shadow-sm'
                : 'text-[#3A0F34]/70 hover:text-[#3A0F34] hover:bg-white/60'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Vizag Startups</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                activeTab === 'vizag'
                  ? 'bg-[#EAAA00]/20 text-[#EAAA00]'
                  : 'bg-[#3A0F34]/10 text-[#3A0F34]'
              }`}
            >
              {resolvedVizagNews.length}
            </span>
          </button>

          {/* Global Tech Wire Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('world')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-display font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'world'
                ? 'bg-[#3A0F34] text-[#EAAA00] shadow-sm'
                : 'text-[#3A0F34]/70 hover:text-[#3A0F34] hover:bg-white/60'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span>World Tech</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                activeTab === 'world'
                  ? 'bg-[#EAAA00]/20 text-[#EAAA00]'
                  : 'bg-[#3A0F34]/10 text-[#3A0F34]'
              }`}
            >
              {resolvedWorldNews.length}
            </span>
          </button>

          {/* All Dispatches Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-display font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#3A0F34] text-[#EAAA00] shadow-sm'
                : 'text-[#3A0F34]/70 hover:text-[#3A0F34] hover:bg-white/60'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-emerald-500" />
            <span>All News</span>
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center justify-center sm:justify-end gap-2 px-3 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 rounded-xl border border-emerald-300/60">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>Updated Hourly</span>
        </div>
      </div>

      {/* ── Section Header Banner ── */}
      {activeTab === 'vizag' && (
        <div className="bg-linear-to-r from-[#3A0F34] to-[#250a22] text-[#DDE3E8] p-5 sm:p-6 rounded-2xl border border-[#3A0F34]/20 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent)] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#EAAA00]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Visakhapatnam Innovation Ecosystem</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                Vizag Startups & Technology Sector News
              </h2>
              <p className="text-xs sm:text-sm text-[#DDE3E8]/80 max-w-2xl leading-relaxed">
                Tracking milestones across AMTZ MedTech Zone, Rushikonda IT Park, Andhra University a-Hub, STPI incubators, and local tech enterprises.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-[#EAAA00] border border-[#EAAA00]/30">
                Verified Local Reporting
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'world' && (
        <div className="bg-linear-to-r from-[#1E293B] to-[#0F172A] text-slate-100 p-5 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global Technology & Engineering Wire</span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Everyday Hourly World Tech & Software News
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time dispatches from Google News World Tech and Hacker News covering AI models, developer tools, cloud infrastructure, and cybersecurity.
            </p>
          </div>
        </div>
      )}

      {/* ── Search & Category Filter Toolbar ── */}
      <div className="bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#3A0F34]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'vizag'
                ? 'Search Vizag startups, AMTZ, a-Hub, STPI, Spotmies, AquaExchange...'
                : 'Search global tech, AI models, TypeScript, Linux, cloud security...'
            }
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
          {availableCategories.map((cat) => {
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
            {filteredNews.length === 1 ? 'article displayed' : 'articles displayed'}
          </span>
          {selectedCategory !== 'ALL' && (
            <span className="bg-[#EAAA00]/25 text-[#3A0F34] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {selectedCategory}
            </span>
          )}
        </div>

        <div className="text-[11px] font-semibold text-[#3A0F34]/60">
          Showing {activeTab === 'vizag' ? 'Vizag ecosystem' : activeTab === 'world' ? 'Global wire' : 'All articles'}
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
            Try adjusting your search query or switching to another category.
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
            const category = article.matched_keyword || 'TECH';
            const source = article.source_name || article.source || 'Verified Source';
            const link = article.url || article.link || '#';
            const isVizag = article.region === 'vizag';

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
                    {/* Region Pill */}
                    {isVizag ? (
                      <span className="text-[9.5px] font-extrabold tracking-[0.14em] text-[#3A0F34] bg-[#EAAA00] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Waves className="w-2.5 h-2.5" />
                        VIZAG
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-extrabold tracking-[0.14em] text-white bg-slate-700 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Globe2 className="w-2.5 h-2.5" />
                        GLOBAL
                      </span>
                    )}

                    <span className="text-[9.5px] font-extrabold tracking-[0.12em] text-[#EAAA00] bg-[#3A0F34] px-2.5 py-0.5 rounded-full uppercase">
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
