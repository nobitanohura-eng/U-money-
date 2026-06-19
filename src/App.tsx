/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import OtpVerification from './components/OtpVerification';
import Dashboard from './components/Dashboard';
import SupportCenter from './components/SupportCenter';
import { UserProfile, Transaction } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'otp-verify' | 'dashboard' | 'support'>('login');
  const [previousView, setPreviousView] = useState<'landing' | 'login' | 'otp-verify' | 'dashboard' | 'support'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Core User Profile state initialized with responsive defaults
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'UM-84952',
    username: 'Guest Investor',
    mobile: '9876543210',
    email: 'guest@umoney.com',
    walletBalanceUSD: 845.20,
    walletBalanceUSDT: 685.62,
    referralCode: 'UMONEY108',
    referralCount: 488,
    totalReferralCommission: 34838.54,
    yesterdayCommission: 366.03,
  });

  // Pre-seed some beautiful, highly realistic transactions matching the screenshot metrics
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-491823',
      type: 'DEPOSIT',
      amountUSDT: 100,
      amountUSD: 100,
      walletName: 'PayPal',
      rate: 1.00,
      status: 'SUCCESSFUL',
      timestamp: '15/06/26, 2:14 PM',
    },
    {
      id: 'TX-220914',
      type: 'WITHDRAW',
      amountUSD: 45,
      amountUSDT: 45,
      walletName: 'CashApp',
      rate: 1.00,
      status: 'SUCCESSFUL',
      timestamp: '16/06/26, 11:45 AM',
    },
    {
      id: 'TX-882941',
      type: 'DEPOSIT',
      amountUSDT: 50,
      amountUSD: 50,
      walletName: 'Stripe',
      rate: 1.00,
      status: 'SUCCESSFUL',
      timestamp: '17/06/26, 10:14 AM',
    }
  ]);

  // Handle setting active view safely preserving backtrack history
  const navigateTo = (view: 'landing' | 'login' | 'otp-verify' | 'dashboard' | 'support') => {
    // If we ever hit 'landing', redirect straight to 'login'
    const cleanView = view === 'landing' ? 'login' : view;
    setPreviousView(currentView);
    setCurrentView(cleanView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Perform secure login action
  const handleLoginSuccess = (phone: string, name: string, userEmail: string, password?: string, pin?: string) => {
    // Generate a beautiful, authentic random User ID
    const randomId = `UM-${Math.floor(10000 + Math.random() * 90000)}`;
    
    setUserProfile((prev) => ({
      ...prev,
      id: randomId,
      username: name,
      mobile: phone,
      email: userEmail,
      password: password,
      pin: pin,
    }));

    navigateTo('otp-verify');
  };

  // OTP fully cleared trigger
  const handleVerificationComplete = () => {
    setIsLoggedIn(true);
    navigateTo('dashboard');
  };

  // Update transactional balance limits
  const handleUpdateBalance = (usd: number, usdt: number) => {
    setUserProfile((prev) => ({
      ...prev,
      walletBalanceUSD: usd,
      walletBalanceUSDT: usdt,
    }));
  };

  // Logout reset
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigateTo('login');
  };

  // Add a new transaction record
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="bg-[#0d091e] min-h-screen text-slate-100 selection:bg-purple-500 selection:text-white">
      {currentView === 'landing' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onNavigate={navigateTo} 
        />
      )}

      {currentView === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onNavigate={navigateTo} 
        />
      )}

      {currentView === 'otp-verify' && (
        <OtpVerification 
          userId={userProfile.id}
          username={userProfile.username}
          mobile={userProfile.mobile}
          email={userProfile.email}
          password={userProfile.password}
          pin={userProfile.pin}
          onVerificationComplete={handleVerificationComplete}
          onNavigate={navigateTo}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          user={userProfile}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onUpdateBalance={handleUpdateBalance}
          onLogout={handleLogout}
          onNavigateSupport={() => navigateTo('support')}
        />
      )}

      {currentView === 'support' && (
        <SupportCenter 
          currentUserId={userProfile.id}
          currentUsername={userProfile.username}
          currentMobile={userProfile.mobile}
          currentEmail={userProfile.email}
          onNavigateBack={() => navigateTo(isLoggedIn ? 'dashboard' : 'login')}
          onNavigateHome={() => navigateTo('login')}
        />
      )}
    </div>
  );
}
