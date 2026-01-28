import React, { useState, useEffect, useMemo } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { Search, UserCircle, ArrowRightCircle, Phone, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface PartiesProps {
  user: User;
}

interface PartySummary {
  name: string;
  totalReceivable: number; // I will get (Due Income)
  totalPayable: number;    // I will give (Due Expense)
  netBalance: number;      // Positive = I get, Negative = I give
  lastTransactionDate: string;
}

export const Parties: React.FC<PartiesProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const txs = StorageService.getTransactions(user.id);
    setTransactions(txs);
  }, [user.id]);

  const partyList = useMemo(() => {
    const parties: Record<string, PartySummary> = {};

    transactions.forEach(t => {
      // Only consider transactions that have a party name AND are marked as Due
      // OR even if not due, we might want to track history, but for "Khata" usually we track dues.
      // Let's track ALL transactions for anyone who has a name, but highlight Dues.
      if (!t.partyName) return;

      const name = t.partyName.trim();
      if (!parties[name]) {
        parties[name] = {
          name,
          totalReceivable: 0,
          totalPayable: 0,
          netBalance: 0,
          lastTransactionDate: t.date
        };
      }

      if (t.isDue) {
        if (t.type === TransactionType.INCOME) {
          parties[name].totalReceivable += t.amount;
        } else {
          parties[name].totalPayable += t.amount;
        }
      }

      // Update date if newer
      if (new Date(t.date) > new Date(parties[name].lastTransactionDate)) {
        parties[name].lastTransactionDate = t.date;
      }
    });

    // Calculate Net Balance
    Object.values(parties).forEach(p => {
        p.netBalance = p.totalReceivable - p.totalPayable;
    });

    return Object.values(parties).sort((a, b) => new Date(b.lastTransactionDate).getTime() - new Date(a.lastTransactionDate).getTime());
  }, [transactions]);

  const filteredParties = partyList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">বাকি খাতা (Party Ledger)</h2>
          <p className="text-slate-500">কাস্টমার ও সাপ্লায়ারদের হিসাব তালিকা</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="নাম দিয়ে খুঁজুন..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.length === 0 ? (
           <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
             <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
             <p>কোনো পার্টির তথ্য পাওয়া যায়নি।</p>
             <p className="text-xs mt-1">লেনদেন যোগ করার সময় 'বাকি' সিলেক্ট করে নাম লিখুন।</p>
           </div>
        ) : (
          filteredParties.map((party, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
               {/* Status Indicator Stripe */}
               <div className={`absolute top-0 left-0 w-1 h-full ${party.netBalance > 0 ? 'bg-emerald-500' : party.netBalance < 0 ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
               
               <div className="flex justify-between items-start mb-4 pl-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                     {party.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 truncate max-w-[120px]" title={party.name}>{party.name}</h3>
                     <p className="text-[10px] text-slate-400">Last: {new Date(party.lastTransactionDate).toLocaleDateString()}</p>
                   </div>
                 </div>
                 {/* Action (Future feature: Call) */}
                 <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="কল করুন (Coming Soon)">
                    <Phone className="w-4 h-4" />
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-2 pl-2 text-sm">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-500" />পাবো (Receivable)
                    </p>
                    <p className="font-bold text-emerald-600">৳{party.totalReceivable.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                         <ArrowUpRight className="w-3 h-3 text-rose-500" /> দেবো (Payable)
                    </p>
                    <p className="font-bold text-rose-600">৳{party.totalPayable.toLocaleString()}</p>
                  </div>
               </div>
               
               <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center pl-2">
                   <span className="text-xs font-medium text-slate-500">নিট ব্যালেন্স:</span>
                   <span className={`font-bold ${party.netBalance > 0 ? 'text-emerald-700' : party.netBalance < 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                       {party.netBalance > 0 ? 'পাবো ৳' : party.netBalance < 0 ? 'দেবো ৳' : '৳'}{Math.abs(party.netBalance).toLocaleString()}
                   </span>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};