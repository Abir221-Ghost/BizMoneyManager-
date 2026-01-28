import React, { useState, useEffect, useMemo } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { Search, Trash2, Edit2, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

interface HistoryProps {
  user: User;
}

export const History: React.FC<HistoryProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    const txs = StorageService.getTransactions(user.id);
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত এই রেকর্ডটি ডিলিট করতে চান?')) {
      StorageService.deleteTransaction(user.id, id);
      loadData();
    }
  };

  const handleEdit = (tx: Transaction) => {
      setEditingTx(tx);
  };

  const handleUpdate = (amount: number, category: string, note: string, isDue: boolean, partyName: string, dueDate: string) => {
      if (editingTx) {
          const updatedTx: Transaction = {
              ...editingTx,
              amount,
              category,
              note,
              isDue,
              partyName,
              dueDate
          };
          StorageService.updateTransaction(updatedTx);
          setEditingTx(null);
          loadData();
      }
  };

  const handleMarkSettled = (tx: Transaction) => {
      if(window.confirm(`আপনি কি নিশ্চিত যে "${tx.partyName}" টাকা পরিশোধ করেছেন?`)) {
          const updatedTx = { ...tx, isSettled: true };
          StorageService.updateTransaction(updatedTx);
          loadData();
      }
  };

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase()) || 
                            (t.note && t.note.toLowerCase().includes(search.toLowerCase())) ||
                            (t.partyName && t.partyName.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">সকল লেনদেনের তালিকা</h2>
          <p className="text-slate-500">মোট {filteredData.length} টি রেকর্ড পাওয়া গেছে</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="খুঁজুন (বিবরণ, নাম...)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">সকল</option>
            <option value="INCOME">আয়</option>
            <option value="EXPENSE">ব্যয়</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">বিবরণ</th>
                <th className="px-6 py-4">ধরন</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">নোট/পার্টি</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    কোনো তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredData.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(t.date).toLocaleDateString()}
                        </div>
                        {t.isDue && !t.isSettled && t.dueDate && (
                            <div className="text-[10px] text-orange-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due: {new Date(t.dueDate).toLocaleDateString()}
                            </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{t.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {t.type === TransactionType.INCOME ? (
                          <span className="inline-flex items-center w-fit gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <ArrowUpCircle className="w-3 h-3" /> আয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center w-fit gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            <ArrowDownCircle className="w-3 h-3" /> ব্যয়
                          </span>
                        )}
                        {t.isDue && (
                            <span className={`inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${t.isSettled ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                {t.isSettled ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                {t.isSettled ? 'পরিশোধিত' : 'বাকি'}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {t.partyName && <span className="font-semibold text-slate-700 block">{t.partyName}</span>}
                        {t.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.isDue && !t.isSettled && (
                            <button 
                                onClick={() => handleMarkSettled(t)}
                                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded text-xs font-bold transition-colors"
                            >
                                Mark Paid
                            </button>
                        )}
                        <button 
                            onClick={() => handleEdit(t)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                            title="এডিট করুন"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(t.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-full"
                            title="মুছে ফেলুন"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTx && (
          <TransactionForm 
            userId={user.id}
            type={editingTx.type}
            businessCategory={user.businessCategory}
            editData={editingTx}
            onClose={() => setEditingTx(null)}
            onSubmit={handleUpdate}
          />
      )}
    </div>
  );
};