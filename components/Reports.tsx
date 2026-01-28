import React, { useState, useEffect, useMemo } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { PdfService } from '../services/pdfService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { Brain, FileText, Calendar, Loader2, Download, Lock, CheckCircle, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportsProps {
  user: User;
}

export const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<'month' | 'all'>('month');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const txs = StorageService.getTransactions(user.id);
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp));
    setAiAnalysis('');
  }, [user.id]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredTxs = useMemo(() => {
    return period === 'month' 
      ? transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
      : transactions;
  }, [transactions, period, currentMonth, currentYear]);

  const { totalIncome, totalExpense, netProfit, expenseCategories } = useMemo(() => {
    const income = filteredTxs.filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0);
    const expense = filteredTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0);
    
    const cats = filteredTxs
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
        totalIncome: income,
        totalExpense: expense,
        netProfit: income - expense,
        expenseCategories: cats
    };
  }, [filteredTxs]);

  const pieData = Object.keys(expenseCategories).map(key => ({
    name: key,
    value: expenseCategories[key]
  }));

  const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

  const handleAIAnalyze = async () => {
    if (filteredTxs.length === 0) return;
    setIsAnalyzing(true);
    const result = await GeminiService.analyzeFinancials(
      filteredTxs, 
      period === 'month' ? `Monthly Report ${currentYear}` : 'All Time'
    );
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const periodName = period === 'month' ? `${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}` : 'All Time History';
    const fileName = `BizReport_${periodName.replace(/\s/g, '_')}.pdf`;
    
    setTimeout(async () => {
        await PdfService.exportToPdf('report-template', fileName, 'a4');
        setIsGeneratingPdf(false);
    }, 100);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ব্যবসায়িক রিপোর্ট</h2>
          <p className="text-slate-500">বিস্তারিত হিসাব এবং এআই পরামর্শ</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'month' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                এই মাস
            </button>
            <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                সব সময়
            </button>
            </div>
            
            <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-all active:scale-95 disabled:opacity-70"
            >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                {isGeneratingPdf ? 'তৈরি হচ্ছে...' : 'পিডিএফ'}
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
          <p className="text-sm text-slate-500 mb-1">মোট আয় (Income)</p>
          <p className="text-2xl font-bold text-emerald-600">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
          <p className="text-sm text-slate-500 mb-1">মোট ব্যয় (Expense)</p>
          <p className="text-2xl font-bold text-rose-600">৳{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
          <p className="text-sm text-slate-500 mb-1">নিট লাভ/ক্ষতি</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
            {netProfit >= 0 ? '+' : ''}৳{netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-500" />
            ব্যয়ের খাতসমূহ
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value: number) => `৳${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Calendar className="w-12 h-12 mb-2 opacity-50" />
               <p>এই সময়ে কোনো খরচ নেই।</p>
             </div>
          )}
        </div>

        {/* AI Advisor Section */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              এআই পরামর্শদাতা
            </h3>
            {!aiAnalysis && (
              <button
                onClick={handleAIAnalyze}
                disabled={isAnalyzing || filteredTxs.length === 0}
                className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                {isAnalyzing ? 'বিশ্লেষণ হচ্ছে...' : 'রিপোর্ট তৈরি করুন'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-white/5 rounded-lg p-4 overflow-y-auto max-h-[400px] border border-white/10 scrollbar-thin scrollbar-thumb-indigo-500">
            {aiAnalysis ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                <button 
                  onClick={() => setAiAnalysis('')} 
                  className="mt-4 text-xs text-indigo-300 hover:text-white underline"
                >
                  Clear Analysis
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                 {filteredTxs.length > 0 ? (
                    <>
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="mb-2">আপনার ব্যবসার উন্নতির জন্য পরামর্শ নিন।</p>
                      <p className="text-sm opacity-60">'রিপোর্ট তৈরি করুন' বাটনে চাপ দিন।</p>
                    </>
                 ) : (
                    <p>পরামর্শ পেতে কিছু লেনদেন যোগ করুন।</p>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- HIDDEN PRINTABLE TEMPLATE (A4) --- */}
      {/* Width fixed at 794px for A4 @ 96 DPI. Important for PDF gen consistency on mobile */}
      <div id="report-template" className="hidden" style={{ width: '794px', minHeight: '1123px', background: 'white', padding: '40px', fontFamily: 'sans-serif', position: 'absolute', top: 0, zIndex: -10 }}>
          {/* Header */}
          <div className="bg-emerald-900 text-white p-8 rounded-t-xl flex justify-between items-center mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10">
                <div className="w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
             </div>
             <div className="z-10">
                 <h1 className="text-3xl font-bold uppercase tracking-wider">{user.businessName}</h1>
                 <p className="opacity-80 mt-1">{user.businessCategory}</p>
                 <div className="mt-4 text-sm opacity-70">
                    <p>Owner: {user.name}</p>
                    <p>Mobile: {user.mobile}</p>
                    <p>{user.address}</p>
                 </div>
             </div>
             <div className="text-right z-10">
                 <h2 className="text-xl font-bold border-b border-emerald-700 pb-2 mb-2">FINANCIAL REPORT</h2>
                 <p className="text-sm font-medium">{period === 'month' ? `${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}` : 'All Time History'}</p>
                 <p className="text-xs opacity-60 mt-1">Generated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Total Income</p>
                  <p className="text-2xl font-bold text-emerald-800">৳ {totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
                  <p className="text-xs font-bold text-rose-600 uppercase mb-2">Total Expense</p>
                  <p className="text-2xl font-bold text-rose-800">৳ {totalExpense.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {netProfit >= 0 ? '+' : ''}৳ {netProfit.toLocaleString()}
                  </p>
              </div>
          </div>

          {/* Table */}
          <div className="mb-8">
              <table className="w-full text-sm">
                  <thead>
                      <tr className="bg-slate-800 text-white">
                          <th className="py-3 px-4 text-left rounded-tl-lg">Date</th>
                          <th className="py-3 px-4 text-left">Description</th>
                          <th className="py-3 px-4 text-left">Party / Note</th>
                          <th className="py-3 px-4 text-left">Type</th>
                          <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredTxs.map((t, idx) => (
                          <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-3 px-4 border-b border-slate-100 text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 border-b border-slate-100 font-medium text-slate-800">{t.category}</td>
                              <td className="py-3 px-4 border-b border-slate-100 text-slate-500">
                                {t.partyName ? (
                                    <span>
                                        <span className="font-semibold text-slate-700">{t.partyName}</span>
                                        {t.isDue && <span className="ml-1 text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">{t.isSettled ? 'PAID' : 'DUE'}</span>}
                                    </span>
                                ) : t.note || '-'}
                              </td>
                              <td className="py-3 px-4 border-b border-slate-100">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {t.type}
                                  </span>
                              </td>
                              <td className={`py-3 px-4 border-b border-slate-100 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  ৳ {t.amount.toLocaleString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
             <p>This report is computer generated by BizMoney Manager.</p>
             <p>Page 1 of 1</p>
          </div>
      </div>
    </div>
  );
};