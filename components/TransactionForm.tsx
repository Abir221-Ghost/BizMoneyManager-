import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { X, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';

interface TransactionFormProps {
  type: TransactionType;
  userId: string;
  businessCategory: string;
  editData?: Transaction; // If provided, we are editing
  onSubmit: (amount: number, category: string, note: string, isDue: boolean, partyName: string, dueDate: string) => void;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, userId, businessCategory, editData, onSubmit, onClose }) => {
  const [amount, setAmount] = useState(editData ? editData.amount.toString() : '');
  const [category, setCategory] = useState(editData ? editData.category : '');
  const [note, setNote] = useState(editData ? editData.note || '' : '');
  const [isDue, setIsDue] = useState(editData ? editData.isDue : false);
  const [partyName, setPartyName] = useState(editData ? editData.partyName || '' : '');
  const [dueDate, setDueDate] = useState(editData ? editData.dueDate || '' : '');
  const [error, setError] = useState('');
  
  const [partySuggestions, setPartySuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load existing parties for autocomplete
    setPartySuggestions(StorageService.getParties(userId));
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('❌ টাকার পরিমাণ সঠিক নয়।');
      return;
    }
    if (!category.trim()) {
      setError('❌ বিবরণ দেওয়া আবশ্যক।');
      return;
    }
    if (isDue && !partyName.trim()) {
        setError(isIncome ? '❌ কাস্টমারের নাম দিন।' : '❌ সাপ্লায়ায়ের নাম দিন।');
        return;
    }

    onSubmit(numAmount, category, note, isDue, partyName, dueDate);
  };

  const isIncome = type === TransactionType.INCOME;
  const themeColor = isIncome ? 'emerald' : 'rose';

  // Dynamic Placeholders
  let categoryPlaceholder = "";
  if (isIncome) {
      if (businessCategory.includes('Pharmacy')) categoryPlaceholder = "যেমন: নাপা বিক্রি, ইনসুলিন...";
      else if (businessCategory.includes('Grocery')) categoryPlaceholder = "যেমন: চাল বিক্রি, তেল বিক্রি...";
      else categoryPlaceholder = "যেমন: পণ্য বিক্রি, সার্ভিস চার্জ...";
  } else {
       categoryPlaceholder = "যেমন: ঘর ভাড়া, বিদ্যুৎ বিল, মাল ক্রয়...";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className={`p-4 bg-${themeColor}-600 flex justify-between items-center text-white`}>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {editData ? '✏️ এডিট করুন' : (isIncome ? '💰 আয় যোগ করুন' : '💸 খরচ যোগ করুন')}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {/* Baki Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="w-5 h-5" />
                <span>এটা কি বাকি?</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isDue} onChange={(e) => setIsDue(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              পরিমাণ ({isIncome ? 'জমা' : 'ব্যয়'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold">৳</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                    setError('');
                    setAmount(e.target.value);
                }}
                className={`w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {isDue && (
              <div className="animate-fade-in space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {isIncome ? 'কাস্টমারের নাম' : 'যার কাছে বাকি'}
                    </label>
                    <input
                      list="party-suggestions"
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 bg-yellow-50`}
                      placeholder="নাম সিলেক্ট করুন বা লিখুন..."
                    />
                    <datalist id="party-suggestions">
                        {partySuggestions.map((name, idx) => (
                            <option key={idx} value={name} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> পরিশোধের তারিখ (Due Date)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isIncome ? 'আয়ের উৎস' : 'খরচের বিবরণ'}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
              placeholder={categoryPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              নোট (অপশনাল)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
              placeholder="বিস্তারিত..."
              rows={2}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              <CheckCircle className="w-5 h-5" />
              {editData ? 'আপডেট করুন' : (isDue ? 'বাকি সংরক্ষণ করুন' : 'সেভ করুন')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};