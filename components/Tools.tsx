import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Download, CreditCard, ArrowLeft, Printer, PenTool, Image as ImageIcon, Phone, Mail, MapPin, Globe, Sparkles, Layout, Play, Pause, ChevronRight, ChevronLeft, RefreshCw, Plus, Trash2, Calendar, User as UserIcon, FileText, Percent, DollarSign, Layers } from 'lucide-react';
import { PdfService } from '../services/pdfService';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface ToolsProps {
  user: User;
}

type ToolType = 'menu' | 'card' | 'bill' | 'calc';

const CARD_THEMES = [
    { id: 0, name: 'Tech Elite', layout: 'tech', bg: 'bg-[#0f172a]', text: 'text-white', accent: 'text-[#10b981]', border: 'border-slate-800' },
    { id: 1, name: 'Midnight Classic', layout: 'classic', bg: 'bg-slate-900', text: 'text-white', accent: 'text-amber-400', border: 'border-slate-700' },
    { id: 2, name: 'Emerald Pro', layout: 'classic', bg: 'bg-emerald-800', text: 'text-white', accent: 'text-emerald-300', border: 'border-emerald-600' },
    { id: 3, name: 'Royal Gold', layout: 'centered', bg: 'bg-gradient-to-r from-amber-200 to-yellow-500', text: 'text-slate-900', accent: 'text-slate-800', border: 'border-amber-600' },
    { id: 4, name: 'Ocean Breeze', layout: 'modern', bg: 'bg-cyan-600', text: 'text-white', accent: 'text-cyan-100', border: 'border-cyan-500' },
    { id: 5, name: 'Minimal White', layout: 'minimal', bg: 'bg-white', text: 'text-slate-800', accent: 'text-indigo-600', border: 'border-slate-200' },
    { id: 6, name: 'Corporate Blue', layout: 'sidebar', bg: 'bg-blue-900', text: 'text-white', accent: 'text-blue-200', border: 'border-blue-700' },
    { id: 7, name: 'Red Velvet', layout: 'classic', bg: 'bg-rose-700', text: 'text-white', accent: 'text-rose-200', border: 'border-rose-600' },
    { id: 8, name: 'Dark Matter', layout: 'modern', bg: 'bg-black', text: 'text-gray-200', accent: 'text-purple-500', border: 'border-gray-800' },
    { id: 9, name: 'Nature Green', layout: 'centered', bg: 'bg-green-700', text: 'text-white', accent: 'text-green-200', border: 'border-green-600' },
    { id: 10, name: 'Sunset Orange', layout: 'sidebar', bg: 'bg-orange-600', text: 'text-white', accent: 'text-yellow-100', border: 'border-orange-500' },
    { id: 11, name: 'Purple Haze', layout: 'creative', bg: 'bg-purple-800', text: 'text-white', accent: 'text-fuchsia-300', border: 'border-purple-600' },
    { id: 12, name: 'Steel Grey', layout: 'minimal', bg: 'bg-gray-200', text: 'text-gray-800', accent: 'text-gray-600', border: 'border-gray-400' },
    { id: 13, name: 'Teal Tech', layout: 'tech', bg: 'bg-teal-900', text: 'text-white', accent: 'text-teal-400', border: 'border-teal-700' },
    { id: 14, name: 'Ruby Red', layout: 'centered', bg: 'bg-red-800', text: 'text-white', accent: 'text-red-300', border: 'border-red-600' },
    { id: 15, name: 'Golden Hour', layout: 'creative', bg: 'bg-yellow-400', text: 'text-slate-900', accent: 'text-white', border: 'border-yellow-600' },
    { id: 16, name: 'Clean Sky', layout: 'classic', bg: 'bg-sky-100', text: 'text-sky-900', accent: 'text-sky-600', border: 'border-sky-300' },
    { id: 17, name: 'Carbon Fiber', layout: 'modern', bg: 'bg-neutral-800', text: 'text-neutral-100', accent: 'text-red-500', border: 'border-neutral-700' },
    { id: 18, name: 'Lavender Soft', layout: 'minimal', bg: 'bg-violet-50', text: 'text-violet-900', accent: 'text-violet-600', border: 'border-violet-200' },
    { id: 19, name: 'Indigo Deep', layout: 'sidebar', bg: 'bg-indigo-900', text: 'text-white', accent: 'text-indigo-300', border: 'border-indigo-700' },
    { id: 20, name: 'Bronze Age', layout: 'centered', bg: 'bg-stone-700', text: 'text-stone-100', accent: 'text-amber-600', border: 'border-stone-500' },
];

