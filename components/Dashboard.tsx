import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, Goal } from '../types';
import { StorageService } from '../services/storage';
import { TransactionForm } from './TransactionForm';
import { TrendingUp, DollarSign, Activity, AlertOctagon, Target, Clock as ClockIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [celebrationGoal, setCelebrationGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user.id]);

  const loadData = () => {
    const txs = StorageService.getTransactions(user.id);
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp));
    
    // Load Goals
    const goals = StorageService.getGoals(user.id);
    setActiveGoals(goals.filter(g => g.status === 'ACTIVE'));
    
    const justCompleted = goals.find(g => g.currentAmount >= g.targetAmount && g.status === 'ACTIVE');
    if (justCompleted) {
        setCelebrationGoal(justCompleted);
        StorageService.updateGoal({...justCompleted, status: 'COMPLETED'});
    }
  };

  const handleAddTransaction = (amount: number, category: string, note: string, isDue: boolean, partyName: string, dueDate: string, type: TransactionType) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      amount,
      type,
      category,
      note,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      isDue,
      partyName,
      dueDate,
      isSettled: false
    };
    StorageService.addTransaction(newTx);
    loadData();
    setShowIncomeForm(false);
    setShowExpenseForm(false);
    setFeedback('✅ তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
    setTimeout(() => setFeedback(null), 3000);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => t.date.startsWith(today) && !t.isDue);
  const todayIncome = todayTxs.filter(t => t.type === TransactionType.INCOME).reduce((acc, c) => acc + c.amount, 0);
  const todayExpense = todayTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, c) => acc + c.amount, 0);
  const todayProfit = todayIncome - todayExpense;

  const totalDueReceivable = transactions.filter(t => t.type === TransactionType.INCOME && t.isDue && !t.isSettled).reduce((acc, c) => acc + c.amount, 0);
  const totalDuePayable = transactions.filter(t => t.type === TransactionType.EXPENSE && t.isDue && !t.isSettled).reduce((acc, c) => acc + c.amount, 0);
  const totalBalance = StorageService.calculateBalance(user.id);

  const chartData = transactions.slice(0, 7).reverse().map(t => ({
    name: t.category,
    amount: t.type === TransactionType.INCOME ? t.amount : -t.amount,
    type: t.type
  }));

  const bnDate = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 relative">
      {/* Celebration Modal */}
      {celebrationGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white -z-10"></div>
                  <div className="absolute top-0 left-10 w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                  <div className="absolute top-5 right-20 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute top-0 right-5 w-2 h-2 bg-green-500 rounded-full animate-bounce delay-700"></div>
                  
                  <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200">
                      <TrophyIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 mb-2">অভিনন্দন!</h3>
                  <p className="text-slate-600 mb-6">
                      আপনি আপনার লক্ষ্য <br/> 
                      <span className="font-bold text-indigo-600 text-lg">"{celebrationGoal.title}"</span> <br/>
                      সফলভাবে পূরণ করেছেন!
                  </p>
                  
                  <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                      <p className="text-xs text-indigo-500 font-bold uppercase">অর্জিত পরিমাণ</p>
                      <p className="text-2xl font-black text-indigo-700">৳{celebrationGoal.currentAmount.toLocaleString()}</p>
                  </div>

                  <button 
                      onClick={() => setCelebrationGoal(null)}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                      নতুন লক্ষ্য ঠিক করুন
                  </button>
              </div>
          </div>
      )}

      {/* Header with Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">ড্যাশবোর্ড</h2>
          <p className="text-slate-300 opacity-80">{bnDate}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <ClockIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-xl font-bold">{time.toLocaleTimeString('en-US')}</span>
        </div>
      </div>
      
      {feedback && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium text-center">
            {feedback}
          </div>
      )}

      {/* Goals Summary */}
      {activeGoals.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600"/> সক্রিয় লক্ষ্য (Active Goals)
                  </h3>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{activeGoals.length} টি</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeGoals.slice(0,3).map(goal => (
                      <div key={goal.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                              <span>{goal.title}</span>
                              <span>{Math.round((goal.currentAmount/goal.targetAmount)*100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{width: `${(goal.currentAmount/goal.targetAmount)*100}%`}}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">আজকের আয় (নগদ)</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">৳{todayIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">আজকের ব্যয় (নগদ)</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">৳{todayExpense.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">আজকের লাভ/ক্ষতি</p>
          </div>
          <p className={`text-2xl font-bold ${todayProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {todayProfit >= 0 ? '+' : ''}৳{todayProfit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 ring-2 ring-indigo-50 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">বর্তমান ক্যাশ ব্যালেন্স</p>
          </div>
          <p className="text-2xl font-bold text-indigo-900">৳{totalBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 flex items-center justify-between">
              <div>
                  <p className="text-yellow-700 font-medium mb-1 flex items-center gap-2"><AlertOctagon className="w-4 h-4"/> মোট পাওনা (বাকি)</p>
                  <p className="text-2xl font-bold text-yellow-800">৳{totalDueReceivable.toLocaleString()}</p>
              </div>
          </div>
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 flex items-center justify-between">
              <div>
                  <p className="text-orange-700 font-medium mb-1 flex items-center gap-2"><AlertOctagon className="w-4 h-4"/> মোট দেনা (বাকি)</p>
                  <p className="text-2xl font-bold text-orange-800">৳{totalDuePayable.toLocaleString()}</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setShowIncomeForm(true)} className="flex items-center justify-center gap-3 p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95">
           <span className="font-semibold text-lg">আয় যোগ করুন (Income)</span>
        </button>
        <button onClick={() => setShowExpenseForm(true)} className="flex items-center justify-center gap-3 p-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-md active:scale-95">
           <span className="font-semibold text-lg">ব্যয় যোগ করুন (Expense)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">সাম্প্রতিক লেনদেন</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {transactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.category.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                          {t.category}
                          {t.isDue && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${t.isSettled ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-800'}`}>{t.isSettled ? 'Paid' : 'Due'}</span>}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} {t.partyName && ` • ${t.partyName}`}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}৳{t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-4">লেনদেনের গ্রাফ</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="amount">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === TransactionType.INCOME ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showIncomeForm && <TransactionForm userId={user.id} type={TransactionType.INCOME} businessCategory={user.businessCategory} onSubmit={(a, c, n, d, p, date) => handleAddTransaction(a, c, n, d, p, date, TransactionType.INCOME)} onClose={() => setShowIncomeForm(false)} />}
      {showExpenseForm && <TransactionForm userId={user.id} type={TransactionType.EXPENSE} businessCategory={user.businessCategory} onSubmit={(a, c, n, d, p, date) => handleAddTransaction(a, c, n, d, p, date, TransactionType.EXPENSE)} onClose={() => setShowExpenseForm(false)} />}
    </div>
  );
};

// Trophy Icon for modal
const TrophyIcon = ({className}:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.816a.75.75 0 00-.723-.515 11.209 11.209 0 01-7.875-3.08zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
);