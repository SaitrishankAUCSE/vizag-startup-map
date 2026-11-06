'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Check, Send } from 'lucide-react';

const PURPOSES = [
  { id: 'exploring', label: 'Exploring startups & ventures', icon: '🏢' },
  { id: 'jobs', label: 'Looking for tech jobs / hiring', icon: '💼' },
  { id: 'founder', label: 'Founder adding / claiming my startup', icon: '🚀' },
  { id: 'research', label: 'Ecosystem research & data', icon: '📊' },
];

export function CommunitySurveyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true until checked

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('vsm_survey_completed');
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {}
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('vsm_survey_completed', 'true');
    } catch {}
  };

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
    } catch {}

    setSubmitted(true);
    try {
      localStorage.setItem('vsm_survey_completed', 'true');
    } catch {}

    setTimeout(() => {
      setDismissed(true);
    }, 2800);
  };

  return (
    <div className="fixed bottom-20 left-4 z-[1250] font-sans">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#DDE3E8]/95 border border-[#3A0F34]/20 backdrop-blur-md text-[#3A0F34] rounded-full px-3 py-1.5 text-xs font-bold shadow-lg hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-all cursor-pointer group"
          aria-label="Community Feedback"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#EAAA00] group-hover:text-[#EAAA00]" />
          <span>Quick feedback</span>
        </button>
      ) : (
        <div className="w-[300px] sm:w-[320px] bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-2xl p-4 shadow-2xl text-[#3A0F34] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EAAA00] bg-[#3A0F34] px-2 py-0.5 rounded-full">
              Community Pulse
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-[#3A0F34]">Thank you!</h4>
              <p className="text-[11px] text-[#3A0F34]/70">
                Your feedback directly shapes the Visakhapatnam startup atlas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-bold text-[#3A0F34]">
                What brings you to the map today?
              </p>

              <div className="space-y-1.5">
                {PURPOSES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPurpose(item.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all cursor-pointer font-semibold ${
                      selectedPurpose === item.id
                        ? 'bg-[#3A0F34] text-[#DDE3E8] shadow-xs'
                        : 'bg-white/70 hover:bg-white text-[#3A0F34] border border-[#3A0F34]/10'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="What feature would you like next? (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white/90 border border-[#3A0F34]/20 outline-none placeholder:text-[#3A0F34]/40 text-[#3A0F34]"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!selectedPurpose}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] disabled:opacity-50 text-xs font-bold py-2 px-3 rounded-full transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-semibold px-3 py-2 text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

