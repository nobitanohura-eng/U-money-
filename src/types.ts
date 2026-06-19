/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView = 'landing' | 'login' | 'otp-verify' | 'dashboard';

export interface UserProfile {
  id: string; // e.g. "UM-49817"
  username: string;
  mobile: string;
  email: string;
  password?: string;
  pin?: string;
  walletBalanceUSD: number; // e.g. 74047.85
  walletBalanceUSDT: number; // e.g. 685.62
  referralCode: string; // e.g. "UMONEY108"
  referralCount: number;
  totalReferralCommission: number;
  yesterdayCommission: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'USDT_EXCHANGE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountUSDT?: number;
  amountUSD: number;
  walletName?: string; // Venmo, CashApp, Stripe, etc.
  rate: number; // e.g. 108
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface SupportTicket {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  category: string;
  description: string;
  screenshotUrl?: string; // base64 or static placeholder
}

export interface Web3FormsResponse {
  success: boolean;
  message?: string;
}
