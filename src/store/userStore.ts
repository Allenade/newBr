import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface Account {
  balance: number;
  total_profit: number;
  bonus: number;
  trading_account: string;
  earnings: number;
}

type UserState = {
  user: User | null;
  account: Account | null;
  setUser: (user: User) => void;
  setAccount: (account: Account) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  account: null,
  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
}));
