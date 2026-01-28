import React, { useMemo, useState } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC<{ user: User }> = ({ user }) => {
  const [date, setDate] = useState(new Date());
  const transactions = useMemo(() => StorageService.getTransactions(user.id), [user.id]);

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDay = monthStart.getDay(); // 0 = Sun

  const getDayData = (day: number) => {
    const dStr = new Date(date.getFullYear(), date.getMonth(), day + 1).toISOString().slice(0, 10); // +1 because slice handles UTC issue naively
    // Actually simplified matching:
    const checkDate = new Date(date.getFullYear(), date.getMonth(), day);
    // Format YYYY-MM-DD manually to avoid timezone bugs
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    
    const txs = transactions.filter(t => t.date.startsWith(iso));
    const inc = txs.filter(t => t.type === TransactionType.INCOME).reduce((a,c)=>a+c.amount,0);
    const exp = txs.filter(t => t.type === TransactionType.EXPENSE).reduce((a,c)=>a+c.amount,0);
    return { inc, exp };
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">ব্যবসায়িক ক্যালেন্ডার</h2>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200">
                <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}><ChevronLeft className="w-5 h-5"/></button>
                <span className="font-bold text-slate-700 min-w-[120px] text-center">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}><ChevronRight className="w-5 h-5"/></button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-7 mb-2 text-center text-slate-400 font-bold text-xs uppercase">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const { inc, exp } = getDayData(day);
                    const hasData = inc > 0 || exp > 0;
                    return (
                        <div key={day} className={`h-24 border rounded-lg p-2 flex flex-col justify-between transition-colors hover:border-indigo-300 ${hasData ? 'bg-slate-50' : ''}`}>
                            <span className="text-sm font-bold text-slate-700">{day}</span>
                            {hasData && (
                                <div className="text-[10px] space-y-1">
                                    {inc > 0 && <div className="text-emerald-600 font-bold bg-emerald-50 rounded px-1">+ {inc}</div>}
                                    {exp > 0 && <div className="text-rose-600 font-bold bg-rose-50 rounded px-1">- {exp}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};