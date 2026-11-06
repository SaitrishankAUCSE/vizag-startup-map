'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getClientAuth,
} from '@/lib/firebase/client';
import {
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { COPY } from '@/content/copy';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sentMagicLink, setSentMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getClientAuth();
      const actionCodeSettings = {
        url: `${window.location.origin}/`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save email so we can retrieve it when user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      setSentMagicLink(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send sign-in link';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-12 lg:py-20 px-4 md:px-8 flex items-center justify-center">
        <Strips animate={false} />

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8] text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34]">
              COMMUNITY ACCESS
            </div>
            <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight text-[#3A0F34]">
              {COPY.login.welcome}
            </h1>
            <p className="text-xs text-[#3A0F34]/75 max-w-xs mx-auto">
              {COPY.login.subtext}
            </p>
          </div>

          <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl border-2 border-[#3A0F34] bg-[#3A0F34]/10 text-[#3A0F34] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EAAA00]" />
                <span>{error}</span>
              </div>
            )}

            {sentMagicLink ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-[#EAAA00]/25 border-2 border-[#EAAA00] flex items-center justify-center mx-auto text-[#3A0F34]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-display font-bold text-lg text-[#3A0F34]">
                  Check your inbox
                </h2>
                <p className="text-xs text-[#3A0F34]/75">
                  We sent an authentication link to <span className="font-bold">{email}</span>. Click it to enter your account.
                </p>
                <button
                  type="button"
                  onClick={() => setSentMagicLink(false)}
                  className="text-xs font-bold text-[#3A0F34] underline pt-2 cursor-pointer"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#3A0F34] text-xs font-bold text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <span>{COPY.login.googleButton}</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-[#3A0F34]/20" />
                  <span className="absolute bg-[#DDE3E8] px-3 text-[10px] font-bold uppercase tracking-widest text-[#3A0F34]/60">
                    or email
                  </span>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@company.com"
                      className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#EAAA00] text-[#3A0F34] font-display font-extrabold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{loading ? 'Sending link...' : 'Send Magic Link'}</span>
                  </button>
                </form>
              </>
            )}

            <div className="pt-4 border-t border-[#3A0F34]/15 text-center text-[11px] text-[#3A0F34]/60">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#3A0F34]">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-[#3A0F34]">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
