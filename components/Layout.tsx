import React, { useState } from 'react';
import { LogOut, PieChart, LayoutDashboard, Wallet, User as UserIcon, History, Users, Briefcase, Package, UserCheck, Moon, Sun, Target } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  setView: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, setView }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  const NavItem = ({ view, icon: Icon, label, isPremium, isMobile }: { view: string, icon: any, label: string, isPremium?: boolean, isMobile?: boolean }) => {
    const isActive = currentView === view;
    
    if (isMobile) {
        return (
            <button 
                onClick={() => setView(view)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-emerald-100' : 'bg-transparent'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[10px] font-medium mt-1">{label}</span>
            </button>
        );
    }

    return (
        <button 
        onClick={() => setView(view)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all w-full text-left font-medium relative group ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-slate-800 text-slate-300'}`}
        >
        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : 'group-hover:text-emerald-400'}`} />
        <span className="text-sm">{label}</span>
        {isPremium && (
            <span className="absolute right-2 top-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
        )}
        </button>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'} flex flex-col md:flex-row font-sans`}>
      {/* DESKTOP SIDEBAR */}
      <nav className="hidden md:flex bg-slate-900 text-white w-64 flex-shrink-0 flex-col justify-between h-screen sticky top-0 z-30 shadow-xl overflow-y-auto">
        <div>
          <div className="p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
            <h1 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
              </div>
              BizMoney
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider pl-1">{user.businessName || 'Business Manager'}</p>
          </div>
          
          <div className="flex flex-col p-4 gap-1">
            <p className="px-4 text-xs font-bold text-slate-600 uppercase mt-2 mb-2">General</p>
            <NavItem view="dashboard" icon={LayoutDashboard} label="ড্যাশবোর্ড" />
            <NavItem view="history" icon={History} label="লেনদেন" />
            <NavItem view="parties" icon={Users} label="বাকি খাতা" />
            <NavItem view="goals" icon={Target} label="লক্ষ্য (Goals)" />
            
            <p className="px-4 text-xs font-bold text-slate-600 uppercase mt-4 mb-2">Management</p>
            <NavItem view="inventory" icon={Package} label="স্টক / ইনভেন্টরি" isPremium />
            <NavItem view="staff" icon={UserCheck} label="স্টাফ / বেতন" isPremium />
            <NavItem view="reports" icon={PieChart} label="রিপোর্টস" />
            
            <p className="px-4 text-xs font-bold text-slate-600 uppercase mt-4 mb-2">Tools</p>
            <NavItem view="tools" icon={Briefcase} label="টুলস & মেমো" isPremium />
            <NavItem view="account" icon={UserIcon} label="সেটিংস" />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
             <span className="text-xs text-slate-500 font-bold uppercase">Theme</span>
             <button onClick={toggleTheme} className="p-2 bg-slate-800 rounded-full text-yellow-400 hover:bg-slate-700 transition-colors">
                 {darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
             </button>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600/90 hover:shadow-lg text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            লগআউট
          </button>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="font-bold text-slate-800 text-lg leading-none">BizMoney</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase truncate max-w-[150px]">{user.businessName}</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <div onClick={() => setView('account')} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                {user.name.charAt(0).toUpperCase()}
             </div>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen bg-slate-50 relative scroll-smooth">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-5 gap-1 p-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="হোম" isMobile />
            <NavItem view="parties" icon={Users} label="বাকি" isMobile />
            <div className="flex justify-center -mt-8">
                <button onClick={() => setView('goals')} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 transition-transform active:scale-95 ${currentView === 'goals' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
                    <Target className="w-6 h-6" />
                </button>
            </div>
            <NavItem view="inventory" icon={Package} label="স্টক" isMobile />
            <NavItem view="account" icon={UserIcon} label="মেনু" isMobile />
        </div>
      </nav>
    </div>
  );
};