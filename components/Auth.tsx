import React, { useState, useRef, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { User as UserIcon, Phone, ArrowRight, Briefcase, Store, Sparkles, Image as ImageIcon, Mail, UploadCloud, MessageCircle, CheckCircle2, AlertCircle, Download, Upload } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface AuthProps {
  onLogin: (user: User) => void;
}

const BUSINESS_CATEGORIES = [
  "মুদির দোকান (Grocery)",
  "ফার্মেসি (Pharmacy)",
  "মোবাইল ও এক্সেসরিজ (Mobile Shop)",
  "কাপড়ের দোকান (Clothing)",
  "রেস্টুরেন্ট (Restaurant)",
  "ইলেকট্রনিক্স (Electronics)",
  "হার্ডওয়্যার ও স্যানিটারি (Hardware)",
  "সেলুন ও বিউটি পার্লার (Salon)",
  "বেকারি ও মিষ্টি (Bakery)",
  "কৃষি ও সার (Agriculture)",
  "স্টেশনারি ও বই (Stationery)",
  "ফার্নিচার (Furniture)",
  "অন্যান্য (Other)"
];

type AuthStep = 'LOGIN_INPUT' | 'REGISTER_INPUT' | 'OTP_VERIFY';

// --- REAL EMAIL CONFIGURATION ---
const DEFAULT_SERVICE_ID = "service_p3fp0mu";
const DEFAULT_TEMPLATE_ID = "template_73u18xp";
const DEFAULT_PUBLIC_KEY = "CA-KZ0vZO0aOr8cHY";

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('LOGIN_INPUT');
  
  // Form Data
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  // OTP State
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpSentName, setOtpSentName] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { // 200KB limit
        setError('❌ ছবির সাইজ ২০০KB এর কম হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            
            const data = JSON.parse(json);
            if (data.user && data.user.id) {
                const success = StorageService.importData(data.user.id, json);
                // Also restore the user profile itself
                const users = StorageService.getUsers();
                const existingIndex = users.findIndex(u => u.id === data.user.id);
                if (existingIndex >= 0) {
                    users[existingIndex] = data.user;
                } else {
                    users.push(data.user);
                }
                localStorage.setItem('bizmoney_users', JSON.stringify(users));
                
                if (success) {
                    setSuccessMsg("✅ ডেটা রিস্টোর হয়েছে! এখন লগইন করুন।");
                    setMobile(data.user.mobile);
                    setEmail(data.user.email || '');
                } else {
                    setError("❌ ফাইলের ফরম্যাট সঠিক নয়।");
                }
            } else {
                 setError("❌ ব্যাকআপ ফাইলে ইউজারের তথ্য নেই।");
            }
        } catch (err) {
            setError("❌ ফাইল রিড করা যায়নি।");
        }
    };
    reader.readAsText(file);
  };

  const sendOTP = async (destinationEmail: string, userName: string) => {
    setIsLoading(true);
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);
    setOtpSentTo(destinationEmail);
    setOtpSentName(userName);
    
    // Check if EmailJS is configured (Using defaults)
    if (DEFAULT_SERVICE_ID && DEFAULT_TEMPLATE_ID && DEFAULT_PUBLIC_KEY) {
        try {
            console.log("Attempting to send email via EmailJS...");
            await emailjs.send(
                DEFAULT_SERVICE_ID,
                DEFAULT_TEMPLATE_ID,
                {
                    // UPDATED: Changed from 'to_email' to 'email' to match your EmailJS template setting
                    email: destinationEmail, 
                    to_name: userName,
                    otp: mockOtp,
                    message: `Your verification code is ${mockOtp}`
                },
                DEFAULT_PUBLIC_KEY
            );
            console.log("Email Sent Successfully via EmailJS");
        } catch (err: any) {
            console.error("EmailJS Error:", err);
            alert(`⚠️ ইমেইল পাঠাতে সমস্যা হয়েছে।\nError: ${err.text || 'Unknown'}\n\n[FALLBACK]: Your OTP is ${mockOtp}`);
        }
    } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`📧 [DEMO EMAIL]\n\nTo: ${destinationEmail}\nSubject: BizMoney OTP\n\nHello ${userName},\nYour OTP is: ${mockOtp}`);
    }
    
    setIsLoading(false);
    setStep('OTP_VERIFY');
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!mobile || mobile.length < 11) {
        setError('❌ সঠিক মোবাইল নম্বর দিন।');
        return;
    }
    
    if (!email) {
        setError('❌ ইমেইল এড্রেস দিতে হবে।');
        return;
    }

    const user = StorageService.findUserByMobile(mobile);
    
    // 1. Check if user exists with this mobile
    if (!user) {
        setError('❌ এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট নেই। দয়া করে রেজিস্ট্রেশন করুন।');
        return;
    }

    // 2. Strict Check: Does the input email match the registered email?
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
        // DO NOT SEND OTP
        setError('❌ এই ইমেইলটি আমাদের রেকর্ডে নেই। রেজিস্ট্রেশনের সময় যে ইমেইল দিয়েছিলেন সেটি ব্যবহার করুন।');
        return;
    }

    // 3. If everything matches, send OTP
    await sendOTP(user.email, user.name);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !businessName || !mobile || !email) {
        setError('❌ সব তথ্য পূরণ করা আবশ্যক।');
        return;
    }

    const finalCategory = category === "অন্যান্য (Other)" ? customCategory : category;
    if (category === "অন্যান্য (Other)" && !customCategory.trim()) {
        setError('❌ অনুগ্রহ করে ব্যবসার ধরন লিখুন।');
        return;
    }

    const existing = StorageService.findUserByMobile(mobile);
    if (existing) {
        setError('❌ এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।');
        return;
    }

    await sendOTP(email, name);
  };

  const verifyOtpAndLogin = () => {
      if (otp !== generatedOtp) {
          setError('❌ ভুল OTP। আবার চেষ্টা করুন।');
          return;
      }

      setIsLoading(true);
      setTimeout(() => {
             let user = StorageService.findUserByMobile(mobile);
             
             if (!user) {
                 // Registration
                 const finalCategory = category === "অন্যান্য (Other)" ? customCategory : category;
                 user = StorageService.register(name, businessName, finalCategory, mobile, email, profileImage);
             }
             
             if (user) {
                 StorageService.login(user);
                 onLogin(user);
             }
          setIsLoading(false);
      }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-900 animate-gradient-xy"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in z-10">
        <div className="p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500"></div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 mb-4 shadow-lg shadow-emerald-500/30">
             <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">BizMoney</h1>
          <p className="text-slate-300 text-sm font-medium">আপনার ব্যবসার স্মার্ট সমাধান</p>
        </div>
        
        {step !== 'OTP_VERIFY' && (
             <div className="px-8 pb-2">
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl mb-6">
                    <button onClick={() => { setStep('LOGIN_INPUT'); setError(''); setSuccessMsg(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${step === 'LOGIN_INPUT' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
                        লগইন
                    </button>
                    <button onClick={() => { setStep('REGISTER_INPUT'); setError(''); setSuccessMsg(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${step === 'REGISTER_INPUT' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
                        রেজিস্ট্রেশন
                    </button>
                </div>
             </div>
        )}

        <div className="px-8 pb-8">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl mb-4 text-sm text-center backdrop-blur-sm animate-shake flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl mb-4 text-sm text-center backdrop-blur-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {step === 'LOGIN_INPUT' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  <div className="text-center text-slate-300 text-xs mb-4">
                      লগইন করতে মোবাইল এবং রেজিস্টার্ড ইমেইল দিন।
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="মোবাইল নম্বর"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="email"
                        placeholder="রেজিস্টার্ড ইমেইল"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70"
                    >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>যাচাই করুন ও OTP পাঠান <ArrowRight className="w-5 h-5" /></>}
                  </button>

                  <div className="pt-4 border-t border-slate-700/50">
                     <p className="text-slate-400 text-xs text-center mb-2">পুরানো ডেটা বা অন্য ফোনের ডেটা আনতে চান?</p>
                     <button
                        type="button"
                        onClick={() => restoreInputRef.current?.click()}
                        className="w-full border border-slate-600 hover:bg-slate-800 text-slate-300 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                     >
                        <Upload className="w-4 h-4" /> ব্যাকআপ ফাইল আপলোড (Restore)
                     </button>
                     <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreBackup} />
                  </div>
              </form>
          )}

          {/* REGISTER FORM */}
          {step === 'REGISTER_INPUT' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                
                {/* Image Upload */}
                <div className="flex justify-center mb-4">
                    <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-slate-800 transition-all overflow-hidden relative group"
                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Shop" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 mb-1" />
                                <span className="text-[10px] text-slate-500">লোগো দিন</span>
                            </>
                        )}
                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                        <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400" />
                        <input
                            type="text"
                            placeholder="আপনার নাম"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-2 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <Store className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400" />
                        <input
                            type="text"
                            placeholder="ব্যবসার নাম"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full pl-10 pr-2 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>
                
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                  <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setCustomCategory('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all appearance-none text-sm"
                  >
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                {category === "অন্যান্য (Other)" && (
                     <div className="relative group animate-fade-in">
                        <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="ব্যবসার ধরন লিখুন..."
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                            autoFocus
                        />
                     </div>
                )}

                <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400" />
                    <input
                        type="email"
                        placeholder="ইমেইল এড্রেস"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                </div>
                
                <div className="relative group">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400" />
                  <input
                    type="text"
                    placeholder="মোবাইল নম্বর"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>রেজিস্টার ও OTP পাঠান <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
          )}

          {/* OTP VERIFY */}
          {step === 'OTP_VERIFY' && (
              <div className="space-y-6 animate-fade-in text-center">
                  <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white mb-2">ইমেইল চেক করুন</h3>
                      <p className="text-slate-400 text-sm">
                          আমরা <span className="text-emerald-400 font-bold">{otpSentTo}</span> ইমেইলে কোড পাঠিয়েছি।
                      </p>
                  </div>

                  <input
                      type="text"
                      placeholder="----"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-40 mx-auto text-center text-3xl tracking-[0.5em] font-mono py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />

                  <button
                    onClick={verifyOtpAndLogin}
                    disabled={isLoading || otp.length < 4}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>যাচাই করুন <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => sendOTP(otpSentTo, otpSentName)}
                        disabled={isLoading}
                        className="text-emerald-500 text-xs hover:text-emerald-400 font-medium transition-colors"
                    >
                        কোড পাননি? আবার পাঠান
                    </button>
                    <button 
                        onClick={() => setStep('LOGIN_INPUT')}
                        className="text-slate-500 text-xs hover:text-white transition-colors"
                    >
                        নম্বর পরিবর্তন করুন
                    </button>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};