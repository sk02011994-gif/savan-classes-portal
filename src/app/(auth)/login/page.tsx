'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
      });
    }
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      setStatus('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setStatus('Sending OTP...');
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        '+91' + phone,
        recaptchaRef.current!
      );
      confirmationRef.current = confirmation;
      setStep('otp');
      setStatus('OTP sent! Check your SMS.');
    } catch (err: any) {
      setStatus(err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setStatus('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setStatus('Verifying...');
    try {
      const result = await confirmationRef.current!.confirm(otp);
      const userPhone = result.user.phoneNumber!.replace('+91', '');

      // Set session cookie so middleware passes
      document.cookie = `session=${result.user.uid}; path=/; max-age=86400`;

      const userData = await getUser(userPhone);
      if (!userData) {
        setStatus('Access not granted. Contact admin.');
        setLoading(false);
        return;
      }
      if (userData.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/student/dashboard');
      }
    } catch (err: any) {
      setStatus('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-surface rounded-2xl p-9 w-full max-w-sm gold-glow text-center">
        <h1 className="text-2xl font-semibold text-primary mb-1">SAVAN CLASSES</h1>
        <p className="text-sm text-slate-400 mb-6">Portal Login</p>

        {step === 'phone' && (
          <>
            <div className="flex rounded-xl overflow-hidden mb-3 bg-background border border-slate-700 focus-within:border-primary transition-colors">
              <span className="px-3 flex items-center text-slate-400 text-sm font-medium border-r border-slate-700">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit phone number"
                className="flex-1 bg-transparent px-3 py-3 text-white text-sm outline-none placeholder-slate-500"
              />
            </div>
            <div id="recaptcha-container" className="mb-3 flex justify-center" />
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full py-3 bg-primary text-slate-900 font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="text-xs text-slate-400 mb-3">OTP sent to +91 {phone}</p>
            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest outline-none mb-3 transition-colors"
            />
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full py-3 bg-primary text-slate-900 font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={() => { setStep('phone'); setStatus(''); setOtp(''); }}
              className="mt-2 text-xs text-slate-400 hover:text-primary transition-colors"
            >
              Change number
            </button>
          </>
        )}

        {status && (
          <p className="mt-4 text-sm text-amber-300">{status}</p>
        )}

        <div className="mt-8 text-xs text-slate-500 space-y-1">
          <p>Bajrang Ward, Bhatapara</p>
          <p>📞 8839940549 &nbsp;|&nbsp; Mentor: Sagar Kesharwani</p>
        </div>
      </div>
    </main>
  );
}
