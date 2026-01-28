import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Users, UserPlus, Phone, DollarSign, Trash2 } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  salary: number;
  mobile: string;
  status: 'Active' | 'Inactive';
}

export const Staff: React.FC<{ user: User }> = ({ user }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', salary: '', mobile: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`bizmoney_staff_${user.id}`);
    if (saved) setStaff(JSON.parse(saved));
  }, [user.id]);

  const save = (data: StaffMember[]) => {
    setStaff(data);
    localStorage.setItem(`bizmoney_staff_${user.id}`, JSON.stringify(data));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const member: StaffMember = {
        id: crypto.randomUUID(),
        name: newStaff.name,
        role: newStaff.role,
        salary: Number(newStaff.salary),
        mobile: newStaff.mobile,
        status: 'Active'
    };
    save([...staff, member]);
    setNewStaff({ name: '', role: '', salary: '', mobile: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">কর্মচারী ব্যবস্থাপনা</h2>
                <p className="text-slate-500 text-sm">স্টাফ লিস্ট এবং বেতন ট্র্যাকিং</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow hover:bg-indigo-700">
                <UserPlus className="w-4 h-4" /> {showForm ? 'বাতিল' : 'নতুন কর্মী'}
            </button>
        </div>

        {showForm && (
            <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="কর্মীর নাম" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="পদবী (Role)" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})} className="border p-2 rounded" />
                <input required type="number" placeholder="বেতন (Salary)" value={newStaff.salary} onChange={e=>setNewStaff({...newStaff, salary: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="মোবাইল নম্বর" value={newStaff.mobile} onChange={e=>setNewStaff({...newStaff, mobile: e.target.value})} className="border p-2 rounded" />
                <button type="submit" className="bg-emerald-600 text-white p-2 rounded font-bold col-span-full">সেভ করুন</button>
            </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(member => (
                <div key={member.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{member.name}</h3>
                                <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full w-fit">{member.role || 'Staff'}</p>
                            </div>
                        </div>
                        <button onClick={()=>save(staff.filter(s => s.id !== member.id))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span>৳ {member.salary.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>{member.mobile || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};