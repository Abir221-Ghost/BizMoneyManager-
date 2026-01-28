import { User, Transaction, TransactionType, Goal } from '../types';

const USERS_KEY = 'bizmoney_users';
const TRANSACTIONS_KEY_PREFIX = 'bizmoney_data_';
const GOALS_KEY_PREFIX = 'bizmoney_goals_';
const SESSION_KEY = 'bizmoney_session';

export const StorageService = {
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  register: (name: string, businessName: string, businessCategory: string, mobile: string, email: string, profileImage: string): User | null => {
    const users = StorageService.getUsers();
    if (users.find(u => u.mobile === mobile)) {
      return null; // User exists
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      businessName,
      businessCategory,
      mobile,
      email,
      profileImage,
      password: '' // Passwordless / OTP based now
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  findUserByMobile: (mobile: string): User | undefined => {
      const users = StorageService.getUsers();
      return users.find(u => u.mobile === mobile);
  },

  login: (user: User): void => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  updateUser: (updatedUser: User): void => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
  },

  getTransactions: (userId: string): Transaction[] => {
    const dataStr = localStorage.getItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`);
    return dataStr ? JSON.parse(dataStr) : [];
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = StorageService.getTransactions(transaction.userId);
    transactions.push(transaction);
    localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${transaction.userId}`, JSON.stringify(transactions));
  },

  updateTransaction: (transaction: Transaction): void => {
    let transactions = StorageService.getTransactions(transaction.userId);
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      transactions[index] = transaction;
      localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${transaction.userId}`, JSON.stringify(transactions));
    }
  },

  deleteTransaction: (userId: string, transactionId: string): void => {
    let transactions = StorageService.getTransactions(userId);
    transactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`, JSON.stringify(transactions));
  },
  
  getParties: (userId: string): string[] => {
    const transactions = StorageService.getTransactions(userId);
    const parties = new Set<string>();
    transactions.forEach(t => {
      if (t.partyName) parties.add(t.partyName);
    });
    return Array.from(parties);
  },
  
  calculateBalance: (userId: string): number => {
    const txs = StorageService.getTransactions(userId);
    return txs.reduce((acc, curr) => {
      if (curr.isDue && !curr.isSettled) return acc;
      return curr.type === TransactionType.INCOME ? acc + curr.amount : acc - curr.amount;
    }, 0);
  },

  // --- Goals Management ---

  getGoals: (userId: string): Goal[] => {
    const str = localStorage.getItem(`${GOALS_KEY_PREFIX}${userId}`);
    return str ? JSON.parse(str) : [];
  },

  addGoal: (goal: Goal): void => {
    const goals = StorageService.getGoals(goal.userId);
    goals.push(goal);
    localStorage.setItem(`${GOALS_KEY_PREFIX}${goal.userId}`, JSON.stringify(goals));
  },

  updateGoal: (goal: Goal): void => {
    const goals = StorageService.getGoals(goal.userId);
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
      localStorage.setItem(`${GOALS_KEY_PREFIX}${goal.userId}`, JSON.stringify(goals));
    }
  },

  deleteGoal: (userId: string, goalId: string): void => {
    let goals = StorageService.getGoals(userId);
    goals = goals.filter(g => g.id !== goalId);
    localStorage.setItem(`${GOALS_KEY_PREFIX}${userId}`, JSON.stringify(goals));
  },

  // --- Backup & Restore ---

  exportData: (userId: string): string => {
    const transactions = StorageService.getTransactions(userId);
    const goals = StorageService.getGoals(userId);
    const user = StorageService.getCurrentUser();
    const data = {
      user,
      transactions,
      goals,
      exportDate: new Date().toISOString(),
      version: '1.1'
    };
    return JSON.stringify(data);
  },

  // Simplified Import (Internal use if needed, but UI removed as requested)
  importData: (userId: string, jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.transactions) return false;
      localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`, JSON.stringify(data.transactions));
      if (data.goals) localStorage.setItem(`${GOALS_KEY_PREFIX}${userId}`, JSON.stringify(data.goals));
      return true;
    } catch (e) {
      return false;
    }
  }
};