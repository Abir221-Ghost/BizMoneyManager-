import React, { useState, useEffect } from 'react';
import { User, Goal } from '../types';
import { StorageService } from '../services/storage';
import { Target, Plus, Trash2, Trophy, Coins, CheckCircle2 } from 'lucide-react';

interface GoalManagerProps {
  user: User;
}

export const GoalManager: React.FC<GoalManagerProps> = ({ user }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', amount: '' });
  
  // State for updating a specific goal amount
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, [user.id]);

  const loadGoals = () => {
    setGoals(StorageService.getGoals(user.id));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.amount) return;

    const goal: Goal = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: newGoal.title,
      targetAmount: Number(newGoal.amount),
      currentAmount: 0,
      status: 'ACTIVE'
    };
    StorageService.addGoal(goal);
    setNewGoal({ title: '', amount: '' });
    setIsAdding(false);
    loadGoals();
  };

  const handleDelete = (id: string) => {
    if (confirm('এই লক্ষ্যটি মুছে ফেলতে চান?')) {
      StorageService.deleteGoal(user.id, id);
      loadGoals();
    }
  };

  const handleAddProgress = (goal: Goal) => {
    if (!addAmount) return;
    const amountToAdd = Number(addAmount);
    if (amountToAdd <= 0) return;

    const updatedGoal: Goal = {
        ...goal,
        currentAmount: goal.currentAmount + amountToAdd,
        status: (goal.currentAmount + amountToAdd) >= goal.targetAmount ? 'COMPLETED' : 'ACTIVE'
    };
    
    StorageService.updateGoal(updatedGoal);
    setUpdateId(null);
    setAddAmount('');
    loadGoals();
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600" />
                    লক্ষ্যসমূহ (Goals)
                </h2>
                <p className="text-slate-500">আপনার ব্যবসার বিভিন্ন লক্ষ্য ঠিক করুন এবং অগ্রগতি দেখুন</p>
            </div>
            <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" /> নতুন লক্ষ্য
            </button>
        </div>

        {isAdding && (
            <form onSubmit={handleAddGoal} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm animate-fade-in">
                <h3 className="font-bold text-indigo-900 mb-4">নতুন লক্ষ্য যোগ করুন</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        placeholder="লক্ষ্যের নাম (যেমন: দোকানের ডেকোরেশন)" 
                        value={newGoal.title}
                        onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                        className="p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                        autoFocus
                    />
                    <div className="relative">
                        <span className="absolute left-3 top-3 font-bold text-slate-400">৳</span>
                        <input 
                            type="number" 
                            placeholder="টার্গেট টাকা" 
                            value={newGoal.amount}
                            onChange={e => setNewGoal({...newGoal, amount: e.target.value})}
                            className="w-full pl-8 p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">সেভ করুন</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-600 px-6 py-2 rounded-lg font-bold">বাতিল</button>
                </div>
            </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">কোনো লক্ষ্য ঠিক করা হয়নি</p>
                    <p className="text-sm">নতুন লক্ষ্য যোগ করতে উপরের বাটনে চাপ দিন</p>
                </div>
            ) : (
                goals.map(goal => {
                    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const isCompleted = goal.status === 'COMPLETED' || percentage >= 100;

                    return (
                        <div key={goal.id} className={`bg-white p-6 rounded-2xl border ${isCompleted ? 'border-emerald-200 shadow-md ring-2 ring-emerald-50' : 'border-slate-100 shadow-sm'} relative overflow-hidden transition-all hover:shadow-lg`}>
                            {isCompleted && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    COMPLETED
                                </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800">{goal.title}</h3>
                                <button onClick={() => handleDelete(goal.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>
                                        {isCompleted ? '🎉 লক্ষ্য অর্জিত!' : `${Math.round(percentage)}% সম্পন্ন`}
                                    </span>
                                    <span className="text-slate-500">৳{goal.currentAmount} / ৳{goal.targetAmount}</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                        style={{width: `${percentage}%`}}
                                    ></div>
                                </div>
                            </div>

                            {!isCompleted && (
                                <div>
                                    {updateId === goal.id ? (
                                        <div className="flex gap-2 animate-fade-in">
                                            <input 
                                                type="number" 
                                                placeholder="Amount" 
                                                value={addAmount} 
                                                onChange={e => setAddAmount(e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                autoFocus
                                            />
                                            <button onClick={() => handleAddProgress(goal)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold">Add</button>
                                            <button onClick={() => setUpdateId(null)} className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold">X</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setUpdateId(goal.id)} className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                                            <Coins className="w-4 h-4" /> টাকা জমা করুন
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            {isCompleted && (
                                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold py-2 bg-emerald-50 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5" /> অভিনন্দন!
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};