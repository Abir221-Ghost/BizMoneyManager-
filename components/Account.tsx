import React, { useRef, useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { User as UserIcon, Shield, Phone, Store, Briefcase, Download, Upload, AlertCircle, CheckCircle, Mail, MapPin, Globe, Camera, Save, RefreshCw } from 'lucide-react';

interface AccountProps {
    user: User;
    onUserUpdate?: (user: User) => void;
}

export const Account: React.FC<AccountProps> = ({ user, onUserUpdate }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const restoreInputRef = useRef<HTMLInputElement>(null);
    const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
    const [editMode, setEditMode] = useState(false);
    
    // Edit Form State
    const [formData, setFormData] = useState({
        name: user.name,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        mobile: user.mobile,
        email: user.email || '',
        address: user.address || '',
        website: user.website || '',
        profileImage: user.profileImage || ''
    });

    const handleBackup = () => {
        const json = StorageService.exportData(user.id);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BizMoney_Backup_${user.businessName.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setMsg({ type: 'success', text: 'ব্যাকআপ ফাইল ডাউনলোড হয়েছে। এটি সংরক্ষণ করে রাখুন।' });
        setTimeout(() => setMsg(null), 5000);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const success = StorageService.importData(user.id, json);
                if (success) {
                    setMsg({ type: 'success', text: 'ডেটা রিস্টোর সফল হয়েছে! পেজ রিফ্রেশ হচ্ছে...' });
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    setMsg({ type: 'error', text: 'ভুল ব্যাকআপ ফাইল।' });
                }
            } catch (err) {
                setMsg({ type: 'error', text: 'ফাইল রিড করা যায়নি।' });
            }
        };
        reader.readAsText(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 100000) { // Limit 100kb for base64
            setMsg({ type: 'error', text: 'ছবির সাইজ ১০০KB এর কম হতে হবে।' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = () => {
        const updatedUser: User = {
            ...user,
            ...formData
        };
        StorageService.updateUser(updatedUser);
        if (onUserUpdate) onUserUpdate(updatedUser);
        setEditMode(false);
        setMsg({ type: 'success', text: 'প্রোফাইল আপডেট হয়েছে।' });
        setTimeout(() => setMsg(null), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">অ্যাকাউন্ট ও সেটিংস</h2>
                <button 
                    onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${editMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                    {editMode ? <><Save className="w-4 h-4"/> সেভ করুন</> : 'প্রোফাইল এডিট'}
                </button>
            </div>
            
            {msg && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    {msg.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-slate-700 overflow-hidden border-4 border-slate-700">
                            {formData.profileImage ? (
                                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                formData.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {editMode && (
                            <button 
                                onClick={() => imageInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full text-white hover:bg-emerald-600 shadow-lg"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                        {editMode ? (
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-full font-bold text-xl mb-2 focus:outline-none focus:border-emerald-500"
                            />
                        ) : (
                            <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                        )}
                        <p className="text-emerald-400 font-medium">
                            {editMode ? (
                                <input 
                                    type="text" 
                                    value={formData.businessName} 
                                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                                    className="bg-slate-800 text-emerald-400 border border-slate-600 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-emerald-500"
                                />
                            ) : user.businessName}
                        </p>
                    </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Store className="w-5 h-5 text-slate-600" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">ব্যবসার ধরন</p>
                            {editMode ? (
                                <input type="text" value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} className="w-full bg-white border rounded px-2 py-1 text-sm mt-1" />
                            ) : <p className="font-medium text-slate-800">{user.businessCategory}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Phone className="w-5 h-5 text-slate-600" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">মোবাইল</p>
                            <p className="font-medium text-slate-800">{user.mobile}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Mail className="w-5 h-5 text-slate-600" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">ইমেইল</p>
                            {editMode ? (
                                <input type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border rounded px-2 py-1 text-sm mt-1" placeholder="example@mail.com" />
                            ) : <p className="font-medium text-slate-800">{user.email || 'দেওয়া হয়নি'}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><MapPin className="w-5 h-5 text-slate-600" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">ঠিকানা</p>
                            {editMode ? (
                                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white border rounded px-2 py-1 text-sm mt-1" placeholder="আপনার ব্যবসার ঠিকানা" />
                            ) : <p className="font-medium text-slate-800">{user.address || 'দেওয়া হয়নি'}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg md:col-span-2">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Globe className="w-5 h-5 text-slate-600" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">ওয়েবসাইট / ফেসবুক পেজ</p>
                            {editMode ? (
                                <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-white border rounded px-2 py-1 text-sm mt-1" placeholder="www.yoursite.com" />
                            ) : <p className="font-medium text-slate-800">{user.website || 'দেওয়া হয়নি'}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    ডেটা সেভ এবং ব্যাকআপ (Free)
                </h3>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 text-sm text-amber-800">
                    <p className="font-bold flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4"/> সাবধানতা:</p>
                    যেহেতু এটি একটি অফলাইন অ্যাপ, আপনার সব তথ্য ব্রাউজারে জমা থাকে। ব্রাউজার ক্লিয়ার করলে বা ফোন পাল্টালে তথ্য হারিয়ে যেতে পারে। 
                    তাই নিয়মিত <strong>'ব্যাকআপ ডাউনলোড'</strong> করে নিজের কাছে ফাইলটি সেভ রাখুন।
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleBackup}
                        className="flex flex-col items-center justify-center gap-2 p-6 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-center group"
                    >
                        <Download className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span>ব্যাকআপ ডাউনলোড করুন</span>
                        <span className="text-[10px] opacity-70 font-normal">(ডাটা সেভ রাখতে এটি ক্লিক করুন)</span>
                    </button>

                    <button 
                        onClick={() => restoreInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 p-6 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-center group"
                    >
                        <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span>ব্যাকআপ আপলোড করুন</span>
                        <span className="text-[10px] opacity-70 font-normal">(পুরানো ডাটা ফিরিয়ে আনতে)</span>
                        <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestore} />
                    </button>
                </div>
            </div>
            
            <div className="text-center text-sm text-slate-400">
                <p>বিজনেস মানি ম্যানেজার বট v2.0</p>
                <p>নিরাপদ ও সহজ হিসাব নিকাশ।</p>
            </div>
        </div>
    );
};