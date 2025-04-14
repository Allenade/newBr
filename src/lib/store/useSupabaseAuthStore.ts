import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/services/db/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Methods
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;

  // Mock methods for preview
  mockSignIn: () => void;
}

// Check if we're in the preview environment
const isPreview =
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

// Initialize Supabase client
const supabase = createClient();

export const useSupabaseAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // For preview, check localStorage for mock user
      if (isPreview) {
        const mockUser = localStorage.getItem("mockUser");
        if (mockUser) {
          const user = JSON.parse(mockUser);
          set({
            user,
            session: { user } as Session,
            isLoading: false,
          });
          return;
        }
        set({ isLoading: false });
        return;
      }

      // Check for active session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session) {
        set({
          user: session.user,
          session,
        });
      }

      // Set up auth state listener
      await supabase.auth.onAuthStateChange(
        (_event: string, session: Session | null) => {
          set({
            user: session?.user || null,
            session,
          });
        }
      );

      // We don't need to store or return the unsubscribe function
      // since the interface expects void
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // For preview, use mock sign in
      if (isPreview) {
        if (email === "demo@example.com" && password === "password") {
          const mockUser = {
            id: "mock-user-id",
            email: "demo@example.com",
            user_metadata: {
              first_name: "Demo",
              last_name: "User",
            },
          };
          localStorage.setItem("mockUser", JSON.stringify(mockUser));
          set({
            user: mockUser as unknown as User,
            session: { user: mockUser } as unknown as Session,
            isLoading: false,
          });
          return;
        } else {
          throw new Error("Invalid email or password");
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      set({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      set({ isLoading: true, error: null });

      // For preview, use mock sign up
      if (isPreview) {
        const mockUser = {
          id: "mock-user-id",
          email,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
          },
        };
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
        set({
          user: mockUser as unknown as User,
          session: { user: mockUser } as unknown as Session,
          isLoading: false,
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Note: Supabase might require email verification
      set({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Error signing up:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      // For preview, clear mock user
      if (isPreview) {
        localStorage.removeItem("mockUser");
        set({
          user: null,
          session: null,
          isLoading: false,
        });
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      set({
        user: null,
        session: null,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  // Mock method for preview testing
  mockSignIn: () => {
    const mockUser = {
      id: "mock-user-id",
      email: "demo@example.com",
      user_metadata: {
        first_name: "Demo",
        last_name: "User",
      },
    };
    localStorage.setItem("mockUser", JSON.stringify(mockUser));
    set({
      user: mockUser as unknown as User,
      session: { user: mockUser } as unknown as Session,
    });
  },
}));