export const Tools: React.FC<ToolsProps> = ({ user }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('menu');

  // --- CALCULATOR STATE ---
  const [calcInput, setCalcInput] = useState('');
  
  // --- CARD STATE ---
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState({ 
    name: user.name, 
    business: user.businessName, 
    category: user.businessCategory || 'PROGRAMMING SERVICES',
    mobile: user.mobile, 
    email: user.email||'', 
    address: user.address||'Online Business', 
    title: 'Proprietor / Owner',
    website: user.website || 'https://www.facebook.com/',
    logo: user.profileImage || ''
  });
  
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // --- BILL MAKER STATE ---
  const [billItems, setBillItems] = useState<{id: string, name: string, price: number, qty: number}[]>([{id: '1', name: '', price: 0, qty: 1}]);
  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceId, setInvoiceId] = useState(`MEMO-${Math.floor(100000 + Math.random() * 900000)}`);
  const [memoQrCode, setMemoQrCode] = useState('');
  
  // New Financial Fields
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);

  // --- EFFECTS ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTool === 'card' && isAutoPlaying) {
      interval = setInterval(() => {
        setSelectedThemeIndex((prev) => (prev + 1) % CARD_THEMES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTool, isAutoPlaying]);

  useEffect(() => {
     if (activeTool === 'bill') {
         QRCode.toDataURL(invoiceId, { width: 100, margin: 0, color: { dark: '#1e293b', light: '#ffffff00' } })
            .then(setMemoQrCode)
            .catch(console.error);
     }
  }, [invoiceId, activeTool]);

  // --- CALCULATIONS ---
  const subTotal = billItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const taxAmount = (subTotal * taxRate) / 100;
  const grandTotal = subTotal + taxAmount + otherCharges - discount;

  // --- ACTIONS ---
  const handleCalc = (val: string) => {
      if(val === 'C') setCalcInput('');
      else if(val === '=') {
          try { setCalcInput(eval(calcInput).toString()); } catch { setCalcInput('Error'); }
      } else setCalcInput(prev => prev + val);
  };

  const regenerateInvoiceId = () => {
      setInvoiceId(`MEMO-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const addBillItem = () => {
      setBillItems([...billItems, { id: Math.random().toString(), name: '', price: 0, qty: 1 }]);
  };

  const removeBillItem = (id: string) => {
      if (billItems.length > 1) {
          setBillItems(billItems.filter(i => i.id !== id));
      }
  };

  const updateBillItem = (id: string, field: 'name'|'price'|'qty', value: string | number) => {
      setBillItems(billItems.map(item => 
          item.id === id ? { ...item, [field]: value } : item
      ));
  };

  const downloadBillPDF = async () => await PdfService.exportToPdf('memo-preview', `${invoiceId}.pdf`, 'receipt');
  const downloadBillImage = async () => await PdfService.exportToImage('memo-preview', `${invoiceId}.png`);
  
  const downloadCardImage = async () => await PdfService.exportToImage('card-preview', `Card_${cardData.business.replace(/\s/g,'_')}.png`);

  const ToolCard = ({ id, icon: Icon, title, desc, color }: any) => (
    <button onClick={() => setActiveTool(id)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color.replace('bg-', 'from-')}/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform shadow-md`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-1">{title}</h3>
      <p className="text-xs text-slate-500 relative z-10">{desc}</p>
    </button>
  );

  const currentTheme = CARD_THEMES[selectedThemeIndex];

  const renderCardContent = () => {
      const commonClasses = `w-[480px] aspect-[1.75/1] rounded-xl shadow-2xl relative overflow-hidden flex flex-col p-8 transition-all duration-300 ${currentTheme.bg} ${currentTheme.text} font-sans select-none`;
      const LogoWidget = ({ className, size = 'text-2xl' }: { className?: string, size?: string }) => (
        <div className={`flex items-center justify-center overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg ${className}`}>
             {cardData.logo ? (
                 <img src={cardData.logo} alt="Logo" className="w-full h-full object-cover" />
             ) : (
                 <span className={`font-bold ${size} ${currentTheme.text}`}>{cardData.business.charAt(0).toUpperCase()}</span>
             )}
        </div>
      );
      const ContactGrid = ({ accentColor }: { accentColor: string }) => (
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[9px] font-medium opacity-90 mt-auto w-full">
            <div className="flex items-center gap-1.5 min-w-0">
                <Phone className={`w-3 h-3 flex-shrink-0 ${accentColor}`} /> 
                <span className="truncate">{cardData.mobile}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                <Mail className={`w-3 h-3 flex-shrink-0 ${accentColor}`} /> 
                <span className="truncate">{cardData.email}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                <MapPin className={`w-3 h-3 flex-shrink-0 ${accentColor}`} /> 
                <span className="truncate w-full">{cardData.address}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                <Globe className={`w-3 h-3 flex-shrink-0 ${accentColor}`} /> 
                <span className="truncate w-full">{cardData.website}</span>
            </div>
        </div>
      );
      switch(currentTheme.layout) {
          case 'tech': return (
                  <div className={`${commonClasses} justify-between`}>
                      <div className="absolute top-4 left-0 w-full text-center opacity-20 text-[9px] tracking-[0.4em] font-bold uppercase font-mono">BizMoney Manager</div>
                      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                      <div className="flex justify-between items-start mt-6 relative z-10">
                          <div className="flex-1">
                              <h2 className={`text-4xl font-bold uppercase tracking-tight leading-none ${currentTheme.accent}`}>{cardData.business}</h2>
                              <p className="text-[11px] tracking-[0.1em] uppercase mt-2 text-gray-300 font-medium">{cardData.category}</p>
                          </div>
                          <div className="ml-4"><LogoWidget className="w-16 h-16" size="text-3xl" /></div>
                      </div>
                      <div className="mt-8 relative z-10">
                           <div className="flex justify-between items-end mb-6">
                               <div className="flex items-center gap-4">
                                   <div className={`h-1.5 w-12 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${currentTheme.accent.replace('text-', 'bg-')}`}></div>
                                   <div>
                                       <h3 className="text-2xl font-bold uppercase leading-none tracking-wide text-white">{cardData.name}</h3>
                                       <p className="text-[11px] text-gray-400 mt-1 font-medium">{cardData.title}</p>
                                   </div>
                               </div>
                           </div>
                           <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>
                           <ContactGrid accentColor={currentTheme.accent} />
                      </div>
                  </div>
              );
          case 'centered': return (
                  <div className={`${commonClasses} items-center justify-center text-center`}>
                       <LogoWidget className="w-16 h-16 mb-4" size="text-2xl" />
                       <h2 className={`text-3xl font-bold uppercase mb-1 ${currentTheme.accent}`}>{cardData.business}</h2>
                       <p className="opacity-80 text-xs mb-6 uppercase tracking-wider font-bold">{cardData.category}</p>
                       <div className="mb-4">
                           <h3 className="font-bold text-lg">{cardData.name}</h3>
                           <p className="text-xs opacity-70">{cardData.title}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] opacity-90 text-left w-full px-4">
                           <p className="truncate flex items-center gap-1 justify-end"><Phone className="w-3 h-3"/> {cardData.mobile}</p>
                           <p className="truncate flex items-center gap-1"><Mail className="w-3 h-3"/> {cardData.email}</p>
                           <p className="truncate flex items-center gap-1 justify-end col-span-2 text-center"><MapPin className="w-3 h-3"/> {cardData.address}</p>
                           <p className="truncate flex items-center gap-1 col-span-2 text-center justify-center"><Globe className="w-3 h-3"/> {cardData.website}</p>
                       </div>
                  </div>
              );
          case 'sidebar': return (
                  <div className={`${commonClasses} flex-row p-0`}>
                      <div className={`w-1/3 h-full bg-black/20 flex flex-col items-center justify-center p-4 text-center`}>
                          <div className={`w-20 h-20 rounded-full border-4 ${currentTheme.border} mb-3 shadow-lg overflow-hidden`}>
                             {cardData.logo ? <img src={cardData.logo} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{cardData.name.charAt(0)}</div>}
                          </div>
                          <h3 className="font-bold text-sm leading-tight">{cardData.name}</h3>
                          <p className={`text-[10px] ${currentTheme.accent}`}>{cardData.title}</p>
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-center relative">
                          <h2 className={`text-2xl font-bold uppercase mb-1 ${currentTheme.accent}`}>{cardData.business}</h2>
                          <p className="text-[10px] uppercase opacity-70 mb-6 tracking-wider font-bold border-b border-white/20 pb-2 inline-block">{cardData.category}</p>
                          <div className="space-y-2 text-[9px]">
                              <p className="flex items-center gap-2 truncate"><Phone className="w-3 h-3"/> {cardData.mobile}</p>
                              <p className="flex items-center gap-2 truncate"><Mail className="w-3 h-3"/> {cardData.email}</p>
                              <p className="flex items-center gap-2 truncate"><MapPin className="w-3 h-3"/> {cardData.address}</p>
                              <p className="flex items-center gap-2 truncate"><Globe className="w-3 h-3"/> {cardData.website}</p>
                          </div>
                      </div>
                  </div>
              );
          case 'minimal': return (
                  <div className={`${commonClasses} border-[6px] ${currentTheme.border}`}>
                      <div className="flex justify-between items-start">
                          <div>
                            <h2 className={`text-3xl font-bold tracking-tighter ${currentTheme.accent}`}>{cardData.business}</h2>
                            <p className="text-[10px] font-bold uppercase mt-1 tracking-widest">{cardData.category}</p>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-lg">{cardData.name}</p>
                              <p className="text-xs opacity-60 uppercase">{cardData.title}</p>
                          </div>
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-4 border-t-2 border-current opacity-80">
                         <div className="flex-1"><ContactGrid accentColor={currentTheme.accent} /></div>
                         <div className="ml-4"><LogoWidget className="w-12 h-12" size="text-xl"/></div>
                      </div>
                  </div>
               );
          case 'creative': return (
                    <div className={`${commonClasses}`}>
                        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 ${currentTheme.accent.replace('text-','bg-')}`}></div>
                        <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20 ${currentTheme.accent.replace('text-','bg-')}`}></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold italic">{cardData.business}</h2>
                                    <p className="text-xs uppercase tracking-widest mt-1 opacity-70 font-bold">{cardData.category}</p>
                                    <div className={`h-1 w-16 mt-3 ${currentTheme.accent.replace('text-','bg-')}`}></div>
                                </div>
                                <LogoWidget className="w-14 h-14" size="text-xl" />
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-[9px] space-y-1 opacity-90 flex-1">
                                     <p className="flex items-center gap-1"><Phone className="w-3 h-3"/> {cardData.mobile}</p>
                                     <p className="flex items-center gap-1 truncate"><Globe className="w-3 h-3"/> {cardData.website}</p>
                                     <p className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3"/> {cardData.address}</p>
                                </div>
                                <div className="text-right pl-4">
                                    <h3 className="font-bold text-xl">{cardData.name}</h3>
                                    <p className={`text-xs ${currentTheme.accent}`}>{cardData.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
          default: return (
                  <div className={`${commonClasses}`}>
                      <div className="flex justify-between items-start">
                          <div>
                              <h2 className={`text-2xl font-bold uppercase ${currentTheme.accent}`}>{cardData.business}</h2>
                              <p className="text-[10px] opacity-70 tracking-widest mt-1 uppercase font-bold">{cardData.category}</p>
                          </div>
                          <LogoWidget className="w-12 h-12" size="text-xl" />
                      </div>
                      <div className="mt-auto">
                          <div className="flex items-end justify-between mb-4">
                              <div className="flex items-end gap-4">
                                  <div className={`w-1 h-12 ${currentTheme.accent.replace('text-','bg-')}`}></div>
                                  <div>
                                      <h3 className="font-bold text-xl">{cardData.name}</h3>
                                      <p className="text-xs opacity-70 uppercase tracking-wider">{cardData.title}</p>
                                  </div>
                              </div>
                          </div>
                          <div className="border-t border-white/20 pt-3"><ContactGrid accentColor={currentTheme.accent} /></div>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        {activeTool !== 'menu' && (
          <button onClick={() => setActiveTool('menu')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
             {activeTool === 'menu' ? 'টুলস (Tools)' : 'স্মার্ট টুল'}
          </h2>
          <p className="text-slate-500 text-xs">
             {activeTool === 'menu' ? 'আপনার ব্যবসার জন্য প্রয়োজনীয় টুলস' : 'ফিরে যেতে ব্যাক বাটনে চাপ দিন'}
          </p>
        </div>
      </div>

      {activeTool === 'menu' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ToolCard id="bill" icon={Printer} title="ক্যাশ মেমো" desc="Receipt / Invoice তৈরি করুন" color="bg-slate-800" />
          <ToolCard id="card" icon={CreditCard} title="বিজনেস কার্ড" desc="২০+ প্রিমিয়াম কার্ড ডিজাইন" color="bg-indigo-600" />
          <ToolCard id="calc" icon={Layout} title="ক্যালকুলেটর" desc="দ্রুত হিসাব নিকাশ" color="bg-orange-500" />
        </div>
      )}

      {/* --- BUSINESS CARD MAKER --- */}
      {activeTool === 'card' && (
          <div className="flex flex-col xl:flex-row gap-6 h-full">
              {/* Left Column: Big Inputs (WIDER NOW: 65%) */}
              <div className="w-full xl:w-8/12 space-y-6 order-2 xl:order-1">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
                      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b pb-4">
                          <PenTool className="w-5 h-5 text-indigo-600"/> কার্ডের তথ্য পূরণ করুন
                      </h3>
                      
                      <div className="space-y-5">
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ব্যবসার নাম</label>
                             <input type="text" value={cardData.business} onChange={e => setCardData({...cardData, business: e.target.value})} className="w-full text-base font-medium bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" placeholder="Business Name"/>
                          </div>
                          
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ক্যাটাগরি / স্লোগান</label>
                             <input type="text" value={cardData.category} onChange={e => setCardData({...cardData, category: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" placeholder="e.g. IT Solutions"/>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">আপনার নাম</label>
                                 <input type="text" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" placeholder="Full Name"/>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">পদবী</label>
                                 <input type="text" value={cardData.title} onChange={e => setCardData({...cardData, title: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" placeholder="Owner"/>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">মোবাইল</label>
                                 <input type="text" value={cardData.mobile} onChange={e => setCardData({...cardData, mobile: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"/>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ইমেইল</label>
                                 <input type="text" value={cardData.email} onChange={e => setCardData({...cardData, email: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"/>
                              </div>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ওয়েবসাইট / পেজ লিংক</label>
                             <input type="text" value={cardData.website} onChange={e => setCardData({...cardData, website: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"/>
                          </div>
                          
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ঠিকানা</label>
                             <input type="text" value={cardData.address} onChange={e => setCardData({...cardData, address: e.target.value})} className="w-full text-base bg-slate-50 text-slate-900 border-2 border-slate-200 p-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"/>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right Column: Preview & Slideshow (SMALLER NOW: 35%) */}
              <div className="w-full xl:w-4/12 order-1 xl:order-2 space-y-6">
                  <div className="sticky top-6">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                          <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                             <Sparkles className="w-4 h-4 text-amber-500" />
                             প্রিভিউ ({CARD_THEMES.length} ডিজাইন)
                          </h4>
                          <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedThemeIndex(prev => (prev - 1 + CARD_THEMES.length) % CARD_THEMES.length)} className="p-1.5 hover:bg-slate-100 rounded-full">
                                  <ChevronLeft className="w-4 h-4 text-slate-600"/>
                              </button>
                              <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${isAutoPlaying ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {isAutoPlaying ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
                              </button>
                              <button onClick={() => setSelectedThemeIndex(prev => (prev + 1) % CARD_THEMES.length)} className="p-1.5 hover:bg-slate-100 rounded-full">
                                  <ChevronRight className="w-4 h-4 text-slate-600"/>
                              </button>
                          </div>
                      </div>
                      <div className="bg-slate-900/5 backdrop-blur-3xl p-4 rounded-3xl border-4 border-white shadow-2xl flex flex-col justify-center items-center min-h-[300px] relative overflow-hidden group">
                           <div className={`absolute inset-0 opacity-30 blur-3xl transition-colors duration-1000 ${currentTheme.bg}`}></div>
                           <div className="relative z-10 transform scale-[0.6] origin-center transition-all duration-500 hover:scale-[0.65]" id="card-preview" ref={cardRef}>
                              {renderCardContent()}
                           </div>
                           <div className="absolute bottom-4 z-20">
                               <button onClick={downloadCardImage} className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 transform hover:-translate-y-1 text-sm">
                                  <Download className="w-4 h-4" /> ডাউনলোড
                               </button>
                           </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
                          <div className="flex gap-2 pb-1">
                              {CARD_THEMES.map((t, idx) => (
                                  <button key={t.id} onClick={() => { setSelectedThemeIndex(idx); setIsAutoPlaying(false); }} className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden group ${selectedThemeIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105' : 'border-slate-100 opacity-60 hover:opacity-100'}`} title={t.name}>
                                      <div className={`w-full h-full ${t.bg}`}></div>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                          {selectedThemeIndex === idx && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg"></div>}
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- BILL MAKER (CASH MEMO STYLE) --- */}
      {activeTool === 'bill' && (
        <div className="flex flex-col xl:flex-row gap-8 animate-fade-in">
           {/* Editor - Updated for larger inputs and premium feel */}
           <div className="w-full xl:w-5/12 order-2 xl:order-1">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl h-fit">
                  <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center gap-2 border-b pb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <FileText className="w-5 h-5"/>
                      </div>
                      মেমো এডিটর
                  </h3>
                  
                  <div className="space-y-6">
                      {/* Top Row Inputs */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">কাস্টমারের নাম</label>
                          <div className="relative">
                              <UserIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                              <input 
                                  type="text" 
                                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base font-medium" 
                                  placeholder="Customer Name" 
                                  value={customerName} 
                                  onChange={e=>setCustomerName(e.target.value)} 
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">মেমো নম্বর (Auto)</label>
                              <div className="relative flex items-center">
                                  <input 
                                      type="text" 
                                      className="w-full pl-4 pr-10 py-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-slate-600 font-mono text-sm" 
                                      value={invoiceId} 
                                      readOnly 
                                  />
                                  <button onClick={regenerateInvoiceId} className="absolute right-2 p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="Generate New">
                                      <RefreshCw className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">তারিখ</label>
                              <div className="relative">
                                  <Calendar className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                  <input 
                                      type="date" 
                                      className="w-full pl-4 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm font-medium" 
                                      value={invoiceDate} 
                                      onChange={e=>setInvoiceDate(e.target.value)} 
                                  />
                              </div>
                          </div>
                      </div>
                      
                      {/* Products Section */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">পণ্যের তালিকা</span>
                              <button onClick={addBillItem} className="text-xs flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                  <Plus className="w-3 h-3" /> Add Item
                              </button>
                          </div>
                          
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                              {billItems.map((item, i) => (
                                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start animate-fade-in">
                                      <div className="col-span-6">
                                          <input 
                                              type="text" 
                                              className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" 
                                              placeholder="Item Name" 
                                              value={item.name} 
                                              onChange={e => updateBillItem(item.id, 'name', e.target.value)} 
                                              style={{color: 'black'}}
                                          />
                                      </div>
                                      <div className="col-span-2">
                                          <input 
                                              type="number" 
                                              className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm text-center focus:border-indigo-500 focus:outline-none" 
                                              placeholder="Qty" 
                                              value={item.qty} 
                                              onChange={e => updateBillItem(item.id, 'qty', Number(e.target.value))} 
                                              style={{color: 'black'}}
                                          />
                                      </div>
                                      <div className="col-span-3">
                                          <input 
                                              type="number" 
                                              className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm text-right focus:border-indigo-500 focus:outline-none" 
                                              placeholder="Price" 
                                              value={item.price} 
                                              onChange={e => updateBillItem(item.id, 'price', Number(e.target.value))} 
                                              style={{color: 'black'}}
                                          />
                                      </div>
                                      <div className="col-span-1 flex justify-center pt-2">
                                          <button onClick={() => removeBillItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Financial Inputs */}
                      <div className="grid grid-cols-3 gap-3">
                           <div>
                               <label className="text-[10px] font-bold text-slate-500 uppercase">Discount (৳)</label>
                               <div className="relative mt-1">
                                  <DollarSign className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                                  <input type="number" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" placeholder="0"/>
                               </div>
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-slate-500 uppercase">Tax/VAT (%)</label>
                               <div className="relative mt-1">
                                  <Percent className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                                  <input type="number" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" placeholder="0%"/>
                               </div>
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-slate-500 uppercase">Others (৳)</label>
                               <div className="relative mt-1">
                                  <Layers className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                                  <input type="number" value={otherCharges} onChange={e=>setOtherCharges(Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" placeholder="0"/>
                               </div>
                           </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                          <button onClick={downloadBillImage} className="flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-xl text-base font-bold hover:bg-slate-900 shadow-lg hover:shadow-xl transition-all active:scale-95">
                              <ImageIcon className="w-5 h-5" /> Save Image
                          </button>
                          <button onClick={downloadBillPDF} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl text-base font-bold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all active:scale-95">
                              <Printer className="w-5 h-5" /> Print / PDF
                          </button>
                      </div>
                  </div>
               </div>
           </div>

           {/* Preview (Receipt Style) - Premium Look */}
           <div className="flex-1 order-1 xl:order-2 bg-slate-100 p-8 rounded-3xl border-4 border-dashed border-slate-200 flex justify-center items-start overflow-auto min-h-[600px]">
               <div id="memo-preview" className="bg-white w-[380px] min-h-[500px] shadow-2xl p-0 text-slate-900 relative flex flex-col">
                   {/* Decorative Top */}
                   <div className="h-2 w-full bg-indigo-600"></div>
                   
                   <div className="p-8 pb-4">
                        {/* Header Section */}
                       <div className="flex justify-between items-start mb-6">
                           <div>
                               {cardData.logo ? (
                                   <img src={cardData.logo} alt="Logo" className="w-16 h-16 object-contain mb-2 rounded-lg" />
                               ) : (
                                   <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-bold text-xl mb-2 rounded-lg">{user.businessName.charAt(0)}</div>
                               )}
                               <h1 className="text-xl font-bold uppercase tracking-tight leading-none text-slate-800">{user.businessName}</h1>
                               <p className="text-[10px] text-slate-500 font-medium mt-1 max-w-[150px] leading-tight">{user.address}</p>
                               <p className="text-[10px] text-slate-500 font-medium">{user.mobile}</p>
                           </div>
                           <div className="text-right flex flex-col items-end">
                               <h2 className="text-2xl font-black text-slate-200 uppercase tracking-tighter leading-none mb-2">INVOICE</h2>
                               <div className="bg-white p-1 rounded border border-slate-100 shadow-sm">
                                   {memoQrCode && <img src={memoQrCode} className="w-16 h-16 opacity-90" alt="QR" />}
                               </div>
                               <p className="text-[10px] font-mono text-slate-400 mt-1">{invoiceId}</p>
                           </div>
                       </div>

                       {/* Customer Info Box */}
                       <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-6 flex justify-between items-center">
                           <div>
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Billed To</p>
                               <p className="font-bold text-sm text-slate-800">{customerName || 'Walking Customer'}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Date</p>
                               <p className="font-bold text-sm text-slate-800">{invoiceDate}</p>
                           </div>
                       </div>

                       {/* Table */}
                       <table className="w-full text-xs mb-6">
                           <thead>
                               <tr className="border-b-2 border-slate-100">
                                   <th className="text-left py-2 text-slate-500 uppercase font-bold tracking-wider text-[10px]">Item</th>
                                   <th className="text-center py-2 text-slate-500 uppercase font-bold tracking-wider text-[10px]">Qty</th>
                                   <th className="text-right py-2 text-slate-500 uppercase font-bold tracking-wider text-[10px]">Price</th>
                                   <th className="text-right py-2 text-slate-500 uppercase font-bold tracking-wider text-[10px]">Total</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-dashed divide-slate-100 font-medium text-slate-700">
                               {billItems.map((item, i) => (
                                   <tr key={i}>
                                       <td className="py-3">{item.name || 'Item Name'}</td>
                                       <td className="text-center py-3">{item.qty}</td>
                                       <td className="text-right py-3">{item.price}</td>
                                       <td className="text-right py-3 text-slate-900 font-bold">{(item.price * item.qty).toLocaleString()}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>

                       {/* Calculation Breakdown */}
                       <div className="border-t border-slate-100 pt-3 space-y-1 mb-6">
                           <div className="flex justify-between text-[10px] text-slate-500">
                               <span>Sub Total</span>
                               <span>৳ {subTotal.toLocaleString()}</span>
                           </div>
                           {discount > 0 && (
                               <div className="flex justify-between text-[10px] text-slate-500">
                                   <span>Discount</span>
                                   <span className="text-rose-500">- ৳ {discount.toLocaleString()}</span>
                               </div>
                           )}
                           {taxRate > 0 && (
                               <div className="flex justify-between text-[10px] text-slate-500">
                                   <span>Tax ({taxRate}%)</span>
                                   <span>+ ৳ {taxAmount.toLocaleString()}</span>
                               </div>
                           )}
                           {otherCharges > 0 && (
                               <div className="flex justify-between text-[10px] text-slate-500">
                                   <span>Others</span>
                                   <span>+ ৳ {otherCharges.toLocaleString()}</span>
                               </div>
                           )}
                       </div>
                    </div>

                   {/* Totals Section */}
                   <div className="mt-auto bg-slate-50 p-6 border-t border-slate-100 relative">
                       <div className="flex justify-between items-center mb-6">
                           <span className="font-bold text-slate-500 text-sm">TOTAL AMOUNT</span>
                           <span className="font-black text-2xl text-indigo-600">৳ {grandTotal.toLocaleString()}</span>
                       </div>

                       <div className="flex justify-between items-end mt-12 relative">
                           <div className="text-center relative">
                               {/* APPROVED SEAL */}
                               <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-emerald-600/20 rounded-full flex items-center justify-center -rotate-12 pointer-events-none select-none">
                                   <span className="text-emerald-600/20 font-black text-xl uppercase">APPROVED</span>
                               </div>
                               <div className="h-px w-24 bg-slate-300 mb-1 relative z-10"></div>
                               <p className="text-[9px] text-slate-400 font-bold uppercase relative z-10">Authorized Sign</p>
                           </div>
                           <div className="text-[9px] text-slate-400 text-right max-w-[150px]">
                               <p className="font-bold text-slate-500">Thank you for your business!</p>
                               <p>Goods once sold cannot be returned.</p>
                           </div>
                       </div>
                   </div>
                   
                   {/* Branding Footer */}
                   <div className="bg-slate-900 text-white text-[8px] text-center py-2 font-medium tracking-widest opacity-80">
                       POWERED BY BIZMONEY APP
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* --- CALCULATOR --- */}
      {activeTool === 'calc' && (
          <div className="max-w-xs mx-auto bg-slate-900 p-6 rounded-2xl shadow-2xl">
              <div className="bg-slate-800 rounded-xl p-4 mb-4 text-right h-16 flex items-center justify-end">
                  <span className="text-3xl font-bold text-white font-mono">{calcInput || '0'}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                  {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
                      <button key={btn} onClick={() => handleCalc(btn)} className={`p-4 rounded-xl font-bold text-xl transition-all active:scale-95 ${btn === 'C' ? 'bg-rose-600 text-white' : btn === '=' ? 'bg-emerald-600 text-white' : ['/','*','-','+'].includes(btn) ? 'bg-slate-700 text-emerald-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                          {btn}
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};