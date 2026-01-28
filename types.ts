
export interface User {
  id: string;
  name: string; // Full Name
  businessName: string; 
  businessCategory: string;
  mobile: string;
  password?: string;
  // New Fields for Profile & Card
  email?: string;
  address?: string;
  website?: string;
  profileImage?: string; // Base64 string
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string; // Source/Purpose
  note?: string;
  date: string;
  timestamp: number;
  isDue: boolean; // True if it is Baki
  partyName?: string; // Name of person for Baki
  dueDate?: string; // Date when payment is expected
  isSettled?: boolean; // True if the due is paid back
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  balance: number;
}