import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate validation
      if (email === "demo@example.com" && password === "password") {
        const user = {
          id: "1",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
        };

        set({ user, isAuthenticated: true, loading: false });
        return user;
      }

      set({ loading: false, error: "Invalid email or password" });
      throw new Error("Invalid email or password");
    } catch (error) {
      set({ loading: false, error: "Login failed" });
      throw error;
    }
  },

  signup: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    set({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = {
        id: "2",
        email,
        firstName,
        lastName,
      };

      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (error) {
      set({ loading: false, error: "Signup failed" });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      set({ loading: false, error: "Logout failed" });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
