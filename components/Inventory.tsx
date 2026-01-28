import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Package, Plus, Trash2, Search, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
}

export const Inventory: React.FC<{ user: User }> = ({ user }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', qty: '', buy: '', sell: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`bizmoney_inventory_${user.id}`);
    if (saved) setItems(JSON.parse(saved));
  }, [user.id]);

  const save = (data: InventoryItem[]) => {
    setItems(data);
    localStorage.setItem(`bizmoney_inventory_${user.id}`, JSON.stringify(data));
  };

  const handleAdd = () => {
    if(!newItem.name) return;
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItem.name,
      qty: Number(newItem.qty) || 0,
      buyPrice: Number(newItem.buy) || 0,
      sellPrice: Number(newItem.sell) || 0
    };
    save([item, ...items]);
    setNewItem({ name: '', qty: '', buy: '', sell: '' });
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
           <div>
               <h2 className="text-2xl font-bold text-slate-800">স্টক ম্যানেজমেন্ট</h2>
               <p className="text-slate-500 text-sm">পন্যের মজুদ এবং লাভ/ক্ষতির হিসাব</p>
           </div>
           <div className="relative">
               <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
               <input type="text" placeholder="পণ্য খুঁজুন..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
           </div>
       </div>

       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
           <div className="md:col-span-2">
               <label className="text-xs font-bold text-slate-500">পন্যের নাম</label>
               <input type="text" value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="নাম লিখুন" />
           </div>
           <div>
               <label className="text-xs font-bold text-slate-500">পরিমাণ (Qty)</label>
               <input type="number" value={newItem.qty} onChange={e=>setNewItem({...newItem, qty: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="0" />
           </div>
           <div>
               <label className="text-xs font-bold text-slate-500">বিক্রয় মূল্য</label>
               <input type="number" value={newItem.sell} onChange={e=>setNewItem({...newItem, sell: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="৳ 0" />
           </div>
           <button onClick={handleAdd} className="bg-emerald-600 text-white p-2.5 rounded hover:bg-emerald-700 flex justify-center items-center gap-2 font-bold text-sm">
               <Plus className="w-4 h-4" /> যোগ করুন
           </button>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500">
                   <tr>
                       <th className="p-4">পণ্য</th>
                       <th className="p-4 text-center">স্টক</th>
                       <th className="p-4 text-right">বিক্রয় মূল্য</th>
                       <th className="p-4 text-right">সম্ভাব্য লাভ</th>
                       <th className="p-4 text-center">অ্যাকশন</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                   {filtered.map(item => (
                       <tr key={item.id} className="hover:bg-slate-50">
                           <td className="p-4 font-medium text-slate-800">{item.name}</td>
                           <td className="p-4 text-center">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${item.qty < 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                   {item.qty} pcs
                               </span>
                               {item.qty < 5 && <AlertTriangle className="w-3 h-3 text-rose-500 inline ml-1" />}
                           </td>
                           <td className="p-4 text-right font-mono">৳ {item.sellPrice}</td>
                           <td className="p-4 text-right font-mono text-emerald-600">৳ {(item.sellPrice - item.buyPrice) * item.qty}</td>
                           <td className="p-4 text-center">
                               <button onClick={()=>save(items.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-rose-600">
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
           {filtered.length === 0 && <div className="p-8 text-center text-slate-400">স্টকে কোনো পণ্য নেই।</div>}
       </div>
    </div>
  );
};