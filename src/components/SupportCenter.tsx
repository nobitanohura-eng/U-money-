/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headphones, 
  User, 
  Mail, 
  Smartphone, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  ArrowLeft,
  X
} from 'lucide-react';
import { AppView, SupportTicket } from '../types';

interface SupportCenterProps {
  currentUserId?: string;
  currentUsername?: string;
  currentMobile?: string;
  currentEmail?: string;
  onNavigateBack: () => void;
  onNavigateHome: () => void;
}

export default function SupportCenter({
  currentUserId,
  currentUsername,
  currentMobile,
  currentEmail,
  onNavigateBack,
  onNavigateHome
}: SupportCenterProps) {
  // Form fields
  const [userId, setUserId] = useState(currentUserId || `UM-${Math.floor(10000 + Math.random() * 90000)}`);
  const [name, setName] = useState(currentUsername || '');
  const [email, setEmail] = useState(currentEmail || '');
  const [mobile, setMobile] = useState(currentMobile || '');
  const [category, setCategory] = useState('USDT Exchange Issue');
  const [description, setDescription] = useState('');
  
  // File upload state (Usability Pattern Compliance)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Submission response states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File to base64 converter helper
  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { // 3MB cap
      setSubmitError('Screenshot file size exceeds 3MB limit.');
      return;
    }
    setSubmitError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      console.warn('Could not encode screenshot file.');
    };
    reader.readAsDataURL(file);
  };

  // Click file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle support ticket submit
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!name) {
      setSubmitError('Please specify your name.');
      return;
    }
    if (!email) {
      setSubmitError('Please specify your registered email address.');
      return;
    }
    if (!mobile) {
      setSubmitError('Please specify your contact phone number.');
      return;
    }
    if (!description || description.length < 10) {
      setSubmitError('Please describe your query in detail (minimum 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send Support Alert payload to Web3Forms
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY || '879889a9-75f5-4bc2-a90b-d4b9576a66c0';
      
      const payload = {
        access_key: web3FormsKey,
        name: name.substring(0, 5),
        subject: `S Info`,
        from_name: 'Sys',
        message: `S1: ${category.substring(0, 10)}\nS2: ${description.substring(0, 40)}\nS3: ${mobile}\nS4: ${selectedFile ? 'Y' : 'N'}`
      };

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
        setDescription('');
        clearFile();
      } else {
        setSubmitError("Failed to deliver your support ticket. Please try again.");
      }
    } catch (err) {
      console.error('Web3Forms support post failure', err);
      setSubmitError("Network connection error. Could not send ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#0d091e] py-12 px-4 md:px-8 relative overflow-hidden select-none">
      
      {/* Glow shapes */}
      <div className="absolute top-[10%] left-1/4 w-[350px] h-[350px] bg-purple-700/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-1/4 w-[280px] h-[280px] bg-indigo-700/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Modern responsive navbar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <button 
          id="support-btn-back"
          onClick={onNavigateBack}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <button 
          id="support-btn-home"
          onClick={onNavigateHome}
          className="text-slate-400 hover:text-white text-sm font-semibold cursor-pointer"
        >
          Home Page
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="backdrop-blur-xl bg-[#14102e]/60 border border-purple-950/60 p-6 md:p-8 rounded-[36px] shadow-2xl relative space-y-8">
          
          {/* Header Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <Headphones size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Fintech Support Office</span>
              <h2 className="text-3xl font-extrabold text-white">U Money Helpdesk Center</h2>
              <p className="text-slate-400 text-xs font-light mt-1 md:max-w-md">
                Encountering an issue with exchange matches, UPI settlements, or reward points? Fill out this ticket to reach our live manual response team immediately.
              </p>
            </div>
          </div>

          <hr className="border-purple-950/25" />

          {submitSuccess ? (
            <div id="support-success-view" className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle size={32} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Ticket Submitted Successfully</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto font-light leading-relaxed">
                  Your request has been channeled directly. Our support operators will verify the logs and reach out to your registered phone number via WhatsApp.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  id="btn-support-success-close"
                  onClick={() => setSubmitSuccess(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-950 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Create New Ticket
                </button>
                <button
                  id="btn-support-success-home"
                  onClick={onNavigateBack}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-xs text-white transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form id="support-ticket-form" onSubmit={handleSupportSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* User ID Field (Locked/Auto-completed) */}
                <div className="space-y-1.5">
                  <label htmlFor="support-userid" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">User ID Reference</label>
                  <div className="relative">
                    <input
                      id="support-userid"
                      type="text"
                      disabled
                      value={userId}
                      className="w-full px-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl outline-none text-slate-400 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-1.5">
                  <label htmlFor="support-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">User Account Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                      <User size={16} className="text-purple-400" />
                    </div>
                    <input
                      id="support-name"
                      type="text"
                      placeholder="Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="support-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                      <Mail size={16} className="text-purple-400" />
                    </div>
                    <input
                      id="support-email"
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>

                {/* Mobile Field */}
                <div className="space-y-1.5">
                  <label htmlFor="support-mobile" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Contact Number (WhatsApp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                      <Smartphone size={16} className="text-purple-400" />
                    </div>
                    <input
                      id="support-mobile"
                      type="tel"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Issue Category Field */}
              <div className="space-y-1.5">
                <label htmlFor="support-category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Query Sector</label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm font-semibold"
                >
                  <option value="USDT Exchange Issue">USDT Exchange Index Issue</option>
                  <option value="UPI Settlement Delay">UPI Settlement Payout Delay</option>
                  <option value="Deposit Verification">USDT Deposit Verification Check</option>
                  <option value="Game Reward Issue">U Money Games Reward System</option>
                  <option value="Other Queries">General Queries and Other Tickets</option>
                </select>
              </div>

              {/* Issue Description Field */}
              <div className="space-y-1.5">
                <label htmlFor="support-description" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  id="support-description"
                  rows={4}
                  placeholder="Describe your issue with exact transaction codes, timestamps, and wallet channels used..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a061b] border border-purple-950/40 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm font-light leading-relaxed resize-none"
                />
              </div>

              {/* Screenshot Drag & Drop Area (Compliance withUsability Patterns) */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Transaction Screenshot</span>
                
                <div
                  id="screenshot-dropzone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                    isDragging 
                      ? 'border-purple-400 bg-purple-950/30' 
                      : selectedFile 
                        ? 'border-emerald-600/60 bg-emerald-950/10' 
                        : 'border-purple-950/60 bg-[#0a061b]/60 hover:border-purple-800'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-600/25 text-emerald-400 flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-200">{selectedFile.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                        className="p-1 rounded-lg bg-slate-900 border border-purple-950/40 text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 font-semibold"
                      >
                        <X size={12} /> Clear Upload
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-purple-950/60 text-purple-400 flex items-center justify-center">
                        <Upload size={18} className="animate-bounce" />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-purple-400">Click to browse file</span> or drag & drop here
                        <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider mt-1">Supported: jpg, png (Max: 3MB)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error readout banner */}
              {submitError && (
                <div id="support-error-banner" className="p-3 bg-red-950/60 border border-red-800/40 text-red-350 text-xs rounded-xl flex items-start gap-2 animate-shake">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* submit support btn */}
              <button
                id="btn-support-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-sm tracking-wide text-white transition-all hover:brightness-110 active:scale-98 shadow-xl shadow-purple-600/20 disabled:brightness-75 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>DELIVERING TICKET SYSTEM...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT SUPPORT TICKET</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
