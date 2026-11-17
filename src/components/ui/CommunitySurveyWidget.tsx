'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Check, Send } from 'lucide-react';

const PURPOSES = [
  { id: 'exploring', label: 'Exploring startups & ventures', icon: '🏢' },
  { id: 'jobs', label: 'Looking for tech jobs / hiring', icon: '💼' },
  { id: 'founder', label: 'Founder adding / claiming my startup', icon: '🚀' },
  { id: 'research', label: 'Ecosystem research & data', icon: '📊' },
];

interface CommunitySurveyWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunitySurveyWidget({ isOpen, onClose }: CommunitySurveyWidgetProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurpose) return;

    try {
      await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: selectedPurpose,
          feedback: feedback.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Fallback
    }

    setSubmitted(true);
    try {
      localStorage.setItem('vsm_survey_completed', 'true');
    } catch {}

    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-[#3A0F34]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-3xl p-5 sm:p-6 shadow-2xl text-[#3A0F34] animate-in fade-in zoom-in-95 duration-200 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EAAA00] bg-[#3A0F34] px-2.5 py-0.5 rounded-full">
              Community Pulse
            </span>
            <span className="text-xs font-bold text-[#3A0F34]/70">Feedback</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer transition-colors"
            aria-label="Close survey"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="font-display font-bold text-base text-[#3A0F34]">
              Thank you for shaping Vizag!
            </h4>
            <p className="text-xs text-[#3A0F34]/75 max-w-xs mx-auto">
              Your feedback directly guides new map layers, startup verifications, and career tools.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <p className="text-xs font-bold text-[#3A0F34]">
                What brings you to the map today?
              </p>
              <p className="text-[11px] text-[#3A0F34]/60 mt-0.5">
                Select your primary reason for visiting:
              </p>
            </div>

            <div className="space-y-1.5">
              {PURPOSES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPurpose(item.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer font-semibold ${
                    selectedPurpose === item.id
                      ? 'bg-[#3A0F34] text-[#EAAA00] shadow-xs'
                      : 'bg-white/80 hover:bg-white text-[#3A0F34] border border-[#3A0F34]/10'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3A0F34]/75 mb-1">
                What feature or startup would you like next?
              </label>
              <input
                type="text"
                placeholder="e.g. Investor directory, internship tag, or feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:ring-2 focus:ring-[#3A0F34]/30 placeholder:text-[#3A0F34]/40 text-[#3A0F34]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={!selectedPurpose}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] disabled:opacity-40 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-3 py-2.5 text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
